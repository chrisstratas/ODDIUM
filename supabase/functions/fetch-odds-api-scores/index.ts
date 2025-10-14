import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OddsApiScore {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores?: Array<{
    name: string;
    score: string;
  }> | null;
  last_update?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const oddsApiKey = Deno.env.get('THE_ODDS_API_KEY');

    if (!oddsApiKey) {
      throw new Error('THE_ODDS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sport = 'basketball_nba' } = await req.json();

    console.log(`Fetching ${sport} scores from The Odds API...`);

    // Fetch scores from The Odds API
    const oddsApiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/scores/`;
    const params = new URLSearchParams({
      apiKey: oddsApiKey,
      daysFrom: '3',
      dateFormat: 'iso'
    });

    const response = await fetch(`${oddsApiUrl}?${params}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`The Odds API error: ${response.status} - ${errorText}`);
      throw new Error(`The Odds API returned ${response.status}: ${errorText}`);
    }

    const games: OddsApiScore[] = await response.json();
    console.log(`Fetched ${games.length} games from The Odds API`);

    // Transform and upsert games to database
    const transformedGames = games.map(game => {
      const commenceDate = new Date(game.commence_time);
      const homeScore = game.scores?.find(s => s.name === game.home_team)?.score;
      const awayScore = game.scores?.find(s => s.name === game.away_team)?.score;
      
      // Determine status
      let status = 'scheduled';
      if (game.completed) {
        status = 'final';
      } else if (homeScore !== undefined || awayScore !== undefined) {
        status = 'live';
      }

      return {
        game_id: `odds_api_${game.id}`,
        sport: mapSportKey(game.sport_key),
        home_team: game.home_team,
        away_team: game.away_team,
        game_date: commenceDate.toISOString().split('T')[0],
        game_time: commenceDate.toTimeString().split(' ')[0],
        status,
        home_score: homeScore ? parseInt(homeScore) : null,
        away_score: awayScore ? parseInt(awayScore) : null,
        season_year: commenceDate.getFullYear(),
        data_source: 'odds_api',
        venue: null,
        network: null,
        home_record: null,
        away_record: null,
        week_number: null
      };
    });

    if (transformedGames.length > 0) {
      const { error: upsertError } = await supabase
        .from('games_schedule')
        .upsert(transformedGames, {
          onConflict: 'game_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting games:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully upserted ${transformedGames.length} games to database`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        gamesCount: transformedGames.length,
        sport: mapSportKey(sport),
        source: 'odds_api',
        games: transformedGames
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-odds-api-scores:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function mapSportKey(sportKey: string): string {
  const mapping: Record<string, string> = {
    'basketball_nba': 'NBA',
    'americanfootball_nfl': 'NFL',
    'baseball_mlb': 'MLB',
    'icehockey_nhl': 'NHL',
    'basketball_wnba': 'WNBA'
  };
  return mapping[sportKey] || sportKey.toUpperCase();
}
