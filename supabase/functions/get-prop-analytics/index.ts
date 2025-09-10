import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);
    
    const sortBy = searchParams.get('sortBy') || 'value';
    const category = searchParams.get('category') || 'all';
    const confidence = searchParams.get('confidence') || 'all';

    console.log('Fetching prop analytics with filters:', { sortBy, category, confidence });

    // Build query for live odds
    let oddsQuery = supabase
      .from('live_odds')
      .select('*');

    // Apply filters
    if (category !== 'all') {
      if (category === 'sgp-points') {
        oddsQuery = oddsQuery.eq('stat_type', 'Points');
      } else if (category === 'sgp-rebounds') {
        oddsQuery = oddsQuery.eq('stat_type', 'Rebounds');
      } else if (category === 'sgp-assists') {
        oddsQuery = oddsQuery.eq('stat_type', 'Assists');
      } else if (category === 'sgp-threes') {
        oddsQuery = oddsQuery.eq('stat_type', '3-Pointers Made');
      }
    }

    if (confidence !== 'all') {
      const minConfidence = parseInt(confidence);
      oddsQuery = oddsQuery.gte('confidence_score', minConfidence);
    }

    // Get live odds
    const { data: oddsData, error: oddsError } = await oddsQuery.limit(50);

    if (oddsError) {
      console.error('Odds query error:', oddsError);
      throw oddsError;
    }

    // Get analytics data for the players
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('prop_analytics')
      .select('*');

    if (analyticsError) {
      console.error('Analytics query error:', analyticsError);
      throw analyticsError;
    }

    // Combine the data
    const combinedData = oddsData?.map(odds => {
      const analytics = analyticsData?.find(a => 
        a.player_name === odds.player_name && a.stat_type === odds.stat_type
      );
      
      return {
        ...odds,
        analytics: analytics || {}
      };
    }) || [];

    // Apply sorting to the combined data
    let sortedData = [...combinedData];
    
    switch (sortBy) {
      case 'confidence':
        sortedData.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
        break;
      case 'edge':
        sortedData.sort((a, b) => (b.analytics?.edge_percentage || 0) - (a.analytics?.edge_percentage || 0));
        break;
      case 'hit_rate':
        sortedData.sort((a, b) => (b.analytics?.hit_rate || 0) - (a.analytics?.hit_rate || 0));
        break;
      case 'recent_form':
        sortedData.sort((a, b) => (b.analytics?.recent_form || 0) - (a.analytics?.recent_form || 0));
        break;
      default: // value
        sortedData = sortedData.filter(item => item.value_rating === 'high')
          .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
    }

    // Take top results
    const props = sortedData.slice(0, 20);

    // Transform data for frontend
    const formattedProps = props?.map(prop => ({
      player: prop.player_name,
      team: prop.team,
      stat: prop.stat_type,
      line: prop.line,
      overOdds: prop.over_odds,
      underOdds: prop.under_odds,
      confidence: prop.confidence_score,
      valueRating: (prop.value_rating as "high" | "medium" | "low") || "medium",
      trend: (prop.analytics?.trend_direction === 'up' || prop.analytics?.trend_direction === 'down') 
        ? prop.analytics?.trend_direction as "up" | "down" 
        : 'up' as const,
      recentForm: `${prop.analytics?.recent_form?.toFixed(1) || '0.0'} avg`,
      seasonAvg: prop.analytics?.season_average || 0,
      hitRate: prop.analytics?.hit_rate || 0,
      edge: prop.analytics?.edge_percentage || 0,
      isPopular: (prop.confidence_score || 0) > 75,
      sportsbook: prop.sportsbook,
      lastUpdated: prop.last_updated
    })) || [];

    return new Response(JSON.stringify({
      props: formattedProps,
      total: formattedProps.length,
      filters: { sortBy, category, confidence }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-prop-analytics:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});