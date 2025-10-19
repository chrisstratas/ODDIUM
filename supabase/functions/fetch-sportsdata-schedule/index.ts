import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'all']).optional().default('all')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sportsdataApiKey = Deno.env.get('SPORTSDATA_IO_API_KEY');

    if (!sportsdataApiKey) {
      throw new Error('SPORTSDATA_IO_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { sport } = requestSchema.parse(body);

    const sports = sport === 'all' 
      ? ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA']
      : [sport];

    const allGames = [];

    for (const sportName of sports) {
      try {
        const games = await fetchSportSchedule(sportName, sportsdataApiKey);
        allGames.push(...games);
      } catch (error) {
        console.error(`Error fetching ${sportName} schedule:`, error);
      }
    }

    const uniqueGames = Array.from(
      new Map(allGames.map(game => [game.game_id, game])).values()
    );

    if (uniqueGames.length > 0) {
      const { error: upsertError } = await supabase
        .from('games_schedule')
        .upsert(uniqueGames, {
          onConflict: 'game_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting schedule:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully upserted ${uniqueGames.length} games`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        gamesCount: uniqueGames.length,
        sports: sports.join(', '),
        source: 'sportsdata_io'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-sportsdata-schedule:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchSportSchedule(sport: string, apiKey: string): Promise<any[]> {
  const sportKey = sport.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  
  const url = `https://api.sportsdata.io/v3/${sportKey}/scores/json/GamesByDate/${today}`;
  
  console.log(`Fetching ${sport} schedule from SportsData IO...`);

  const response = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`SportsData IO error for ${sport}: ${response.status} - ${errorText}`);
    throw new Error(`SportsData IO returned ${response.status}`);
  }

  const games = await response.json();
  console.log(`Fetched ${games.length || 0} ${sport} games`);

  return games.map((game: any) => {
    const gameDate = game.DateTime || game.Day || today;
    const parsedDate = new Date(gameDate);

    let status = 'scheduled';
    if (game.Status === 'Final' || game.IsClosed) {
      status = 'final';
    } else if (game.Status === 'InProgress' || game.Status === 'Scheduled') {
      status = game.Status === 'InProgress' ? 'live' : 'scheduled';
    }

    return {
      game_id: `sportsdata_${sport}_${game.GameID || game.GameKey}`,
      sport: sport,
      home_team: game.HomeTeam || game.HomeTeamName || 'TBD',
      away_team: game.AwayTeam || game.AwayTeamName || 'TBD',
      game_date: parsedDate.toISOString().split('T')[0],
      game_time: parsedDate.toTimeString().split(' ')[0],
      status,
      home_score: game.HomeScore || null,
      away_score: game.AwayScore || null,
      season_year: game.Season || parsedDate.getFullYear(),
      data_source: 'sportsdata_io',
      venue: game.StadiumDetails?.Name || game.Stadium || null,
      network: game.Channel || null,
      home_record: null,
      away_record: null,
      week_number: game.Week || null
    };
  });
}