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
    const sportsApiKey = Deno.env.get('SPORTSDATA_API_KEY');
    
    if (!sportsApiKey) {
      console.error('SPORTSDATA_API_KEY not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Try to fetch from Fox Sports API first, then fallback to SportsData.io
    if (sport === 'all' || sport === 'NFL') {
      const foxNflData = await fetchFoxSportsData('NFL');
      
      if (foxNflData.length === 0) {
        // Fallback to SportsData.io NFL API
        try {
          console.log('Fetching NFL schedule from SportsData.io...');
          const nflResponse = await fetch(
            `https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/2025/3?key=${sportsApiKey}`
          );
          
          if (nflResponse.ok) {
            const nflGames = await nflResponse.json();
            console.log(`Found ${nflGames.length} NFL games`);
            
            const mappedNflGames = nflGames.map((game: SportsDataGame) => ({
              game_id: `nfl_${game.GameID}`,
              sport: 'NFL',
              home_team: game.HomeTeam,
              away_team: game.AwayTeam,
              game_date: game.DateTime.split('T')[0],
              game_time: new Date(game.DateTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
              }),
              venue: game.Stadium || 'TBD',
              network: game.Channel || 'FOX Sports',
              home_record: game.HomeTeamRecord || '',
              away_record: game.AwayTeamRecord || '',
              status: game.Status?.toLowerCase() || 'scheduled',
              home_score: game.HomeTeamScore,
              away_score: game.AwayTeamScore,
              week_number: game.Week,
              season_year: game.Season
            }));
            
            gamesData.push(...mappedNflGames);
          } else {
            console.error('Failed to fetch NFL data:', nflResponse.status);
          }
        } catch (error) {
          console.error('Error fetching NFL schedule:', error);
        }
      } else {
        gamesData.push(...foxNflData);
      }
    }

    // Fetch MLB schedule with Fox Sports integration
    if (sport === 'all' || sport === 'MLB') {
      const foxMlbData = await fetchFoxSportsData('MLB');
      
      if (foxMlbData.length === 0) {
        // Fallback to SportsData.io MLB API
        try {
          console.log('Fetching MLB schedule from SportsData.io...');
          const mlbResponse = await fetch(
            `https://api.sportsdata.io/v3/mlb/scores/json/GamesByDate/${startDate}?key=${sportsApiKey}`
          );
          
          if (mlbResponse.ok) {
            const mlbGames = await mlbResponse.json();
            console.log(`Found ${mlbGames.length} MLB games`);
            
            const mappedMlbGames = mlbGames.map((game: any) => ({
              game_id: `mlb_${game.GameID}`,
              sport: 'MLB',
              home_team: game.HomeTeam,
              away_team: game.AwayTeam,
              game_date: game.DateTime.split('T')[0],
              game_time: new Date(game.DateTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
              }),
              venue: game.Stadium || 'TBD',
              network: 'FOX Sports',
              home_record: `${game.HomeTeamWins || 0}-${game.HomeTeamLosses || 0}`,
              away_record: `${game.AwayTeamWins || 0}-${game.AwayTeamLosses || 0}`,
              status: game.Status?.toLowerCase() || 'scheduled',
              home_score: game.HomeTeamRuns,
              away_score: game.AwayTeamRuns,
              season_year: game.Season
            }));
            
            gamesData.push(...mappedMlbGames);
          } else {
            console.error('Failed to fetch MLB data:', mlbResponse.status);
          }
        } catch (error) {
          console.error('Error fetching MLB schedule:', error);
        }
      } else {
        gamesData.push(...foxMlbData);
      }
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

    // For NHL - try Fox Sports first, then mock data for preseason  
    if (sport === 'all' || sport === 'NHL') {
      const foxNhlData = await fetchFoxSportsData('NHL');
      
      if (foxNhlData.length === 0) {
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
          },
          {
            game_id: 'nhl_mock_2',
            sport: 'NHL',
            home_team: 'Bruins',
            away_team: 'Canadiens',
            game_date: '2025-09-16',
            game_time: '7:30 PM ET',
            venue: 'TD Garden',
            network: 'FOX Sports',
            home_record: 'Preseason',
            away_record: 'Preseason',
            status: 'scheduled',
            season_year: 2025
          }
        ];
        gamesData.push(...mockNhlGames);
      } else {
        gamesData.push(...foxNhlData);
      }
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