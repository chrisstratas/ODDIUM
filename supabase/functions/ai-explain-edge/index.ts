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
    const { playerName, statType, sport } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Explaining edge for:', { playerName, statType, sport });

    // Fetch relevant data
    const [statsResult, oddsResult, analyticsResult] = await Promise.all([
      supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .eq('sport', sport)
        .order('game_date', { ascending: false })
        .limit(10),
      
      supabase
        .from('live_odds')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', statType)
        .eq('sport', sport)
        .order('last_updated', { ascending: false })
        .limit(5),
      
      supabase
        .from('prop_analytics')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', statType)
        .eq('sport', sport)
        .maybeSingle()
    ]);

    const recentStats = statsResult.data || [];
    const liveOdds = oddsResult.data || [];
    const analytics = analyticsResult.data;

    // Calculate recent average
    const recentValues = recentStats
      .filter(s => s.stat_type === statType)
      .map(s => s.value);
    const recentAvg = recentValues.length > 0
      ? recentValues.reduce((a, b) => a + b, 0) / recentValues.length
      : null;

    // Get current line
    const currentLine = liveOdds.length > 0 ? liveOdds[0].line : null;

    // Build context for AI
    const context = {
      playerName,
      statType,
      sport,
      recentStats: recentValues,
      recentAverage: recentAvg,
      seasonAverage: analytics?.season_average,
      currentLine,
      hitRate: analytics?.hit_rate,
      trend: analytics?.trend_direction,
      liveOdds: liveOdds.map(o => ({
        sportsbook: o.sportsbook,
        line: o.line,
        overOdds: o.over_odds,
        underOdds: o.under_odds
      }))
    };

    const prompt = `Analyze this betting edge opportunity in detail:

Player: ${playerName}
Sport: ${sport}
Stat Type: ${statType}

Performance Data:
- Recent Average (Last ${recentValues.length} games): ${recentAvg?.toFixed(2) || 'N/A'}
- Season Average: ${analytics?.season_average || 'N/A'}
- Hit Rate: ${analytics?.hit_rate ? `${analytics.hit_rate}%` : 'N/A'}
- Trend: ${analytics?.trend_direction || 'N/A'}

Current Betting Lines:
${liveOdds.map(o => `- ${o.sportsbook}: ${o.line} (Over: ${o.over_odds}, Under: ${o.under_odds})`).join('\n') || 'No lines available'}

Explain in 3-4 paragraphs:
1. Why this edge exists (performance vs line analysis)
2. Key factors supporting this opportunity (matchups, trends, external factors)
3. Risk factors to consider
4. Betting recommendation with confidence level`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert sports betting analyst. Provide detailed, data-driven analysis.' },
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
    const explanation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        explanation,
        context,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-explain-edge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
