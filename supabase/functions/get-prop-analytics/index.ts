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

    // Build query
    let query = supabase
      .from('live_odds')
      .select(`
        *,
        prop_analytics!inner(
          season_average,
          recent_form,
          hit_rate,
          trend_direction,
          edge_percentage
        )
      `);

    // Apply filters
    if (category !== 'all') {
      if (category === 'sgp-points') {
        query = query.eq('stat_type', 'Points');
      } else if (category === 'sgp-rebounds') {
        query = query.eq('stat_type', 'Rebounds');
      } else if (category === 'sgp-assists') {
        query = query.eq('stat_type', 'Assists');
      } else if (category === 'sgp-threes') {
        query = query.eq('stat_type', '3-Pointers Made');
      }
    }

    if (confidence !== 'all') {
      const minConfidence = parseInt(confidence);
      query = query.gte('confidence_score', minConfidence);
    }

    // Apply sorting
    switch (sortBy) {
      case 'confidence':
        query = query.order('confidence_score', { ascending: false });
        break;
      case 'edge':
        query = query.order('prop_analytics.edge_percentage', { ascending: false });
        break;
      case 'hit_rate':
        query = query.order('prop_analytics.hit_rate', { ascending: false });
        break;
      case 'recent_form':
        query = query.order('prop_analytics.recent_form', { ascending: false });
        break;
      default: // value
        query = query.eq('value_rating', 'high').order('confidence_score', { ascending: false });
    }

    const { data: props, error } = await query.limit(20);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

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
      trend: (prop.prop_analytics[0]?.trend_direction === 'up' || prop.prop_analytics[0]?.trend_direction === 'down') 
        ? prop.prop_analytics[0]?.trend_direction as "up" | "down" 
        : 'up' as const,
      recentForm: `${prop.prop_analytics[0]?.recent_form?.toFixed(1)} avg`,
      seasonAvg: prop.prop_analytics[0]?.season_average,
      hitRate: prop.prop_analytics[0]?.hit_rate,
      edge: prop.prop_analytics[0]?.edge_percentage,
      isPopular: prop.confidence_score > 75,
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