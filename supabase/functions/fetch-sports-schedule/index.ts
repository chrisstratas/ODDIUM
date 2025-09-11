import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SportsBlazeGame {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  game_date: string;
  game_time: string;
  venue?: string;
  network?: string;
  status: string;
  home_score?: number;
  away_score?: number;
  week_number?: number;
  season_year: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Fetching ${sport} schedule data...`);

    const currentDate = new Date();
    const currentWeek = new Date(currentDate);
    currentWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of week (Sunday)
    const endWeek = new Date(currentWeek);
    endWeek.setDate(currentWeek.getDate() + 6); // End of week (Saturday)

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const startDate = formatDate(currentWeek);
    const endDate = formatDate(endWeek);

    let gamesData: any[] = [];

    // Fetch from SPORTSBLAZE API
    const fetchSportsBlazeSchedule = async (sportType: string) => {
      try {
        const sportsBlazeApiKey = Deno.env.get('SPORTSBLAZE_API_KEY');
        
        if (!sportsBlazeApiKey) {
          console.log('No SPORTSBLAZE API key found, using mock data');
          return [];
        }

        console.log(`Fetching ${sportType} schedule from SPORTSBLAZE...`);
        
        const response = await fetch(`https://api.sportsblaze.net/v1/schedule/${sportType.toLowerCase()}`, {
          headers: {
            'X-API-Key': sportsBlazeApiKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`SPORTSBLAZE ${sportType} schedule fetch failed:`, response.status, await response.text());
          return [];
        }

        const data = await response.json();
        console.log(`Received ${data.games?.length || 0} ${sportType} games from SPORTSBLAZE`);

        // Transform SPORTSBLAZE data to our format
        return (data.games || []).map((game: any) => ({
          game_id: `sportsblaze_${sportType.toLowerCase()}_${game.id}`,
          sport: sportType,
          home_team: game.home_team?.name || game.home_team,
          away_team: game.away_team?.name || game.away_team,
          game_date: game.game_date || game.date,
          game_time: game.game_time || game.time || '12:00 PM ET',
          venue: game.venue?.name || game.venue,
          network: game.broadcast?.network || game.network,
          status: game.status || 'scheduled',
          home_score: game.home_score,
          away_score: game.away_score,
          week_number: game.week_number || game.week,
          season_year: game.season_year || new Date().getFullYear(),
          home_record: game.home_team?.record,
          away_record: game.away_team?.record,
          data_source: 'sportsblaze'
        }));

      } catch (error) {
        console.error(`Error fetching SPORTSBLAZE ${sportType} schedule:`, error);
        return [];
      }
    };

    // Fetch from SPORTSBLAZE API for all sports
    const sports = sport === 'all' ? ['NFL', 'NBA', 'MLB', 'NHL', 'WNBA'] : [sport];
    
    for (const sportType of sports) {
      try {
        const sportsBlazeGames = await fetchSportsBlazeSchedule(sportType);
        if (sportsBlazeGames.length > 0) {
          gamesData.push(...sportsBlazeGames);
        } else {
          // Fallback to mock data if SPORTSBLAZE returns no data
          const mockGames = getMockGamesForSport(sportType);
          gamesData.push(...mockGames);
        }
      } catch (error) {
        console.error(`Error processing ${sportType}:`, error);
        // Fallback to mock data on error
        const mockGames = getMockGamesForSport(sportType);
        gamesData.push(...mockGames);
      }
    }

    // Mock data fallback function
    function getMockGamesForSport(sportType: string) {
      const mockData: { [key: string]: any[] } = {
        'NFL': [{
          game_id: 'sportsblaze_mock_nfl_1',
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
          week_number: 2,
          season_year: 2025,
          data_source: 'sportsblaze_mock'
        }],
        'MLB': [{
          game_id: 'sportsblaze_mock_mlb_1',
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
          data_source: 'sportsblaze_mock'
        }],
        'NBA': [{
          game_id: 'sportsblaze_mock_nba_1',
          sport: 'NBA',
          home_team: 'Lakers',
          away_team: 'Warriors',
          game_date: '2025-09-15',
          game_time: '7:30 PM PT',
          venue: 'Crypto.com Arena',
          network: 'ESPN',
          home_record: 'Preseason',
          away_record: 'Preseason',
          status: 'scheduled',
          season_year: 2025,
          data_source: 'sportsblaze_mock'
        }],
        'NHL': [{
          game_id: 'sportsblaze_mock_nhl_1',
          sport: 'NHL',
          home_team: 'Rangers',
          away_team: 'Devils',
          game_date: '2025-09-15',
          game_time: '7:00 PM ET',
          venue: 'Madison Square Garden',
          network: 'FOX Sports',
          home_record: 'Preseason',
          away_record: 'Preseason',
          status: 'scheduled',
          season_year: 2025,
          data_source: 'sportsblaze_mock'
        }],
        'WNBA': [{
          game_id: 'sportsblaze_mock_wnba_1',
          sport: 'WNBA',
          home_team: 'Las Vegas Aces',
          away_team: 'New York Liberty',
          game_date: '2025-09-13',
          game_time: '9:00 PM ET',
          venue: 'Michelob ULTRA Arena',
          network: 'FOX Sports',
          home_record: '32-8',
          away_record: '30-10',
          status: 'final',
          home_score: 87,
          away_score: 92,
          season_year: 2025,
          data_source: 'sportsblaze_mock'
        }]
      };
      return mockData[sportType] || [];
    }

    // Insert or update games in database
    if (gamesData.length > 0) {
      console.log(`Upserting ${gamesData.length} games to database...`);
      
      // Remove duplicates from batch before inserting
      const uniqueGames = gamesData.filter((game, index, self) => 
        index === self.findIndex(g => g.game_id === game.game_id)
      );
      
      console.log(`Reduced ${gamesData.length} to ${uniqueGames.length} unique games`);
      
      const { error } = await supabase
        .from('games_schedule')
        .upsert(uniqueGames, { 
          onConflict: 'game_id'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`Successfully updated ${gamesData.length} games`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        gamesUpdated: gamesData.length,
        message: `Updated ${gamesData.length} games for the current week`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-sports-schedule function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});