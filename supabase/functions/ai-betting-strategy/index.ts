import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sport, bankroll, riskTolerance = 'moderate' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating betting strategy:', { sport, bankroll, riskTolerance });

    // Fetch top edge opportunities for the sport
    const { data: edgeData } = await supabase.functions.invoke('analyze-edge-opportunities', {
      body: {
        sport,
        minEdge: 5,
        minConfidence: 70
      }
    });

    const opportunities = edgeData?.opportunities || [];

    if (opportunities.length === 0) {
      return new Response(
        JSON.stringify({ 
          strategy: "No edge opportunities currently available. Consider loading fresh data or checking back later.",
          opportunities: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by edge * confidence score
    const rankedOpportunities = opportunities
      .map((opp: any) => ({
        ...opp,
        score: (opp.edge || 0) * (opp.confidence || 0)
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    const unitSizeMap = {
      conservative: 1,
      moderate: 2,
      aggressive: 3
    };

    const baseUnitSize = unitSizeMap[riskTolerance as keyof typeof unitSizeMap];
    const unitValue = bankroll ? (bankroll * 0.01) : 10; // 1% of bankroll or $10 default

    const prompt = `You are a professional sports betting strategist. Create a betting strategy based on these edge opportunities:

Sport: ${sport}
Bankroll: ${bankroll ? `$${bankroll}` : 'Not specified'}
Risk Tolerance: ${riskTolerance}
Base Unit Size: ${baseUnitSize} units ($${(unitValue * baseUnitSize).toFixed(2)} per bet)

Top Opportunities:
${rankedOpportunities.map((opp: any, i: number) => `
${i + 1}. ${opp.title}
   - Edge: ${opp.edge}%
   - Confidence: ${opp.confidence}%
   - Category: ${opp.category}
   - Books: ${opp.books?.join(', ') || 'Various'}
`).join('\n')}

Create a comprehensive betting strategy that includes:
1. **Recommended Bets**: List 3-5 best bets with unit sizing (based on ${baseUnitSize} unit baseline)
2. **Portfolio Approach**: How to spread risk across these opportunities
3. **Parlay Considerations**: Any 2-3 leg parlays that make sense (if applicable)
4. **Bankroll Management**: Specific advice for this bankroll and risk tolerance
5. **Expected Value**: Overall expected return if strategy is followed
6. **Risk Assessment**: What could go wrong and how to mitigate

Be specific with unit recommendations (e.g., "2 units on...", "3 units on...").
Format the response with clear sections and bullet points.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional sports betting strategist focused on responsible bankroll management and value betting.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const strategy = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        strategy,
        opportunities: rankedOpportunities.slice(0, 5),
        unitValue,
        baseUnitSize,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-betting-strategy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
