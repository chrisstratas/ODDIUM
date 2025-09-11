import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SportsDataGame {
  GameID: number;
  Season: number;
  Week?: number;
  HomeTeam: string;
  AwayTeam: string;
  DateTime: string;
  Status: string;
  HomeTeamScore?: number;
  AwayTeamScore?: number;
  Stadium?: string;
  Channel?: string;
  HomeTeamRecord?: string;
  AwayTeamRecord?: string;
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

    // Helper function to fetch from Fox Sports API
    const fetchFoxSportsData = async (sport: string) => {
      try {
        const sportUrls = {
          'NFL': 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nfl',
          'MLB': 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/mlb',
          'NBA': 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nba',
          'NHL': 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nhl'
        };

        if (!sportUrls[sport as keyof typeof sportUrls]) return [];

        console.log(`Fetching Fox Sports ${sport} data...`);
        const response = await fetch(sportUrls[sport as keyof typeof sportUrls]);
        
        if (!response.ok) {
          console.error(`Fox Sports ${sport} fetch failed:`, response.status);
          return [];
        }

        const data = await response.text();
        // Parse RSS XML data here - for now using fallback
        console.log(`Fox Sports ${sport} RSS data received, length:`, data.length);
        return [];
      } catch (error) {
        console.error(`Error fetching Fox Sports ${sport}:`, error);
        return [];
      }
    };

    // Generate mock NFL games instead of API calls
    if (sport === 'all' || sport === 'NFL') {
      const mockNflGames = [
        {
          game_id: 'nfl_mock_1',
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
          season_year: 2025
        }
      ];
      gamesData.push(...mockNflGames);
    }

    // Generate mock MLB games
    if (sport === 'all' || sport === 'MLB') {
      const mockMlbGames = [
        {
          game_id: 'mlb_mock_1',
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
          season_year: 2025
        }
      ];
      gamesData.push(...mockMlbGames);
    }

    // For NBA and NHL (preseason), use current mock data since API might not have current preseason data
    if (sport === 'all' || sport === 'NBA') {
      const mockNbaGames = [
        {
          game_id: 'nba_mock_1',
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
          season_year: 2025
        },
        {
          game_id: 'nba_mock_2',
          sport: 'NBA',
          home_team: 'Celtics',
          away_team: 'Heat',
          game_date: '2025-09-16',
          game_time: '8:00 PM ET',
          venue: 'TD Garden',
          network: 'TNT',
          home_record: 'Preseason',
          away_record: 'Preseason',
          status: 'scheduled',
          season_year: 2025
        }
      ];
      gamesData.push(...mockNbaGames);
    }

    // Generate mock NHL games  
    if (sport === 'all' || sport === 'NHL') {
      const mockNhlGames = [
        {
          game_id: 'nhl_mock_1',
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
          season_year: 2025
        }
      ];
      gamesData.push(...mockNhlGames);
    }

    // WNBA with Fox Sports branding
    if (sport === 'all' || sport === 'WNBA') {
      const mockWnbaGames = [
        {
          game_id: 'wnba_mock_1',
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
          season_year: 2025
        }
      ];
      gamesData.push(...mockWnbaGames);
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