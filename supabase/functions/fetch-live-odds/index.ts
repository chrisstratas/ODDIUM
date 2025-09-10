import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const oddsApiKey = Deno.env.get('ODDS_API_KEY');

// Map our sports to The Odds API sport keys
const SPORT_MAPPINGS = {
  'nba': { 
    key: 'basketball_nba', 
    name: 'NBA',
    propTypes: ['player_points', 'player_rebounds', 'player_assists', 'player_threes', 'player_steals', 'player_blocks']
  },
  'nfl': { 
    key: 'americanfootball_nfl', 
    name: 'NFL',
    propTypes: ['player_pass_yds', 'player_rush_yds', 'player_receptions', 'player_pass_tds', 'player_rush_tds']
  },
  'mlb': { 
    key: 'baseball_mlb', 
    name: 'MLB',
    propTypes: ['player_hits', 'player_total_bases', 'player_runs', 'player_rbis', 'player_strikeouts']
  },
  'nhl': { 
    key: 'icehockey_nhl', 
    name: 'NHL',
    propTypes: ['player_points', 'player_goals', 'player_assists', 'player_shots_on_goal']
  },
  'wnba': { 
    key: 'basketball_wnba', 
    name: 'WNBA',
    propTypes: ['player_points', 'player_rebounds', 'player_assists', 'player_threes', 'player_steals']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting live odds fetch from The Odds API...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!oddsApiKey) {
      console.error('The Odds API key not found');
      return new Response(JSON.stringify({ 
        error: 'The Odds API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    const errors = [];

    for (const [sport, config] of Object.entries(SPORT_MAPPINGS)) {
      try {
        console.log(`Fetching ${config.name} odds...`);

        // Fetch player props for this sport
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${config.key}/odds/?` +
          `apiKey=${oddsApiKey}&` +
          `regions=us&` +
          `markets=player_props&` +
          `oddsFormat=american&` +
          `bookmakers=draftkings,fanduel,betmgm,caesars,pointsbet,unibet`
        );

        if (!response.ok) {
          console.error(`Failed to fetch ${config.name} odds:`, response.status);
          errors.push(`${config.name}: HTTP ${response.status}`);
          continue;
        }

        const oddsData = await response.json();
        console.log(`Fetched odds for ${oddsData.length} ${config.name} games`);

        // Process each game's player props
        for (const game of oddsData) {
          if (!game.bookmakers || !game.bookmakers.length) continue;

          for (const bookmaker of game.bookmakers) {
            for (const market of bookmaker.markets || []) {
              if (!market.key.startsWith('player_')) continue;

              for (const outcome of market.outcomes || []) {
                if (!outcome.description || !outcome.point) continue;

                // Extract player name from description
                const playerName = outcome.description.replace(/\s+(Over|Under)$/, '');
                
                // Map market key to our stat types
                const statType = mapMarketToStatType(market.key);
                if (!statType) continue;

                // Calculate confidence and value based on odds
                const odds = outcome.price;
                const confidence = calculateConfidence(odds);
                const valueRating = calculateValueRating(odds);

                const propData = {
                  player_name: playerName,
                  team: extractTeamFromGame(game, playerName),
                  stat_type: statType,
                  sport: config.name,
                  line: outcome.point,
                  over_odds: outcome.name === 'Over' ? `${odds > 0 ? '+' : ''}${odds}` : null,
                  under_odds: outcome.name === 'Under' ? `${odds > 0 ? '+' : ''}${odds}` : null,
                  sportsbook: bookmaker.title,
                  confidence_score: confidence,
                  value_rating: valueRating,
                  last_updated: new Date().toISOString()
                };

                // Insert/update odds data
                const { data: oddsInsert, error: oddsError } = await supabase
                  .from('live_odds')
                  .upsert(propData, {
                    onConflict: 'player_name,stat_type,sportsbook'
                  });

                if (oddsError) {
                  console.error('Odds insertion error:', oddsError);
                  continue;
                }

                results.push(propData);
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error processing ${config.name}:`, error);
        errors.push(`${config.name}: ${error.message}`);
      }
    }

    console.log(`Updated odds for ${results.length} total props across all sports`);

    return new Response(JSON.stringify({
      success: true,
      message: `Updated live odds for ${results.length} props from major sportsbooks`,
      data: results.slice(0, 10), // Sample of data
      total: results.length,
      breakdown: results.reduce((acc, curr) => {
        acc[curr.sport] = (acc[curr.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sportsbooks: [...new Set(results.map(r => r.sportsbook))],
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-live-odds:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch live odds',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapMarketToStatType(marketKey: string): string | null {
  const mappings: Record<string, string> = {
    'player_points': 'Points',
    'player_rebounds': 'Rebounds', 
    'player_assists': 'Assists',
    'player_threes': '3-Point FG',
    'player_steals': 'Steals',
    'player_blocks': 'Blocks',
    'player_pass_yds': 'Passing Yards',
    'player_rush_yds': 'Rushing Yards',
    'player_receptions': 'Receptions',
    'player_pass_tds': 'Passing TDs',
    'player_rush_tds': 'Rushing TDs',
    'player_hits': 'Hits',
    'player_total_bases': 'Total Bases',
    'player_runs': 'Runs',
    'player_rbis': 'RBIs',
    'player_strikeouts': 'Strikeouts',
    'player_goals': 'Goals',
    'player_shots_on_goal': 'Shots on Goal'
  };
  
  return mappings[marketKey] || null;
}

function extractTeamFromGame(game: any, playerName: string): string {
  // Try to extract team from game data - this is simplified
  // In practice, you'd need team rosters or additional API calls
  return game.home_team || game.away_team || 'Unknown';
}

function calculateConfidence(odds: number): number {
  // Convert American odds to implied probability
  const impliedProb = odds > 0 
    ? 100 / (odds + 100) 
    : Math.abs(odds) / (Math.abs(odds) + 100);
  
  // Convert to confidence score (60-95 range)
  return Math.round(impliedProb * 100 * 0.35 + 60);
}

function calculateValueRating(odds: number): string {
  // Simplified value calculation based on odds
  if (odds >= -110 && odds <= 110) return 'high';
  if (odds >= -150 && odds <= 150) return 'medium';
  return 'low';
}