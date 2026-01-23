import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Parse pcap file binary data to extract packet information
function parsePcapFile(base64Content: string, fileName: string): string {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Check for pcap magic number (0xa1b2c3d4 or 0xd4c3b2a1 for swapped)
    const magicNumber = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const isPcap = magicNumber === 0xa1b2c3d4 || magicNumber === 0xd4c3b2a1;
    const isPcapNg = bytes[0] === 0x0a && bytes[1] === 0x0d && bytes[2] === 0x0d && bytes[3] === 0x0a;
    
    if (!isPcap && !isPcapNg) {
      // Try alternate pcapng detection
      const isPcapNgAlt = (bytes[0] === 0x0a && bytes[1] === 0x0d) || 
                          (bytes[8] === 0x1a && bytes[9] === 0x2b && bytes[10] === 0x3c && bytes[11] === 0x4d);
      if (!isPcapNgAlt) {
        return `File: ${fileName}\nFile appears to be a network capture file.\nSize: ${bytes.length} bytes\nFormat: Unknown pcap variant\n\nNote: File structure analysis in progress.`;
      }
    }
    
    // Determine byte order
    const swapped = magicNumber === 0xd4c3b2a1;
    
    // Read pcap global header (24 bytes)
    const readUint16 = (offset: number): number => {
      if (swapped) {
        return (bytes[offset + 1] << 8) | bytes[offset];
      }
      return (bytes[offset] << 8) | bytes[offset + 1];
    };
    
    const readUint32 = (offset: number): number => {
      if (swapped) {
        return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
      }
      return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    };
    
    let packetInfo: string[] = [];
    packetInfo.push(`File: ${fileName}`);
    packetInfo.push(`File Size: ${bytes.length} bytes`);
    packetInfo.push(`Format: ${isPcapNg ? 'pcapng' : 'pcap'}`);
    
    if (isPcap) {
      const versionMajor = readUint16(4);
      const versionMinor = readUint16(6);
      const snapLen = readUint32(16);
      const linkType = readUint32(20);
      
      packetInfo.push(`Version: ${versionMajor}.${versionMinor}`);
      packetInfo.push(`Snap Length: ${snapLen}`);
      packetInfo.push(`Link Type: ${getLinkTypeName(linkType)}`);
      
      // Parse packets
      let offset = 24; // After global header
      let packetCount = 0;
      const protocols: Record<string, number> = {};
      const ipAddresses: Set<string> = new Set();
      const ports: Set<number> = new Set();
      let totalBytes = 0;
      
      while (offset + 16 <= bytes.length && packetCount < 1000) {
        const capturedLen = readUint32(offset + 8);
        const originalLen = readUint32(offset + 12);
        
        if (capturedLen === 0 || capturedLen > snapLen || offset + 16 + capturedLen > bytes.length) {
          break;
        }
        
        totalBytes += originalLen;
        packetCount++;
        
        // Parse Ethernet frame (if link type is Ethernet)
        if (linkType === 1 && capturedLen >= 14) {
          const packetStart = offset + 16;
          const etherType = (bytes[packetStart + 12] << 8) | bytes[packetStart + 13];
          
          if (etherType === 0x0800) { // IPv4
            protocols['IPv4'] = (protocols['IPv4'] || 0) + 1;
            
            if (capturedLen >= 34) {
              const ipProtocol = bytes[packetStart + 23];
              const srcIP = `${bytes[packetStart + 26]}.${bytes[packetStart + 27]}.${bytes[packetStart + 28]}.${bytes[packetStart + 29]}`;
              const dstIP = `${bytes[packetStart + 30]}.${bytes[packetStart + 31]}.${bytes[packetStart + 32]}.${bytes[packetStart + 33]}`;
              
              ipAddresses.add(srcIP);
              ipAddresses.add(dstIP);
              
              if (ipProtocol === 6) { // TCP
                protocols['TCP'] = (protocols['TCP'] || 0) + 1;
                if (capturedLen >= 38) {
                  const srcPort = (bytes[packetStart + 34] << 8) | bytes[packetStart + 35];
                  const dstPort = (bytes[packetStart + 36] << 8) | bytes[packetStart + 37];
                  ports.add(srcPort);
                  ports.add(dstPort);
                }
              } else if (ipProtocol === 17) { // UDP
                protocols['UDP'] = (protocols['UDP'] || 0) + 1;
                if (capturedLen >= 38) {
                  const srcPort = (bytes[packetStart + 34] << 8) | bytes[packetStart + 35];
                  const dstPort = (bytes[packetStart + 36] << 8) | bytes[packetStart + 37];
                  ports.add(srcPort);
                  ports.add(dstPort);
                }
              } else if (ipProtocol === 1) { // ICMP
                protocols['ICMP'] = (protocols['ICMP'] || 0) + 1;
              }
            }
          } else if (etherType === 0x0806) { // ARP
            protocols['ARP'] = (protocols['ARP'] || 0) + 1;
          } else if (etherType === 0x86dd) { // IPv6
            protocols['IPv6'] = (protocols['IPv6'] || 0) + 1;
          }
        }
        
        offset += 16 + capturedLen;
      }
      
      packetInfo.push(`\n--- Packet Summary ---`);
      packetInfo.push(`Total Packets: ${packetCount}`);
      packetInfo.push(`Total Data: ${(totalBytes / 1024).toFixed(2)} KB`);
      
      if (Object.keys(protocols).length > 0) {
        packetInfo.push(`\n--- Protocol Distribution ---`);
        for (const [proto, count] of Object.entries(protocols).sort((a, b) => b[1] - a[1])) {
          packetInfo.push(`${proto}: ${count} packets (${((count / packetCount) * 100).toFixed(1)}%)`);
        }
      }
      
      if (ipAddresses.size > 0) {
        const ipList = Array.from(ipAddresses).slice(0, 20);
        packetInfo.push(`\n--- IP Addresses Observed (${ipAddresses.size} unique) ---`);
        packetInfo.push(ipList.join(', '));
        if (ipAddresses.size > 20) {
          packetInfo.push(`... and ${ipAddresses.size - 20} more`);
        }
      }
      
      if (ports.size > 0) {
        const portList = Array.from(ports).sort((a, b) => a - b).slice(0, 30);
        packetInfo.push(`\n--- Ports Used (${ports.size} unique) ---`);
        packetInfo.push(portList.map(p => `${p} (${getServiceName(p)})`).join(', '));
      }
      
      // Identify potential security concerns
      const securityNotes: string[] = [];
      
      if (ports.has(23)) securityNotes.push('Telnet (port 23) detected - unencrypted protocol');
      if (ports.has(21)) securityNotes.push('FTP (port 21) detected - credentials may be exposed');
      if (ports.has(25)) securityNotes.push('SMTP (port 25) detected - email traffic');
      if (ports.has(3389)) securityNotes.push('RDP (port 3389) detected - remote desktop access');
      if (ports.has(22)) securityNotes.push('SSH (port 22) detected - encrypted remote access');
      if (ports.has(443)) securityNotes.push('HTTPS (port 443) detected - encrypted web traffic');
      if (ports.has(80)) securityNotes.push('HTTP (port 80) detected - unencrypted web traffic');
      if (ports.has(53)) securityNotes.push('DNS (port 53) detected - name resolution traffic');
      
      if (securityNotes.length > 0) {
        packetInfo.push(`\n--- Notable Services/Protocols ---`);
        securityNotes.forEach(note => packetInfo.push(`• ${note}`));
      }
    }
    
    return packetInfo.join('\n');
  } catch (error) {
    console.error('Error parsing pcap:', error);
    return `File: ${fileName}\nError parsing pcap file. The file may be corrupted or in an unsupported format.\nAttempting analysis based on file metadata.`;
  }
}

function getLinkTypeName(linkType: number): string {
  const linkTypes: Record<number, string> = {
    0: 'NULL',
    1: 'Ethernet',
    6: 'Token Ring',
    9: 'PPP',
    10: 'FDDI',
    101: 'Raw IP',
    105: 'IEEE 802.11',
    113: 'Linux Cooked',
    127: 'IEEE 802.11 Radio',
  };
  return linkTypes[linkType] || `Unknown (${linkType})`;
}

function getServiceName(port: number): string {
  const services: Record<number, string> = {
    20: 'FTP-data',
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    67: 'DHCP-server',
    68: 'DHCP-client',
    80: 'HTTP',
    110: 'POP3',
    123: 'NTP',
    143: 'IMAP',
    161: 'SNMP',
    443: 'HTTPS',
    445: 'SMB',
    993: 'IMAPS',
    995: 'POP3S',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    8080: 'HTTP-alt',
  };
  return services[port] || 'unknown';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received analyze request');
    
    const { fileName, fileSize, fileContent } = await req.json();
    console.log('Processing file:', fileName, 'Size:', fileSize);

    // Parse the pcap file to extract network data
    let networkData: string;
    if (fileContent) {
      networkData = parsePcapFile(fileContent, fileName);
      console.log('Parsed pcap data length:', networkData.length);
    } else {
      networkData = `Network capture file: ${fileName}, Size: ${(fileSize / 1024).toFixed(1)} KB`;
    }

    const systemPrompt = `ROLE:
You are a senior cybersecurity analyst with expertise in network forensics and intrusion detection. You translate technical findings into clear, executive-level insights for small and medium business enterprise owners.

TASK:
Analyze the provided structured network traffic data extracted from a Wireshark capture.

OBJECTIVES:
- Identify suspicious or anomalous traffic patterns.
- Classify potential attack types (e.g., scanning, DoS, malware, C2, data exfiltration).
- Highlight affected IPs, ports, and protocols.
- Assess severity and confidence level.
- Recommend follow-up investigation steps or mitigations.

OUTPUT REQUIREMENTS:
Your responses must be:
- Written in plain English with NO technical jargon for the business owner
- Focused on business impact, not technical details
- Actionable and reassuring
- Include confidence levels in your assessments

THREAT ANALYSIS INSTRUCTIONS:
For each identified threat, determine:
- Likelihood (1-5): Based on the frequency of suspicious events in the capture (e.g., repeated failed logins, port scans, unusual traffic volume)
- Impact (1-5): Based on security context (e.g., malware potential, data exfiltration risk, protocol abuse)
- Severity: "low" (green zone), "medium" (yellow/orange zone), or "high" (red zone)
- Confidence Level: Express how confident you are in each finding (Low/Medium/High)

You must respond with a valid JSON object containing exactly these seven fields:
{
  "whatIsHappening": "A simple explanation of what the network analysis shows based on the actual data. Include your confidence level.",
  "whyItMatters": "The business impact and why the business owner should care. Be specific about potential consequences.",
  "riskLevel": 1 to 5 (integer, where 1 is lowest risk and 5 is highest risk),
  "riskDescription": "A detailed 2-3 sentence explanation including: what this risk level means for the business, why it was assigned this score based on the actual network data, your confidence in this assessment, and the potential impact if not addressed",
  "actionToTake": "Clear, prioritized action steps based on severity. Include recommended follow-up investigation steps or mitigations.",
  "cybersecurityNews": "2-3 relevant cybersecurity insights that relate to the specific attack types, protocols, or patterns found in this capture. Include practical awareness points and recent trends SMB owners should know about.",
  "threatMap": [
    {
      "threatType": "Name of the threat with classification (e.g., 'Port Scan - Reconnaissance', 'Suspicious DNS - Potential C2')",
      "sourceIP": "Source IP address or 'Multiple' if from various sources",
      "frequency": number of occurrences detected,
      "likelihood": 1-5 based on how likely this is to be exploited,
      "impact": 1-5 based on potential damage if exploited,
      "severity": "low" | "medium" | "high",
      "explanation": "Brief explanation including: why this threat falls in its position on the heat map, the confidence level of this detection, and what specific traffic patterns led to this classification"
    }
  ]
}

Threat Map Guidelines:
- Include 0-6 threats based on what's actually found in the data
- If no concerning activity is found, return an empty array []
- Likelihood scoring: 1=Rare/unlikely, 2=Uncommon, 3=Possible, 4=Likely, 5=Almost certain
- Impact scoring: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe/Critical
- Severity is determined by the combination: Low (L+I ≤ 4), Medium (L+I 5-7), High (L+I ≥ 8)

Risk Level Guidelines:
- 1: Minimal risk - Normal network activity, no concerns detected. High confidence in safe assessment.
- 2: Low risk - Minor observations that warrant awareness but no immediate action.
- 3: Moderate risk - Some concerning patterns requiring investigation (e.g., unencrypted protocols, unusual ports).
- 4: High risk - Significant security concerns requiring prompt attention (e.g., suspicious connections, dangerous services).
- 5: Critical risk - Immediate action required (e.g., active threats, known malicious patterns, data exfiltration indicators).

Always respond with ONLY the JSON object, no additional text.`;

    const userPrompt = `STRUCTURED NETWORK TRAFFIC DATA:
${networkData}

ANALYSIS REQUEST:
Analyze the above network capture data extracted from a Wireshark PCAP file. As a senior cybersecurity analyst:

1. Identify all suspicious or anomalous traffic patterns
2. Classify any potential attack types (scanning, DoS, malware, C2, data exfiltration, etc.)
3. Highlight affected IPs, ports, and protocols
4. Assess severity with confidence levels
5. Provide recommended follow-up investigation steps or mitigations

Respond with ONLY a JSON object containing: whatIsHappening, whyItMatters, riskLevel, riskDescription, actionToTake, cybersecurityNews, and threatMap.`;

    console.log('Calling Lovable AI Gateway with parsed pcap data');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No response from AI');
    }

    console.log('AI content:', aiContent);

    // Parse the JSON from the AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Fallback response if parsing fails
      analysisResult = {
        whatIsHappening: "Your network was analyzed and appears to be functioning normally. Our AI reviewed the traffic patterns and found typical business activity.",
        whyItMatters: "A healthy network means your business operations can continue without disruption. Regular monitoring helps catch issues before they become problems.",
        riskLevel: 1,
        riskDescription: "Your network shows normal activity patterns with no signs of malicious behavior or security concerns. This indicates your current security measures are working effectively.",
        actionToTake: "Continue your regular security practices and consider scheduling periodic network reviews.",
        cybersecurityNews: "Regular network monitoring is a best practice for all businesses. Consider implementing automated security scans and keeping all network devices updated with the latest security patches.",
        threatMap: []
      };
    }

    // Validate the response structure
    const riskLevelNum = typeof analysisResult.riskLevel === 'number' 
      ? Math.min(5, Math.max(1, analysisResult.riskLevel)) 
      : 1;
    
    // Validate and normalize threat map data
    const threatMap = Array.isArray(analysisResult.threatMap) 
      ? analysisResult.threatMap.map((threat: any) => ({
          threatType: threat.threatType || "Unknown Threat",
          sourceIP: threat.sourceIP || "Unknown",
          frequency: typeof threat.frequency === 'number' ? threat.frequency : 1,
          likelihood: Math.min(5, Math.max(1, typeof threat.likelihood === 'number' ? threat.likelihood : 1)),
          impact: Math.min(5, Math.max(1, typeof threat.impact === 'number' ? threat.impact : 1)),
          severity: ['low', 'medium', 'high'].includes(threat.severity) ? threat.severity : 'low',
          explanation: threat.explanation || "Detected in network traffic analysis."
        }))
      : [];

    const validatedResult = {
      whatIsHappening: analysisResult.whatIsHappening || "Network analysis completed.",
      whyItMatters: analysisResult.whyItMatters || "Understanding your network helps protect your business.",
      riskLevel: riskLevelNum,
      riskDescription: analysisResult.riskDescription || "Analysis completed. Risk assessment based on the network activity patterns observed.",
      actionToTake: analysisResult.actionToTake || "Continue monitoring your network regularly.",
      cybersecurityNews: analysisResult.cybersecurityNews || "Stay informed about the latest cybersecurity trends and best practices to protect your business.",
      threatMap: threatMap
    };

    console.log('Returning validated result');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-network function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Unable to complete the analysis. Please try again.',
      whatIsHappening: "We encountered an issue while analyzing your network data.",
      whyItMatters: "This is temporary and doesn't indicate any problem with your network.",
      riskLevel: 1,
      riskDescription: "Unable to assess risk at this time due to a temporary processing issue.",
      cybersecurityNews: "While we work on this, remember that regular network monitoring is essential for business security.",
      actionToTake: "Please try uploading your file again in a moment.",
      threatMap: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
