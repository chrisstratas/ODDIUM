import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { edgeCategories } from './categories.ts';

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
    
    // Validate input
    const requestSchema = z.object({
      category: z.enum(['player_props', 'live_betting', 'college_sports', 'arbitrage', 'derivative_markets']).optional(),
      sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'all']).default('all'),
      minEdge: z.number().min(0).max(100).default(0),
      minConfidence: z.number().min(0).max(100).default(50)
    });
    
    const requestData = await req.json();
    const { category, sport, minEdge, minConfidence } = requestSchema.parse(requestData);

    console.log('Analyzing edge opportunities for:', { category, sport, minEdge, minConfidence });

    // Get live odds data
    const { data: liveOdds, error: oddsError } = await supabase
      .from('live_odds')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(100);

    if (oddsError) {
      console.error('Error fetching live odds:', oddsError);
    }

    // Get recent prop analytics
    const { data: propAnalytics, error: analyticsError } = await supabase
      .from('prop_analytics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(50);

    if (analyticsError) {
      console.error('Error fetching prop analytics:', analyticsError);
    }

    // Get recent player stats for edge analysis
    const { data: playerStats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .gte('game_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('game_date', { ascending: false })
      .limit(200);

    if (statsError) {
      console.error('Error fetching player stats:', statsError);
    }

    // Get games schedule for live betting and college sports analysis
    const { data: gamesSchedule, error: scheduleError } = await supabase
      .from('games_schedule')
      .select('*')
      .order('game_date', { ascending: true })
      .limit(50);

    if (scheduleError) {
      console.error('Error fetching games schedule:', scheduleError);
    }

    const opportunities = [];

    // Analyze player props category
    if (!category || category === 'player_props') {
      const playerPropOpportunities = await analyzePlayerProps(liveOdds || [], propAnalytics || [], playerStats || []);
      opportunities.push(...playerPropOpportunities);
    }

    // Analyze live betting opportunities
    if (!category || category === 'live_betting') {
      const liveBettingOpportunities = await analyzeLiveBetting(gamesSchedule || [], liveOdds || [], playerStats || []);
      opportunities.push(...liveBettingOpportunities);
    }

    // Analyze college sports opportunities
    if (!category || category === 'college_sports') {
      const collegeOpportunities = await analyzeCollegeSports(gamesSchedule || [], liveOdds || []);
      opportunities.push(...collegeOpportunities);
    }

    // Analyze arbitrage opportunities
    if (!category || category === 'arbitrage') {
      const arbitrageOpportunities = await analyzeArbitrageOpportunities(liveOdds || []);
      opportunities.push(...arbitrageOpportunities);
    }

    // Analyze derivative markets
    if (!category || category === 'derivative_markets') {
      const derivativeOpportunities = await analyzeDerivativeMarkets(liveOdds || []);
      opportunities.push(...derivativeOpportunities);
    }

    // Use AI to analyze the opportunities and add insights
    let aiEnhancedOpportunities = opportunities;
    if (openAIApiKey && opportunities.length > 0) {
      aiEnhancedOpportunities = await enhanceWithAI(opportunities, liveOdds || [], playerStats || []);
    }

    // Filter by criteria
    const filteredOpportunities = aiEnhancedOpportunities.filter(opp => {
      if (sport !== 'all' && opp.sport !== sport) return false;
      if (opp.edge < minEdge) return false;
      if (opp.confidence < minConfidence) return false;
      return true;
    });

    // Sort by edge and urgency
    filteredOpportunities.sort((a, b) => {
      const urgencyWeight = { high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.edge - a.edge;
    });

    console.log(`Found ${filteredOpportunities.length} edge opportunities`);

    return new Response(JSON.stringify({ 
      success: true,
      opportunities: filteredOpportunities.slice(0, 20), // Limit to top 20
      metadata: {
        totalAnalyzed: opportunities.length,
        dataPoints: {
          liveOdds: liveOdds?.length || 0,
          propAnalytics: propAnalytics?.length || 0,
          playerStats: playerStats?.length || 0
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ERROR] analyze-edge-opportunities:', error.name);
    
    const isValidationError = error.name === 'ZodError';
    return new Response(JSON.stringify({ 
      error: isValidationError ? 'Invalid request parameters' : 'Failed to analyze opportunities',
      code: isValidationError ? 'VALIDATION_ERROR' : 'SERVER_ERROR',
      opportunities: []
    }), {
      status: isValidationError ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzePlayerProps(liveOdds: any[], propAnalytics: any[], playerStats: any[]) {
  const opportunities = [];
  
  // Group odds by player and stat type
  const playerGrouped = liveOdds.reduce((acc, odd) => {
    const key = `${odd.player_name}_${odd.stat_type}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(odd);
    return acc;
  }, {});

  for (const [playerStatKey, odds] of Object.entries(playerGrouped)) {
    const playerOdds = odds as any[];
    if (playerOdds.length < 2) continue; // Need multiple books for comparison

    const player = playerOdds[0].player_name;
    const statType = playerOdds[0].stat_type;
    const sport = playerOdds[0].sport || 'NBA';

    // Find player's recent performance
    const recentStats = playerStats.filter(s => 
      s.player_name === player && 
      s.stat_type === statType
    ).slice(0, 5);

    if (recentStats.length < 3) continue;

    const recentAvg = recentStats.reduce((sum, s) => sum + parseFloat(s.value), 0) / recentStats.length;
    const avgLine = playerOdds.reduce((sum, o) => sum + parseFloat(o.line), 0) / playerOdds.length;
    
    // Calculate edge based on recent performance vs line
    const edge = Math.abs((recentAvg - avgLine) / avgLine) * 100;
    
    if (edge > 5) { // Minimum 5% edge
      const isOver = recentAvg > avgLine;
      opportunities.push({
        id: `player_prop_${playerStatKey}_${Date.now()}`,
        category: 'player_props',
        title: `${player} ${statType} ${isOver ? 'Over' : 'Under'} ${avgLine}`,
        description: `${player} averaging ${recentAvg.toFixed(1)} in recent games vs line of ${avgLine}`,
        player,
        team: playerOdds[0].team,
        sport,
        edge: edge,
        confidence: Math.min(90, 60 + (edge * 2)),
        reasoning: `Recent 5-game average (${recentAvg.toFixed(1)}) ${isOver ? 'exceeds' : 'falls short of'} current betting line. ${edge.toFixed(1)}% difference suggests value.`,
        urgency: edge > 12 ? 'high' : (edge > 8 ? 'medium' : 'low'),
        books: [...new Set(playerOdds.map(o => o.sportsbook))],
        created_at: new Date().toISOString()
      });
    }
  }

  return opportunities;
}

async function analyzeArbitrageOpportunities(liveOdds: any[]) {
  const opportunities = [];
  
  // Group by player and stat type to find cross-book differences
  const grouped = liveOdds.reduce((acc, odd) => {
    const key = `${odd.player_name}_${odd.stat_type}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(odd);
    return acc;
  }, {});

  for (const [key, odds] of Object.entries(grouped)) {
    const playerOdds = odds as any[];
    if (playerOdds.length < 2) continue;

    // Sort by line value
    playerOdds.sort((a, b) => parseFloat(a.line) - parseFloat(b.line));
    
    const lowest = playerOdds[0];
    const highest = playerOdds[playerOdds.length - 1];
    
    const lineSpread = parseFloat(highest.line) - parseFloat(lowest.line);
    
    // Check for arbitrage opportunity (line spread > 1.0)
    if (lineSpread >= 1.0) {
      const edge = (lineSpread / parseFloat(lowest.line)) * 100;
      
      opportunities.push({
        id: `arbitrage_${key}_${Date.now()}`,
        category: 'arbitrage',
        title: `${lowest.player_name} ${lowest.stat_type} Cross-Book Arb`,
        description: `Line spread of ${lineSpread} points between ${lowest.sportsbook} and ${highest.sportsbook}`,
        player: lowest.player_name,
        team: lowest.team,
        sport: lowest.sport || 'NBA',
        edge: edge,
        confidence: 95, // High confidence for mathematical arbitrage
        reasoning: `Guaranteed profit opportunity: bet under ${lowest.line} at ${lowest.sportsbook} and over ${highest.line} at ${highest.sportsbook}`,
        urgency: 'high',
        books: [lowest.sportsbook, highest.sportsbook],
        created_at: new Date().toISOString()
      });
    }
  }

  return opportunities;
}

async function analyzeDerivativeMarkets(liveOdds: any[]) {
  const opportunities = [];
  
  // Look for first-half and team-specific total opportunities
  const gameLines = liveOdds.filter(odd => 
    odd.stat_type.includes('Total') || 
    odd.stat_type.includes('First Half') ||
    odd.stat_type.includes('Quarter')
  );

  for (const line of gameLines) {
    // Derivative markets often have softer lines
    // Look for unusual line movements or values
    const line_value = parseFloat(line.line);
    
    // Example: First half totals that seem too low/high
    if (line.stat_type.includes('First Half')) {
      // Basic heuristic: first half should be ~45-48% of game total
      const estimatedGameTotal = line_value / 0.46; // Assume first half is 46% of game
      
      if (estimatedGameTotal > 220 || estimatedGameTotal < 180) { // NBA context
        const edge = Math.abs(estimatedGameTotal - 200) / 200 * 100; // Deviation from typical 200 point game
        
        if (edge > 8) {
          opportunities.push({
            id: `derivative_${line.id}_${Date.now()}`,
            category: 'derivative_markets',
            title: `${line.stat_type} - Formula Pricing Detected`,
            description: `Derivative line suggests unusual game total expectation`,
            sport: line.sport || 'NBA',
            edge: edge,
            confidence: 72,
            reasoning: `First-half total implies ${estimatedGameTotal.toFixed(0)} point game total, which deviates from typical patterns`,
            urgency: edge > 15 ? 'high' : 'medium',
            books: [line.sportsbook],
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  return opportunities;
}

async function analyzeLiveBetting(gamesSchedule: any[], liveOdds: any[], playerStats: any[]) {
  const opportunities = [];
  
  // Find games currently in progress or starting soon
  const now = new Date();
  const liveGames = gamesSchedule.filter(game => 
    game.status === 'live' || game.status === 'in_progress'
  );

  for (const game of liveGames) {
    // Look for rapid odds movements
    const gameOdds = liveOdds.filter(odd => 
      (odd.team === game.home_team || odd.team === game.away_team) &&
      odd.sport === game.sport
    );

    if (gameOdds.length > 0) {
      // Check for line movement
      const recentOdd = gameOdds[0];
      const lineMovement = recentOdd.line_movement;
      
      if (lineMovement && lineMovement !== 'stable') {
        const edge = Math.abs(parseFloat(recentOdd.line) - (recentOdd.opening_line || recentOdd.line)) / recentOdd.line * 100;
        
        if (edge > 8) {
          opportunities.push({
            id: `live_${game.game_id}_${Date.now()}`,
            category: 'live_betting',
            title: `${game.home_team} vs ${game.away_team} - Live Line Movement`,
            description: `Rapid line movement detected during live play. Act quickly before books adjust.`,
            sport: game.sport,
            edge: edge,
            confidence: 75,
            reasoning: `Books are adjusting to live game flow. ${lineMovement === 'up' ? 'Line moving up' : 'Line moving down'} suggests sharp action or game events.`,
            urgency: 'high',
            timeToAct: '2-5 minutes',
            books: [...new Set(gameOdds.map(o => o.sportsbook))],
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  return opportunities;
}

async function analyzeCollegeSports(gamesSchedule: any[], liveOdds: any[]) {
  const opportunities = [];
  
  // Look for college games (can be identified by team names or a future column)
  // For now, we'll look for non-primetime games and smaller matchups
  const collegeGames = gamesSchedule.filter(game => {
    const gameTime = new Date(game.game_time);
    const hour = gameTime.getHours();
    
    // Non-primetime (before 6pm or after 11pm) likely to be college
    // Or games without major network broadcast
    return (hour < 18 || hour > 23) || !game.broadcast_network;
  });

  for (const game of collegeGames) {
    const gameOdds = liveOdds.filter(odd => 
      (odd.team === game.home_team || odd.team === game.away_team) &&
      odd.sport === game.sport
    );

    if (gameOdds.length >= 2) {
      // Compare variance between books (softer lines have more variance)
      const lines = gameOdds.map(o => parseFloat(o.line));
      const avgLine = lines.reduce((a, b) => a + b, 0) / lines.length;
      const variance = lines.reduce((sum, line) => sum + Math.pow(line - avgLine, 2), 0) / lines.length;
      
      if (variance > 1.5) { // Higher variance = softer line
        const edge = (Math.sqrt(variance) / avgLine) * 100;
        
        opportunities.push({
          id: `college_${game.game_id}_${Date.now()}`,
          category: 'college_sports',
          title: `${game.home_team} vs ${game.away_team} - Soft Line Detected`,
          description: `Non-primetime ${game.sport} game with significant book disagreement. Less scrutinized markets offer value.`,
          sport: game.sport,
          edge: edge,
          confidence: 68,
          reasoning: `Line variance of ${variance.toFixed(2)} suggests less sharp pricing on this ${game.sport} matchup. Books focus on primetime, creating opportunities in smaller games.`,
          urgency: 'medium',
          books: [...new Set(gameOdds.map(o => o.sportsbook))],
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return opportunities;
}

async function enhanceWithAI(opportunities: any[], liveOdds: any[], playerStats: any[]) {
  if (!openAIApiKey) return opportunities;

  try {
    const categoryContext = JSON.stringify(edgeCategories, null, 2);
    
    const systemPrompt = `You are an expert sports betting analyst specializing in finding edges through these 5 proven strategies:

${categoryContext}

When analyzing opportunities, explicitly reference which category strategy applies and why it creates value based on the definitions above.

For each opportunity, provide:
1. Which category it belongs to and why (reference the category's "whyItWorks")
2. Risk assessment specific to that category's characteristics
3. Additional context relevant to that category (injuries, trends, market conditions)
4. Refined confidence score based on category principles
5. Action timeline based on category urgency
6. Betting strategy using that category's approach (reference examples)

Return the enhanced opportunities in the same JSON format with added fields for risk_factors, additional_context, betting_strategy, and category_reasoning.`;

    const userPrompt = `Analyze these ${opportunities.length} edge opportunities using the 5 category framework:

${JSON.stringify(opportunities.slice(0, 5), null, 2)}

Additional context:
- Total live odds tracked: ${liveOdds.length}
- Recent player stats available: ${playerStats.length}

For each opportunity, explain how it fits the specific edge category and provide betting advice tailored to that category's strategy.`;

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
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiAnalysis = JSON.parse(data.choices[0].message.content);
      
      // Merge AI insights with original opportunities
      if (aiAnalysis.enhanced_opportunities) {
        opportunities = opportunities.map((opp, index) => {
          const aiEnhanced = aiAnalysis.enhanced_opportunities[index];
          if (aiEnhanced) {
            return {
              ...opp,
              risk_factors: aiEnhanced.risk_factors,
              additional_context: aiEnhanced.additional_context,
              betting_strategy: aiEnhanced.betting_strategy,
              confidence: aiEnhanced.confidence || opp.confidence
            };
          }
          return opp;
        });
      }
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
  }

  return opportunities;
}