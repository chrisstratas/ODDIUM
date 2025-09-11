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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Generating mock ${sport} schedule data...`);

    // Mock game data for all sports
    const createMockGames = (sportType: string) => {
      const mockGames = {
        'NFL': [
          {
            id: crypto.randomUUID(),
            game_id: `mock_nfl_1`,
            sport: 'NFL',
            home_team: 'Buffalo Bills',
            away_team: 'Miami Dolphins',
            game_date: '2025-09-15',
            game_time: '1:00 PM ET',
            venue: 'Highmark Stadium',
            network: 'CBS',
            home_record: '0-0',
            away_record: '0-0',
            status: 'scheduled',
            home_score: null,
            away_score: null,
            season_year: 2025,
            week_number: 2,
            data_source: 'mock_data'
          },
          {
            id: crypto.randomUUID(),
            game_id: `mock_nfl_2`,
            sport: 'NFL',
            home_team: 'Kansas City Chiefs',
            away_team: 'Denver Broncos',
            game_date: '2025-09-15',
            game_time: '4:25 PM ET',
            venue: 'Arrowhead Stadium',
            network: 'CBS',
            home_record: '0-0',
            away_record: '0-0',
            status: 'scheduled',
            home_score: null,
            away_score: null,
            season_year: 2025,
            week_number: 2,
            data_source: 'mock_data'
          }
        ],
        'NBA': [
          {
            id: crypto.randomUUID(),
            game_id: `mock_nba_1`,
            sport: 'NBA',
            home_team: 'Los Angeles Lakers',
            away_team: 'Golden State Warriors',
            game_date: '2025-09-15',
            game_time: '7:30 PM PT',
            venue: 'Crypto.com Arena',
            network: 'ESPN',
            home_record: 'Preseason',
            away_record: 'Preseason',
            status: 'scheduled',
            home_score: null,
            away_score: null,
            season_year: 2025,
            week_number: null,
            data_source: 'mock_data'
          }
        ],
        'MLB': [
          {
            id: crypto.randomUUID(),
            game_id: `mock_mlb_1`,
            sport: 'MLB',
            home_team: 'Los Angeles Dodgers',
            away_team: 'San Francisco Giants',
            game_date: '2025-09-15',
            game_time: '7:10 PM PT',
            venue: 'Dodger Stadium',
            network: 'Fox Sports',
            home_record: '98-64',
            away_record: '80-82',
            status: 'scheduled',
            home_score: null,
            away_score: null,
            season_year: 2025,
            week_number: null,
            data_source: 'mock_data'
          }
        ],
        'NHL': [
          {
            id: crypto.randomUUID(),
            game_id: `mock_nhl_1`,
            sport: 'NHL',
            home_team: 'New York Rangers',
            away_team: 'New Jersey Devils',
            game_date: '2025-09-15',
            game_time: '7:00 PM ET',
            venue: 'Madison Square Garden',
            network: 'ESPN',
            home_record: 'Preseason',
            away_record: 'Preseason',
            status: 'scheduled',
            home_score: null,
            away_score: null,
            season_year: 2025,
            week_number: null,
            data_source: 'mock_data'
          }
        ]
      };
      
      return mockGames[sportType as keyof typeof mockGames] || [];
    };

    let gamesData: any[] = [];

    // Generate mock data for requested sports
    const sportsToFetch = sport === 'all' ? ['NFL', 'NBA', 'MLB', 'NHL'] : [sport];

    for (const sportType of sportsToFetch) {
      const mockGames = createMockGames(sportType);
      console.log(`Generated ${mockGames.length} mock ${sportType} games`);
      gamesData.push(...mockGames);
    }

    // Insert or update games in database
    if (gamesData.length > 0) {
      console.log(`Upserting ${gamesData.length} games from API Sports...`);
      
      // Remove duplicates
      const uniqueGames = gamesData.filter((game, index, self) => 
        index === self.findIndex(g => g.game_id === game.game_id)
      );
      
      const { error } = await supabase
        .from('games_schedule')
        .upsert(uniqueGames, { 
          onConflict: 'game_id'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`Successfully updated ${uniqueGames.length} mock games`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        gamesUpdated: gamesData.length,
        message: `Updated ${gamesData.length} mock games`,
        source: 'Mock Data'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-api-sports-schedule:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});