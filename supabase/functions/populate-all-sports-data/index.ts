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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting comprehensive sports data population...');

    const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
    const results: any = {
      schedule: null,
      odds: null,
      analytics: null,
      players: {},
      projections: {},
      stats: {},
    };

    // 1. Call existing populate-live-data for The Odds API data
    console.log('Fetching data from The Odds API...');
    const { data: liveData, error: liveError } = await supabase.functions.invoke('populate-live-data');
    
    if (liveError) {
      console.error('Error calling populate-live-data:', liveError);
      results.schedule = { success: false, message: liveError.message };
    } else {
      results.schedule = liveData?.schedule || { success: true };
      results.odds = liveData?.odds || { success: true };
      results.analytics = liveData?.analytics || { success: true };
    }

    // 2. Fetch Sports Data IO player profiles for all sports
    console.log('Fetching player profiles from Sports Data IO...');
    for (const sport of sports) {
      try {
        const { data: playerData, error: playerError } = await supabase.functions.invoke(
          'fetch-sportsdata-players',
          { body: { sport } }
        );
        
        if (playerError) {
          console.error(`Error fetching ${sport} players:`, playerError);
          results.players[sport] = { success: false, message: playerError.message };
        } else {
          results.players[sport] = playerData;
        }
      } catch (error) {
        console.error(`Exception fetching ${sport} players:`, error);
        results.players[sport] = { success: false, message: error.message };
      }
    }

    // 3. Fetch Sports Data IO projections for all sports
    console.log('Fetching projections from Sports Data IO...');
    const today = new Date().toISOString().split('T')[0];
    for (const sport of sports) {
      try {
        const { data: projData, error: projError } = await supabase.functions.invoke(
          'fetch-sportsdata-projections',
          { body: { sport, date: today } }
        );
        
        if (projError) {
          console.error(`Error fetching ${sport} projections:`, projError);
          results.projections[sport] = { success: false, message: projError.message };
        } else {
          results.projections[sport] = projData;
        }
      } catch (error) {
        console.error(`Exception fetching ${sport} projections:`, error);
        results.projections[sport] = { success: false, message: error.message };
      }
    }

    // 4. Fetch Sports Data IO season stats for all sports
    console.log('Fetching season stats from Sports Data IO...');
    const currentSeason = new Date().getFullYear();
    for (const sport of sports) {
      try {
        const { data: statsData, error: statsError } = await supabase.functions.invoke(
          'fetch-sportsdata-stats',
          { body: { sport, season: currentSeason } }
        );
        
        if (statsError) {
          console.error(`Error fetching ${sport} stats:`, statsError);
          results.stats[sport] = { success: false, message: statsError.message };
        } else {
          results.stats[sport] = statsData;
        }
      } catch (error) {
        console.error(`Exception fetching ${sport} stats:`, error);
        results.stats[sport] = { success: false, message: error.message };
      }
    }

    // Calculate summary
    const summary = {
      schedule: results.schedule?.success ? '✓' : '✗',
      odds: results.odds?.success ? '✓' : '✗',
      analytics: results.analytics?.success ? '✓' : '✗',
      players: Object.values(results.players).filter((r: any) => r.success).length + '/' + sports.length,
      projections: Object.values(results.projections).filter((r: any) => r.success).length + '/' + sports.length,
      stats: Object.values(results.stats).filter((r: any) => r.success).length + '/' + sports.length,
    };

    console.log('Data population complete:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive data population complete',
        summary,
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-all-sports-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
