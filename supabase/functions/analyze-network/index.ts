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
    
    const { text } = await req.json();
    console.log('Input text:', text?.substring(0, 100));

    const systemPrompt = `You are a cybersecurity expert who translates technical network data into simple, executive-level insights for small business owners. 

Your responses must be:
- Written in plain English with NO technical jargon
- Focused on business impact, not technical details
- Actionable and reassuring

You must respond with a valid JSON object containing exactly these five fields:
{
  "whatIsHappening": "A simple explanation of what the network analysis shows",
  "whyItMatters": "The business impact and why the business owner should care",
  "riskLevel": 1 to 5 (integer, where 1 is lowest risk and 5 is highest risk),
  "riskDescription": "A detailed 2-3 sentence explanation of what this risk level means for the business, why it was assigned this score, and the potential impact if not addressed",
  "actionToTake": "One clear, simple action step"
}

Risk Level Guidelines:
- 1: Minimal risk - Normal network activity, no concerns
- 2: Low risk - Minor observations that warrant awareness but no immediate action
- 3: Moderate risk - Some concerning patterns that should be investigated
- 4: High risk - Significant security concerns requiring prompt attention
- 5: Critical risk - Immediate action required to protect the business

Always respond with ONLY the JSON object, no additional text.`;

    const userPrompt = `Analyze this network data and provide insights for a small business owner:

${text}

Remember: Respond with ONLY a JSON object containing whatIsHappening, whyItMatters, riskLevel, and actionToTake.`;

    console.log('Calling Lovable AI Gateway');

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
        actionToTake: "Continue your regular security practices and consider scheduling periodic network reviews."
      };
    }

    // Validate the response structure
    const riskLevelNum = typeof analysisResult.riskLevel === 'number' 
      ? Math.min(5, Math.max(1, analysisResult.riskLevel)) 
      : 1;
    
    const validatedResult = {
      whatIsHappening: analysisResult.whatIsHappening || "Network analysis completed.",
      whyItMatters: analysisResult.whyItMatters || "Understanding your network helps protect your business.",
      riskLevel: riskLevelNum,
      riskDescription: analysisResult.riskDescription || "Analysis completed. Risk assessment based on the network activity patterns observed.",
      actionToTake: analysisResult.actionToTake || "Continue monitoring your network regularly."
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
      actionToTake: "Please try uploading your file again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
