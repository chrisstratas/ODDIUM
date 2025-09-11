import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { image, imageType } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Analyzing parlay image with OpenAI Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert sports betting analyst. Analyze the parlay betting slip image and provide:

1. A detailed breakdown of each bet in the parlay
2. Individual probability assessment for each bet (as a percentage)
3. Overall parlay probability (multiply individual probabilities)
4. Specific recommendations for each bet (keep, remove, or modify)
5. Risk assessment (low, medium, high)
6. Potential payout analysis
7. Key factors that could affect each bet

Format your response as JSON with the following structure:
{
  "bets": [
    {
      "description": "bet description",
      "probability": 65,
      "recommendation": "keep/remove/modify",
      "reasoning": "detailed reasoning"
    }
  ],
  "overall_probability": 25.5,
  "risk_level": "medium",
  "total_stake": "$10",
  "potential_payout": "$150",
  "recommendations": [
    "specific actionable recommendations"
  ],
  "key_factors": [
    "important factors to consider"
  ]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this parlay betting slip and provide detailed recommendations and probability assessments.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageType || 'image/jpeg'};base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const analysisText = data.choices[0].message.content;
    
    let analysis;
    try {
      // Try to parse as JSON first
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // If JSON parsing fails, return structured text response
      console.log('Response is not JSON, formatting as text');
      analysis = {
        text_analysis: analysisText,
        overall_probability: null,
        risk_level: "unknown",
        recommendations: ["Full analysis provided in text format"]
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      credits_used: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-parlay-image function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});