import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sportsDataKey = Deno.env.get('SPORTSDATA_IO_API_KEY');
    if (!sportsDataKey) {
      throw new Error('SPORTSDATA_IO_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sport } = await req.json();
    console.log(`Fetching player data for ${sport}...`);

    const sportMap: Record<string, string> = {
      'NBA': 'nba',
      'NFL': 'nfl',
      'MLB': 'mlb',
      'NHL': 'nhl',
      'WNBA': 'wnba'
    };

    const sportKey = sportMap[sport] || 'nba';
    const playersUrl = `https://api.sportsdata.io/v3/${sportKey}/scores/json/Players?key=${sportsDataKey}`;

    console.log(`Fetching from Sports Data IO: ${sportKey}`);
    const response = await fetch(playersUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sports Data IO error:`, response.status, errorText);
      throw new Error(`Sports Data IO API error: ${response.status}`);
    }

    const players = await response.json();
    console.log(`Received ${players.length} players from Sports Data IO`);

    // Transform and insert player data
    const playerProfiles = players.map((player: any) => ({
      player_id: player.PlayerID?.toString() || `${sport}-${player.FirstName}-${player.LastName}`,
      player_name: `${player.FirstName || ''} ${player.LastName || ''}`.trim(),
      team: player.Team || 'Free Agent',
      sport: sport,
      position: player.Position || null,
      jersey_number: player.Jersey || null,
      height: player.Height || null,
      weight: player.Weight || null,
      age: player.Age || null,
      birth_date: player.BirthDate || null,
      college: player.College || null,
      draft_year: player.DraftYear || null,
      draft_round: player.DraftRound || null,
      draft_pick: player.DraftPick || null,
      injury_status: player.InjuryStatus || 'Healthy',
      injury_detail: player.InjuryBodyPart || null,
      depth_chart_order: player.DepthChartOrder || null,
      photo_url: player.PhotoUrl || null,
    }));

    // Upsert players
    const { error: insertError } = await supabase
      .from('player_profiles')
      .upsert(playerProfiles, { onConflict: 'player_id' });

    if (insertError) {
      console.error('Error inserting players:', insertError);
      throw insertError;
    }

    console.log(`Successfully upserted ${playerProfiles.length} player profiles`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fetched and stored ${playerProfiles.length} players for ${sport}`,
        count: playerProfiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-sportsdata-players:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
