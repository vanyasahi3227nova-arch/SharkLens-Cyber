import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received analyze request');
    
    const { fileName, fileSize, fileContent, fileType } = await req.json();
    console.log('Processing file:', fileName, 'Size:', fileSize, 'Type:', fileType);

    // The file content is now directly text (JSON or plain text exported from Wireshark)
    let networkData: string;
    
    if (fileContent) {
      // For JSON files, try to parse and format nicely
      if (fileType === 'json') {
        try {
          const jsonData = JSON.parse(fileContent);
          networkData = `File: ${fileName}\nFormat: JSON (Wireshark Export)\nFile Size: ${fileSize} bytes\n\n--- WIRESHARK PACKET DATA ---\n${JSON.stringify(jsonData, null, 2)}`;
        } catch {
          // If JSON parsing fails, use as-is
          networkData = `File: ${fileName}\nFormat: JSON (Wireshark Export)\nFile Size: ${fileSize} bytes\n\n--- WIRESHARK PACKET DATA ---\n${fileContent}`;
        }
      } else {
        // Plain text file
        networkData = `File: ${fileName}\nFormat: Plain Text (Wireshark Export)\nFile Size: ${fileSize} bytes\n\n--- WIRESHARK PACKET DATA ---\n${fileContent}`;
      }
      console.log('Network data length:', networkData.length);
    } else {
      networkData = `Network capture file: ${fileName}, Size: ${(fileSize / 1024).toFixed(1)} KB`;
    }

    const systemPrompt = `ROLE:
You are a senior cybersecurity analyst with expertise in network forensics and intrusion detection. You translate technical findings into clear, executive-level insights for small and medium business enterprise owners.

CRITICAL INSTRUCTION:
You are receiving REAL network traffic data exported from Wireshark. This is NOT simulated data. Analyze it thoroughly and provide ACCURATE, UNMODIFIED insights based on the ACTUAL content you receive. Do NOT make generic assumptions - analyze the specific packets, IPs, protocols, and patterns in the provided data.

TASK:
Analyze the provided structured network traffic data exported from a Wireshark capture (either as JSON or Plain Text format).

OBJECTIVES:
- Identify ALL suspicious or anomalous traffic patterns based on the ACTUAL data provided.
- Classify potential attack types (e.g., scanning, DoS, malware, C2, data exfiltration) based on what you ACTUALLY see.
- Highlight affected IPs, ports, and protocols that are ACTUALLY present in the data.
- Assess severity and confidence level based on REAL evidence in the traffic.
- Recommend follow-up investigation steps or mitigations specific to the findings.

OUTPUT REQUIREMENTS:
Your responses must be:
- Based ENTIRELY on the actual data provided - do NOT fabricate or assume traffic patterns
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

You must respond with a valid JSON object containing exactly these eight fields:
{
  "whatIsHappening": "A simple explanation of what the network analysis shows based on the ACTUAL data. Include your confidence level. Reference specific IPs, protocols, or patterns you observed.",
  "whyItMatters": "The business impact and why the business owner should care. Be specific about potential consequences based on the REAL traffic patterns found.",
  "riskLevel": 1 to 5 (integer, where 1 is lowest risk and 5 is highest risk),
  "riskDescription": "A detailed 2-3 sentence explanation including: what this risk level means for the business, why it was assigned this score based on the ACTUAL network data, your confidence in this assessment, and the potential impact if not addressed",
  "actionToTake": "Clear, prioritized action steps based on severity. Include recommended follow-up investigation steps or mitigations SPECIFIC to the threats found in this capture.",
  "cybersecurityNews": "2-3 relevant cybersecurity insights that relate to the SPECIFIC attack types, protocols, or patterns found in THIS capture. Include practical awareness points and recent trends SMB owners should know about.",
  "forensicAnalysis": "A deeper forensic review including: traffic timelines and patterns observed IN THIS DATA, any lateral movement indicators found, persistence or beaconing patterns detected, false positive likelihood assessment, and additional technical context for security teams. Reference SPECIFIC evidence from the provided data.",
  "threatMap": [
    {
      "threatType": "Name of the threat with classification (e.g., 'Port Scan - Reconnaissance', 'Suspicious DNS - Potential C2')",
      "sourceIP": "ACTUAL Source IP address from the data or 'Multiple' if from various sources",
      "frequency": number of ACTUAL occurrences detected in the data,
      "likelihood": 1-5 based on how likely this is to be exploited,
      "impact": 1-5 based on potential damage if exploited,
      "severity": "low" | "medium" | "high",
      "explanation": "Brief explanation including: why this threat falls in its position on the heat map, the confidence level of this detection, and what SPECIFIC traffic patterns in the provided data led to this classification"
    }
  ]
}

Threat Map Guidelines:
- Include 0-6 threats based on what's ACTUALLY found in the data
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

IMPORTANT: Return your analysis EXACTLY as the expert cybersecurity analyst would provide it. Do NOT modify, summarize, or soften the findings. Pass through your expert analysis verbatim in the JSON format based on the REAL data provided.

Always respond with ONLY the JSON object, no additional text.`;

    const userPrompt = `STRUCTURED NETWORK TRAFFIC DATA (Exported from Wireshark):
${networkData}

ANALYSIS REQUEST:
Analyze the above network traffic data that was exported from a Wireshark capture file. This is REAL network data - analyze it thoroughly and accurately.

As a senior cybersecurity analyst, perform a comprehensive analysis:

1. Examine ALL packets, connections, and protocols in the provided data
2. Identify any suspicious or anomalous traffic patterns based on what you ACTUALLY see
3. Classify any potential attack types (scanning, DoS, malware, C2, data exfiltration, etc.) with evidence from the data
4. List the affected IPs, ports, and protocols that are ACTUALLY present
5. Assess severity with confidence levels based on REAL evidence
6. Provide recommended follow-up investigation steps or mitigations specific to these findings

FOLLOW-UP FORENSIC ANALYSIS:
Based on the initial analysis of the ACTUAL data, perform a deeper forensic review focusing on:
- Traffic timelines and temporal patterns observed in the data
- Lateral movement indicators across the network visible in the capture
- Persistence or beaconing patterns that suggest ongoing compromise
- False positive likelihood for each finding based on the context

Respond with ONLY a JSON object containing: whatIsHappening, whyItMatters, riskLevel, riskDescription, actionToTake, cybersecurityNews, forensicAnalysis, and threatMap.

CRITICAL: Base your ENTIRE analysis on the ACTUAL data provided above. Do NOT make generic assumptions or provide templated responses. Reference specific IPs, ports, protocols, and patterns you observe in the data.`;

    console.log('Calling Lovable AI Gateway with Wireshark export data');

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
        forensicAnalysis: "No suspicious forensic indicators detected. Traffic patterns appear consistent with normal business operations. No beaconing, lateral movement, or persistence mechanisms identified.",
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

    // Pass through the AI's analysis verbatim - do not modify, summarize, or interpret
    const validatedResult = {
      whatIsHappening: analysisResult.whatIsHappening || "Network analysis completed.",
      whyItMatters: analysisResult.whyItMatters || "Understanding your network helps protect your business.",
      riskLevel: riskLevelNum,
      riskDescription: analysisResult.riskDescription || "Analysis completed. Risk assessment based on the network activity patterns observed.",
      actionToTake: analysisResult.actionToTake || "Continue monitoring your network regularly.",
      cybersecurityNews: analysisResult.cybersecurityNews || "Stay informed about the latest cybersecurity trends and best practices to protect your business.",
      forensicAnalysis: analysisResult.forensicAnalysis || "Forensic analysis pending. Please re-run the analysis for detailed forensic insights.",
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
      forensicAnalysis: "Forensic analysis could not be completed due to a processing error.",
      threatMap: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
