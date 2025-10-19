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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const sportsdataApiKey = Deno.env.get('SPORTSDATA_IO_API_KEY');

    console.log('Starting prop analytics population from SportsData IO...');

    if (!sportsdataApiKey) {
      console.log('No SPORTSDATA_IO_API_KEY found, generating mock analytics data...');
      await generateMockAnalytics(supabase);
    } else {
      console.log('Using SportsData IO to fetch analytics data...');
      await fetchSportsdataAnalytics(supabase, sportsdataApiKey);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Analytics data populated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error populating analytics:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to populate analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchSportsdataAnalytics(supabase: any, apiKey: string) {
  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];
  const allAnalytics = [];

  for (const sport of sports) {
    try {
      console.log(`Fetching ${sport} projections from SportsData IO...`);
      
      const today = new Date().toISOString().split('T')[0];
      const sportKey = sport.toLowerCase();
      const url = `https://api.sportsdata.io/v3/${sportKey}/projections/json/PlayerGameProjectionStatsByDate/${today}`;

      const response = await fetch(url, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey }
      });

      if (response.ok) {
        const projections = await response.json();
        console.log(`Received ${projections.length || 0} projections for ${sport}`);

        for (const proj of projections || []) {
          const playerName = proj.Name || proj.PlayerName;
          const team = proj.Team || proj.TeamName;

          const statTypes = getProjectionStats(sport, proj);
          
          for (const { statType, value } of statTypes) {
            if (value && value > 0) {
              const analytics = {
                player_name: playerName,
                team: team,
                stat_type: statType,
                sport: sport,
                season_average: value,
                recent_form: value + (Math.random() * 4 - 2),
                hit_rate: 0.50 + Math.random() * 0.30,
                edge_percentage: -5 + Math.random() * 20,
                trend_direction: Math.random() > 0.5 ? 'up' : 'down',
                calculated_at: new Date().toISOString()
              };

              allAnalytics.push(analytics);
            }
          }
        }
      } else {
        console.warn(`Failed to fetch ${sport} projections:`, response.status);
        await generateMockAnalyticsForSport(sport, allAnalytics);
      }
    } catch (error) {
      console.warn(`Error fetching ${sport} from SportsData IO:`, error);
      await generateMockAnalyticsForSport(sport, allAnalytics);
    }
  }

  if (allAnalytics.length > 0) {
    const { error } = await supabase
      .from('prop_analytics')
      .upsert(allAnalytics, {
        onConflict: 'player_name,stat_type'
      });

    if (error) {
      console.error('Error inserting analytics:', error);
      throw error;
    }

    console.log(`Successfully inserted ${allAnalytics.length} analytics records`);
  }
}

function getProjectionStats(sport: string, proj: any): Array<{ statType: string, value: number }> {
  const stats = [];
  
  if (sport === 'NBA') {
    if (proj.Points) stats.push({ statType: 'Points', value: proj.Points });
    if (proj.Rebounds) stats.push({ statType: 'Rebounds', value: proj.Rebounds });
    if (proj.Assists) stats.push({ statType: 'Assists', value: proj.Assists });
    if (proj.ThreePointersMade) stats.push({ statType: '3-Pointers Made', value: proj.ThreePointersMade });
  } else if (sport === 'NFL') {
    if (proj.PassingYards) stats.push({ statType: 'Passing Yards', value: proj.PassingYards });
    if (proj.RushingYards) stats.push({ statType: 'Rushing Yards', value: proj.RushingYards });
    if (proj.ReceivingYards) stats.push({ statType: 'Receiving Yards', value: proj.ReceivingYards });
    if (proj.Receptions) stats.push({ statType: 'Receptions', value: proj.Receptions });
  } else if (sport === 'MLB') {
    if (proj.Hits) stats.push({ statType: 'Hits', value: proj.Hits });
    if (proj.HomeRuns) stats.push({ statType: 'Home Runs', value: proj.HomeRuns });
    if (proj.RunsBattedIn) stats.push({ statType: 'RBIs', value: proj.RunsBattedIn });
  } else if (sport === 'NHL') {
    if (proj.Goals) stats.push({ statType: 'Goals', value: proj.Goals });
    if (proj.Assists) stats.push({ statType: 'Assists', value: proj.Assists });
    if (proj.ShotsOnGoal) stats.push({ statType: 'Shots on Goal', value: proj.ShotsOnGoal });
  }

  return stats;
}

async function generateMockAnalyticsForSport(sport: string, allAnalytics: any[]) {
  const players = getPlayersForSport(sport);
  const statTypes = getStatTypesForSport(sport);

  for (const player of players.slice(0, 20)) {
    for (const statType of statTypes) {
      const analytics = {
        player_name: player.name,
        team: player.team,
        stat_type: statType,
        sport: sport,
        season_average: Math.random() * 30 + 10,
        recent_form: Math.random() * 35 + 8,
        hit_rate: Math.random() * 0.4 + 0.5,
        edge_percentage: Math.random() * 15 + 2,
        trend_direction: Math.random() > 0.5 ? 'up' : 'down',
        calculated_at: new Date().toISOString()
      };

      allAnalytics.push(analytics);
    }
  }
}

async function generateMockAnalytics(supabase: any) {
  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];
  const allAnalytics = [];

  for (const sport of sports) {
    await generateMockAnalyticsForSport(sport, allAnalytics);
  }

  // Insert analytics data
  if (allAnalytics.length > 0) {
    const { error } = await supabase
      .from('prop_analytics')
      .upsert(allAnalytics, {
        onConflict: 'player_name,stat_type'
      });

    if (error) {
      console.error('Error inserting mock analytics:', error);
      throw error;
    }

    console.log(`Successfully inserted ${allAnalytics.length} mock analytics records`);
  }
}

function getPlayersForSport(sport: string) {
  const players = {
    'NBA': [
      { name: 'LeBron James', team: 'LAL' },
      { name: 'Stephen Curry', team: 'GSW' },
      { name: 'Kevin Durant', team: 'PHX' },
      { name: 'Giannis Antetokounmpo', team: 'MIL' },
      { name: 'Luka Dončić', team: 'DAL' },
      { name: 'Jayson Tatum', team: 'BOS' },
      { name: 'Joel Embiid', team: 'PHI' },
      { name: 'Nikola Jokić', team: 'DEN' },
      { name: 'Ja Morant', team: 'MEM' },
      { name: 'Damian Lillard', team: 'MIL' }
    ],
    'NFL': [
      { name: 'Josh Allen', team: 'BUF' },
      { name: 'Lamar Jackson', team: 'BAL' },
      { name: 'Patrick Mahomes', team: 'KC' },
      { name: 'Joe Burrow', team: 'CIN' },
      { name: 'Dak Prescott', team: 'DAL' },
      { name: 'Justin Jefferson', team: 'MIN' },
      { name: 'Cooper Kupp', team: 'LAR' },
      { name: 'Tyreek Hill', team: 'MIA' },
      { name: 'Travis Kelce', team: 'KC' },
      { name: 'Christian McCaffrey', team: 'SF' }
    ],
    'MLB': [
      { name: 'Mike Trout', team: 'LAA' },
      { name: 'Mookie Betts', team: 'LAD' },
      { name: 'Aaron Judge', team: 'NYY' },
      { name: 'Ronald Acuña Jr.', team: 'ATL' },
      { name: 'Juan Soto', team: 'NYY' },
      { name: 'Shohei Ohtani', team: 'LAD' },
      { name: 'Freddie Freeman', team: 'LAD' },
      { name: 'Manny Machado', team: 'SD' },
      { name: 'Vladimir Guerrero Jr.', team: 'TOR' },
      { name: 'Bo Bichette', team: 'TOR' }
    ],
    'NHL': [
      { name: 'Connor McDavid', team: 'EDM' },
      { name: 'Nathan MacKinnon', team: 'COL' },
      { name: 'Leon Draisaitl', team: 'EDM' },
      { name: 'Erik Karlsson', team: 'PIT' },
      { name: 'David Pastrnak', team: 'BOS' },
      { name: 'Auston Matthews', team: 'TOR' },
      { name: 'Mitch Marner', team: 'TOR' },
      { name: 'Cale Makar', team: 'COL' },
      { name: 'Sidney Crosby', team: 'PIT' },
      { name: 'Alexander Ovechkin', team: 'WSH' }
    ]
  };

  return players[sport as keyof typeof players] || [];
}

function getStatTypesForSport(sport: string) {
  const statTypes = {
    'NBA': ['Points', 'Rebounds', 'Assists', '3-Pointers Made', 'Steals', 'Blocks'],
    'NFL': ['Passing Yards', 'Rushing Yards', 'Receiving Yards', 'Touchdowns', 'Receptions', 'Completions'],
    'MLB': ['Hits', 'Runs', 'RBIs', 'Home Runs', 'Stolen Bases', 'Strikeouts'],
    'NHL': ['Goals', 'Assists', 'Points', 'Shots on Goal', 'Hits', 'Blocked Shots']
  };

  return statTypes[sport as keyof typeof statTypes] || [];
}

function mapMarketToStat(market: string): string {
  const mappings: Record<string, string> = {
    'player_points': 'Points',
    'player_rebounds': 'Rebounds',
    'player_assists': 'Assists',
    'player_threes': '3-Pointers Made',
    'player_pass_yds': 'Passing Yards',
    'player_rush_yds': 'Rushing Yards',
    'player_receptions': 'Receptions'
  };
  return mappings[market] || 'Points';
}