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
const sportsBlazeApiKey = Deno.env.get('SPORTSBLAZE_API_KEY');

// Fetch live odds from SPORTSBLAZE API
const fetchLiveOdds = async () => {
  if (!sportsBlazeApiKey) {
    console.log('No SPORTSBLAZE API key found, skipping live odds fetch');
    return [];
  }

  const sports = ['nba', 'nfl', 'mlb', 'nhl', 'wnba'];
  const allOdds = [];

  for (const sport of sports) {
    try {
      console.log(`Fetching live odds for ${sport.toUpperCase()}...`);
      
      const response = await fetch(`https://api.sportsblaze.io/v1/${sport}/odds/player-props`, {
        headers: {
          'Authorization': `Bearer ${sportsBlazeApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.length || 0} live odds for ${sport.toUpperCase()}`);
        
        for (const prop of data || []) {
          allOdds.push({
            player_name: prop.player_name || prop.player,
            team: prop.team || prop.team_abbreviation,
            stat_type: mapStatType(prop.stat_type || prop.market),
            sport: sport.toUpperCase(),
            line: prop.line || prop.over_under_line || 0,
            over_odds: prop.over_odds || prop.over_price || '+100',
            under_odds: prop.under_odds || prop.under_price || '-110',
            sportsbook: prop.sportsbook || 'SPORTSBLAZE',
            confidence_score: prop.confidence || Math.floor(Math.random() * 35 + 60),
            value_rating: prop.value_rating || getValueRating(prop.over_odds || '+100'),
            last_updated: new Date().toISOString()
          });
        }
      } else {
        console.error(`SPORTSBLAZE ${sport} odds fetch failed:`, response.status, await response.text());
      }
    } catch (error) {
      console.error(`Error fetching ${sport} odds:`, error);
    }
  }

  return allOdds;
};

const mapStatType = (statType: string): string => {
  const mappings: Record<string, string> = {
    'points': 'Points',
    'rebounds': 'Rebounds',
    'assists': 'Assists',
    'three_pointers': '3-Point FG',
    'threes': '3-Point FG',
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'receiving_yards': 'Receiving Yards',
    'receptions': 'Receptions',
    'hits': 'Hits',
    'runs': 'Runs',
    'rbis': 'RBIs',
    'goals': 'Goals',
    'shots_on_goal': 'Shots on Goal'
  };
  
  return mappings[statType.toLowerCase()] || 'Points';
};

const getValueRating = (odds: string): string => {
  const numericOdds = parseInt(odds.replace(/[+\-]/, ''));
  if (numericOdds > 150) return 'high';
  if (numericOdds > 100) return 'medium';
  return 'low';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting live odds fetch from SPORTSBLAZE...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const liveOdds = await fetchLiveOdds();

    if (liveOdds.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No live odds data available'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    // Insert live odds data
    for (const oddsData of liveOdds) {
      const { data: oddsInsert, error: oddsError } = await supabase
        .from('live_odds')
        .upsert(oddsData, {
          onConflict: 'player_name,stat_type,sportsbook'
        });

      if (oddsError) {
        console.error('Odds insertion error:', oddsError);
        continue;
      }

      results.push(oddsData);
    }

    console.log(`Updated ${results.length} live odds from SPORTSBLAZE`);

    return new Response(JSON.stringify({
      success: true,
      message: `Updated ${results.length} live odds`,
      data: results.slice(0, 10),
      total: results.length,
      breakdown: results.reduce((acc, curr) => {
        acc[curr.sport] = (acc[curr.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-live-odds:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch live odds',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});