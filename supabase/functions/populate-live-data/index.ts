import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Starting live data population from The Odds API...');

    const theOddsApiKey = Deno.env.get('THE_ODDS_API_KEY');
    
    if (!theOddsApiKey) {
      console.error('THE_ODDS_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'THE_ODDS_API_KEY is not configured. Please add it in Supabase secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call all The Odds API functions in parallel
    console.log('Fetching data from The Odds API...');
    
    const [scheduleResult, oddsResult, analyticsResult] = await Promise.allSettled([
      supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'all' } }),
      supabase.functions.invoke('fetch-live-odds'),
      supabase.functions.invoke('populate-prop-analytics')
    ]);

    const results = {
      schedule: scheduleResult.status === 'fulfilled' ? scheduleResult.value.data : { error: scheduleResult.reason },
      odds: oddsResult.status === 'fulfilled' ? oddsResult.value.data : { error: oddsResult.reason },
      analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : { error: analyticsResult.reason }
    };

    console.log('Live data population complete:', results);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Live data populated successfully from The Odds API',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error populating live data:', error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
