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

// Mock sport configurations
const SPORT_MAPPINGS = {
  'nba': { 
    name: 'NBA',
    players: ['LeBron James', 'Stephen Curry', 'Luka Doncic', 'Giannis Antetokounmpo']
  },
  'nfl': { 
    name: 'NFL',
    players: ['Josh Allen', 'Patrick Mahomes', 'Lamar Jackson', 'Dak Prescott']
  },
  'mlb': { 
    name: 'MLB',
    players: ['Mookie Betts', 'Aaron Judge', 'Ronald Acuna Jr.', 'Mike Trout']
  },
  'nhl': { 
    name: 'NHL',
    players: ['Connor McDavid', 'Leon Draisaitl', 'Nathan MacKinnon', 'David Pastrnak']
  },
  'wnba': { 
    name: 'WNBA',
    players: ['A\'ja Wilson', 'Breanna Stewart', 'Diana Taurasi', 'Sabrina Ionescu']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting mock live odds generation...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = [];

    // Generate mock odds data for each sport
    for (const [sport, config] of Object.entries(SPORT_MAPPINGS)) {
      try {
        console.log(`Generating mock ${config.name} odds...`);

        // Generate mock props for each player
        for (const playerName of config.players) {
          const mockProps = [
            {
              player_name: playerName,
              team: getRandomTeam(config.name),
              stat_type: getRandomStatType(config.name),
              sport: config.name,
              line: Math.round((Math.random() * 30 + 15) * 10) / 10,
              over_odds: getRandomOdds(),
              under_odds: getRandomOdds(),
              sportsbook: getRandomSportsbook(),
              confidence_score: Math.floor(Math.random() * 35 + 60),
              value_rating: getRandomValueRating(),
              last_updated: new Date().toISOString()
            }
          ];

          // Insert mock odds data
          for (const propData of mockProps) {
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

      } catch (error) {
        console.error(`Error processing ${config.name}:`, error);
      }
    }

    console.log(`Generated mock odds for ${results.length} total props across all sports`);

    return new Response(JSON.stringify({
      success: true,
      message: `Generated mock live odds for ${results.length} props`,
      data: results.slice(0, 10), // Sample of data
      total: results.length,
      breakdown: results.reduce((acc, curr) => {
        acc[curr.sport] = (acc[curr.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sportsbooks: [...new Set(results.map(r => r.sportsbook))]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-live-odds:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate mock odds',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getRandomTeam(sport: string): string {
  const teams = {
    'NBA': ['LAL', 'GSW', 'DAL', 'MIL', 'BOS', 'MIA'],
    'NFL': ['BUF', 'KC', 'BAL', 'DAL', 'SF', 'PHI'],
    'MLB': ['LAD', 'NYY', 'ATL', 'LAA', 'HOU', 'TB'],
    'NHL': ['EDM', 'COL', 'BOS', 'TOR', 'FLA', 'CAR'],
    'WNBA': ['LV', 'NY', 'PHX', 'SEA', 'CHI', 'LAS']
  };
  
  const sportTeams = teams[sport as keyof typeof teams] || ['TEAM'];
  return sportTeams[Math.floor(Math.random() * sportTeams.length)];
}

function getRandomStatType(sport: string): string {
  const statTypes = {
    'NBA': ['Points', 'Rebounds', 'Assists', '3-Point FG', 'Steals'],
    'NFL': ['Passing Yards', 'Rushing Yards', 'Receptions', 'Passing TDs', 'Rushing TDs'],
    'MLB': ['Hits', 'Total Bases', 'Runs', 'RBIs', 'Strikeouts'],
    'NHL': ['Goals', 'Assists', 'Points', 'Shots on Goal'],
    'WNBA': ['Points', 'Rebounds', 'Assists', '3-Point FG', 'Steals']
  };
  
  const sportStats = statTypes[sport as keyof typeof statTypes] || ['Points'];
  return sportStats[Math.floor(Math.random() * sportStats.length)];
}

function getRandomOdds(): string {
  const odds = Math.floor(Math.random() * 300 - 150);
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function getRandomSportsbook(): string {
  const sportsbooks = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet'];
  return sportsbooks[Math.floor(Math.random() * sportsbooks.length)];
}

function getRandomValueRating(): string {
  const ratings = ['high', 'medium', 'low'];
  return ratings[Math.floor(Math.random() * ratings.length)];
}