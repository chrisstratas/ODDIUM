import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SportMetrics {
  NFL: string[];
  NBA: string[];
  MLB: string[];
  NHL: string[];
  WNBA: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate input
    const requestSchema = z.object({
      sport: z.enum(['NFL', 'NBA', 'MLB', 'NHL', 'WNBA']),
      playerName: z.string().max(100).optional(),
      analysisType: z.enum(['current_props', 'recent_performance', 'sport_trends']).optional()
    });
    
    const requestData = await req.json();
    const { sport, playerName, analysisType } = requestSchema.parse(requestData);
    
    console.log(`Generating AI insights for ${sport} - ${playerName || 'all players'} - ${analysisType}`);

    // Sport-specific metrics for analysis
    const sportMetrics: SportMetrics = {
      NFL: ['passing_yards', 'rushing_yards', 'receiving_yards', 'touchdowns', 'completions', 'attempts', 'receptions', 'carries'],
      NBA: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'three_pointers', 'field_goals', 'free_throws'],
      MLB: ['hits', 'runs', 'rbis', 'home_runs', 'stolen_bases', 'strikeouts', 'walks', 'batting_average'],
      NHL: ['goals', 'assists', 'points', 'shots', 'hits', 'blocks', 'penalty_minutes', 'faceoff_wins'],
      WNBA: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'three_pointers', 'field_goals', 'free_throws']
    };

    // Get recent game data and current props
    const [recentGamesResult, propsResult, analyticsResult] = await Promise.all([
      supabase
        .from('player_stats')
        .select('*')
        .eq('season_year', new Date().getFullYear())
        .gte('game_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('game_date', { ascending: false })
        .limit(50),
      
      supabase
        .from('live_odds')
        .select('*')
        .eq('sport', sport)
        .order('last_updated', { ascending: false })
        .limit(100),
      
      supabase
        .from('prop_analytics')
        .select('*')
        .eq('sport', sport)
        .order('calculated_at', { ascending: false })
        .limit(50)
    ]);

    if (recentGamesResult.error || propsResult.error || analyticsResult.error) {
      console.error('[ERROR] Database query failed');
    }

    const recentGames = recentGamesResult.data || [];
    const currentProps = propsResult.data || [];
    const analytics = analyticsResult.data || [];

    // Filter data if specific player requested
    const filteredGames = playerName 
      ? recentGames.filter(game => game.player_name.toLowerCase().includes(playerName.toLowerCase()))
      : recentGames;

    const filteredProps = playerName 
      ? currentProps.filter(prop => prop.player_name.toLowerCase().includes(playerName.toLowerCase()))
      : currentProps;

    const filteredAnalytics = playerName 
      ? analytics.filter(analytic => analytic.player_name.toLowerCase().includes(playerName.toLowerCase()))
      : analytics;

    // Prepare data summary for AI analysis
    const dataSummary = {
      sport,
      relevantMetrics: sportMetrics[sport as keyof SportMetrics] || [],
      recentGamesCount: filteredGames.length,
      currentPropsCount: filteredProps.length,
      analyticsCount: filteredAnalytics.length,
      sampleRecentGames: filteredGames.slice(0, 10),
      sampleProps: filteredProps.slice(0, 20),
      sampleAnalytics: filteredAnalytics.slice(0, 10),
      requestedPlayer: playerName,
      analysisType
    };

    // Create AI prompt based on analysis type
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'current_props':
        systemPrompt = `You are an expert sports betting analyst specializing in ${sport}. Analyze current player props and provide actionable insights based on recent performance, trends, and statistical analysis. Focus on value bets and risk assessment.`;
        userPrompt = `Based on the following data, provide insights on current ${sport} props:

Recent Games Data: ${JSON.stringify(dataSummary.sampleRecentGames, null, 2)}
Current Props: ${JSON.stringify(dataSummary.sampleProps, null, 2)}
Analytics: ${JSON.stringify(dataSummary.sampleAnalytics, null, 2)}

Please provide:
1. Top 3-5 value prop recommendations with reasoning
2. Risk assessment for each recommendation
3. Key trends affecting these props
4. Statistical insights supporting your analysis

Focus on ${sport}-specific metrics: ${dataSummary.relevantMetrics.join(', ')}`;
        break;

      case 'recent_performance':
        systemPrompt = `You are a sports performance analyst with deep expertise in ${sport}. Analyze recent player performance data to identify trends, hot/cold streaks, and performance factors.`;
        userPrompt = `Analyze recent ${sport} performance data:

Recent Games: ${JSON.stringify(dataSummary.sampleRecentGames, null, 2)}
Analytics: ${JSON.stringify(dataSummary.sampleAnalytics, null, 2)}

Please provide:
1. Performance trend analysis (last 5-10 games)
2. Players in hot/cold streaks
3. Key performance indicators showing improvement/decline
4. Matchup-specific insights
5. Injury or external factors affecting performance

Focus on ${sport} metrics: ${dataSummary.relevantMetrics.join(', ')}`;
        break;

      case 'sport_trends':
        systemPrompt = `You are a sports trends analyst specializing in ${sport}. Identify league-wide trends, statistical patterns, and emerging betting opportunities.`;
        userPrompt = `Analyze ${sport} trends and patterns:

Recent Data: ${JSON.stringify(dataSummary, null, 2)}

Please provide:
1. League-wide statistical trends
2. Emerging betting patterns
3. Seasonal progression insights
4. Team/player performance shifts
5. Market inefficiencies and opportunities

Focus on ${sport} trends in: ${dataSummary.relevantMetrics.join(', ')}`;
        break;

      default:
        systemPrompt = `You are a comprehensive sports analytics expert for ${sport}. Provide well-rounded insights covering props, performance, and trends.`;
        userPrompt = `Provide comprehensive ${sport} insights:

Data Summary: ${JSON.stringify(dataSummary, null, 2)}

Please analyze and provide:
1. Current prop opportunities
2. Recent performance highlights
3. Notable trends and patterns
4. Actionable recommendations
5. Risk factors to consider`;
    }

    // Call OpenAI API
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
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error('[ERROR] OpenAI API failed:', response.status);
      throw new Error('AI service unavailable');
    }

    const aiResponse = await response.json();
    const insights = aiResponse.choices[0].message.content;

    // Structure the response
    const result = {
      sport,
      playerName: playerName || 'All Players',
      analysisType,
      insights,
      dataPoints: {
        recentGamesAnalyzed: filteredGames.length,
        currentPropsAnalyzed: filteredProps.length,
        analyticsPointsAnalyzed: filteredAnalytics.length
      },
      timestamp: new Date().toISOString(),
      relevantMetrics: sportMetrics[sport as keyof SportMetrics] || []
    };

    console.log(`Generated AI insights for ${sport} - ${result.dataPoints.recentGamesAnalyzed} games, ${result.dataPoints.currentPropsAnalyzed} props analyzed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ERROR] sports-insights-ai:', error.name);
    
    const isValidationError = error.name === 'ZodError';
    return new Response(
      JSON.stringify({ 
        error: isValidationError ? 'Invalid request parameters' : 'Failed to generate insights',
        code: isValidationError ? 'VALIDATION_ERROR' : 'SERVER_ERROR'
      }),
      {
        status: isValidationError ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});