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
    const apiSportsKey = Deno.env.get('API_SPORTS_KEY');
    
    if (!apiSportsKey) {
      console.error('API_SPORTS_KEY not found');
      return new Response(JSON.stringify({ error: 'API Sports key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Fetching ${sport} schedule from API Sports...`);

    // API Sports league configurations
    const apiSportsConfig = {
      'NFL': { 
        endpoint: 'https://v1.american-football.api-sports.io/games',
        league: 1,
        season: '2024',
        host: 'v1.american-football.api-sports.io'
      },
      'NBA': { 
        endpoint: 'https://v1.basketball.api-sports.io/games',
        league: 12,
        season: '2024-2025',
        host: 'v1.basketball.api-sports.io'
      },
      'MLB': { 
        endpoint: 'https://v1.baseball.api-sports.io/games',
        league: 1,
        season: '2024',
        host: 'v1.baseball.api-sports.io'
      },
      'NHL': { 
        endpoint: 'https://v1.hockey.api-sports.io/games',
        league: 57,
        season: '2024-2025',
        host: 'v1.hockey.api-sports.io'
      }
    };

    let gamesData: any[] = [];

    // Fetch from API Sports for each sport
    const sportsToFetch = sport === 'all' ? ['NFL', 'NBA', 'MLB', 'NHL'] : [sport];

    for (const sportType of sportsToFetch) {
      const config = apiSportsConfig[sportType as keyof typeof apiSportsConfig];
      if (!config) continue;

      try {
        console.log(`Fetching ${sportType} from API Sports...`);
        
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${config.endpoint}?league=${config.league}&season=${config.season}&date=${today}`, {
          headers: {
            'X-RapidAPI-Key': apiSportsKey,
            'X-RapidAPI-Host': config.host
          }
        });

        if (response.ok) {
          const data = await response.json();
          const games = data.response || [];
          
          console.log(`Found ${games.length} ${sportType} games from API Sports`);

          const mappedGames = games.map((game: any) => {
            const gameDate = new Date(game.date).toISOString().split('T')[0];
            const gameTime = new Date(game.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            });

            return {
              id: crypto.randomUUID(),
              game_id: `apisports_${sportType.toLowerCase()}_${game.id}`,
              sport: sportType,
              home_team: game.teams?.home?.name || 'Home Team',
              away_team: game.teams?.away?.name || 'Away Team',
              game_date: gameDate,
              game_time: gameTime,
              venue: game.venue?.name || 'TBD',
              network: 'API Sports',
              home_record: '',
              away_record: '',
              status: game.status?.short?.toLowerCase() || 'scheduled',
              home_score: game.scores?.home?.total || null,
              away_score: game.scores?.away?.total || null,
              season_year: parseInt(config.season.split('-')[0]),
              week_number: game.week || null,
              data_source: 'api_sports'
            };
          });

          gamesData.push(...mappedGames);
        } else {
          console.error(`API Sports ${sportType} fetch failed:`, response.status);
        }
      } catch (error) {
        console.error(`Error fetching ${sportType} from API Sports:`, error);
      }
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

      console.log(`Successfully updated ${uniqueGames.length} games from API Sports`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        gamesUpdated: gamesData.length,
        message: `Updated ${gamesData.length} games from API Sports`,
        source: 'API Sports'
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