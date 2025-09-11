import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const highlightlyApiKey = Deno.env.get('HIGHLIGHTLY_API_KEY');

    // Parse filters from URL or body
    let sortBy = 'value';
    let category = 'all';
    let confidence = 'all';
    let sport = 'all';

    try {
      const { searchParams } = new URL(req.url);
      sortBy = searchParams.get('sortBy') || sortBy;
      category = searchParams.get('category') || category;
      confidence = searchParams.get('confidence') || confidence;
      sport = searchParams.get('sport') || sport;
    } catch (_) {}

    try {
      const body = await req.json();
      if (body) {
        if (typeof body.sortBy === 'string') sortBy = body.sortBy;
        if (typeof body.category === 'string') category = body.category;
        if (typeof body.confidence === 'string') confidence = body.confidence;
        if (typeof body.sport === 'string') sport = body.sport;
        if (typeof body.params === 'string') {
          const p = new URLSearchParams(body.params);
          sortBy = p.get('sortBy') || sortBy;
          category = p.get('category') || category;
          confidence = p.get('confidence') || confidence;
          sport = p.get('sport') || sport;
        }
      }
    } catch (_) {}

    console.log('Fetching prop analytics with filters:', { sortBy, category, confidence, sport });

    // First, try to refresh data from Highlightly
    if (highlightlyApiKey) {
      try {
        console.log('Refreshing data from Highlightly...');
        const refreshResponse = await supabase.functions.invoke('fetch-live-analytics', {
          body: { refresh: true }
        });
        if (refreshResponse.error) {
          console.warn('Failed to refresh Highlightly data:', refreshResponse.error);
        } else {
          console.log('Successfully refreshed Highlightly data');
        }
      } catch (error) {
        console.warn('Error refreshing from Highlightly:', error);
      }
    }

    // Build query for live odds
    let oddsQuery = supabase
      .from('live_odds')
      .select('*');

    // Apply sport filter first if specified
    if (sport !== 'all') {
      oddsQuery = oddsQuery.eq('sport', sport);
    }
    
    // Apply filters
    if (category !== 'all') {
      // Handle sport-specific categories
      if (category.startsWith('nba-')) {
        oddsQuery = oddsQuery.eq('sport', 'NBA');
      } else if (category.startsWith('nfl-')) {
        oddsQuery = oddsQuery.eq('sport', 'NFL');
      } else if (category.startsWith('mlb-')) {
        oddsQuery = oddsQuery.eq('sport', 'MLB');
      } else if (category.startsWith('nhl-')) {
        oddsQuery = oddsQuery.eq('sport', 'NHL');
      } else if (category.startsWith('wnba-')) {
        oddsQuery = oddsQuery.eq('sport', 'WNBA');
      }
      
      // Handle specific stat filters (keeping existing NBA filters for compatibility)
      if (category === 'sgp-points' || category.includes('-scoring')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Points');
      } else if (category === 'sgp-rebounds' || category.includes('-rebounds')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Rebounds');
      } else if (category === 'sgp-assists' || category.includes('-assists')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Assists');
      } else if (category === 'sgp-threes' || category.includes('-threes')) {
        oddsQuery = oddsQuery.eq('stat_type', '3-Pointers Made');
      } else if (category.includes('-passing')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Passing Yards');
      } else if (category.includes('-rushing')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Rushing Yards');
      } else if (category.includes('-receiving')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Receiving Yards');
      } else if (category.includes('-hits')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Hits');
      } else if (category.includes('-goals')) {
        oddsQuery = oddsQuery.eq('stat_type', 'Goals');
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

    // Get analytics data for the players - also filter by sport if specified
    let analyticsQuery = supabase
      .from('prop_analytics')
      .select('*');
    
    if (sport !== 'all') {
      analyticsQuery = analyticsQuery.eq('sport', sport);
    }
    
    const { data: analyticsData, error: analyticsError } = await analyticsQuery;

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
      filters: { sortBy, category, confidence, sport }
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