import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      sport, 
      playerName, 
      analysisType = 'external_factors',
      recentStats = [],
      currentFactors = [],
      stat = '',
      line = 0,
      team = ''
    } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        insights: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare context for OpenAI
    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'external_factors') {
      systemPrompt = `You are an expert sports analyst specializing in identifying external factors that could affect player performance and betting outcomes. Focus on non-gameplay factors like:

- Player motivation (milestones, contract years, revenge games)
- Physical factors (rest, travel, altitude, weather)
- Team dynamics (coaching changes, injuries to teammates)
- External pressures (media attention, personal situations)
- Historical patterns (performance in specific situations)

Provide insights in JSON format with this structure:
[
  {
    "type": "motivation|rest|weather|altitude|injury_concern|usage_spike|personal",
    "title": "Brief descriptive title",
    "description": "Detailed explanation of the factor and its potential impact",
    "impact": "positive|negative|neutral",
    "confidence": 65,
    "priority": "high|medium|low"
  }
]

Be specific and actionable. Only include factors with reasonable confidence levels.`;

      userPrompt = `Analyze ${playerName} (${team}) for ${stat} prop betting external factors:

Sport: ${sport}
Current Line: ${line}
Recent Performance: ${recentStats.map(s => `${s.game_date}: ${s.value}`).join(', ')}

Current detected factors:
${currentFactors.map(f => `- ${f.title}: ${f.description}`).join('\n')}

Identify additional external factors that could impact this prop bet. Consider:
1. Upcoming milestones or achievements within reach
2. Rest vs fatigue based on recent schedule
3. Motivation factors (contract situations, team standings)
4. Weather/venue impacts for outdoor sports
5. Team chemistry or coaching changes
6. Travel patterns or altitude changes
7. Personal motivations (hometown games, revenge games)

Focus on factors not already identified and provide specific, actionable insights.`;
    }

    console.log('Calling OpenAI with prompts:', { systemPrompt, userPrompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to generate insights',
        insights: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    let insights = [];
    try {
      const aiResponse = JSON.parse(data.choices[0].message.content);
      insights = aiResponse.insights || aiResponse.factors || [];
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      insights = [];
    }

    return new Response(JSON.stringify({ 
      success: true,
      insights,
      analysis_type: analysisType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in external-factors-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      insights: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});