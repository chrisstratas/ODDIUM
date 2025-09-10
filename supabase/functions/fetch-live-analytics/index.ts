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
const sportsApiKey = Deno.env.get('SPORTS_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting live analytics fetch...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Mock sports data (replace with real API when available)
    const mockPlayers = [
      { name: "LeBron James", team: "Lakers", stat: "Points" },
      { name: "Stephen Curry", team: "Warriors", stat: "3-Pointers Made" },
      { name: "Giannis Antetokounmpo", team: "Bucks", stat: "Rebounds" },
      { name: "Luka Dončić", team: "Mavericks", stat: "Assists" },
      { name: "Jayson Tatum", team: "Celtics", stat: "Points" },
      { name: "Kevin Durant", team: "Suns", stat: "Points" }
    ];

    const results = [];

    for (const player of mockPlayers) {
      // Simulate fetching player stats
      const seasonAvg = Math.random() * 30 + 15;
      const recentForm = seasonAvg + (Math.random() - 0.5) * 6;
      const hitRate = Math.random() * 30 + 60;
      const edge = Math.random() * 20 - 5;

      // Insert/update analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('prop_analytics')
        .upsert({
          player_name: player.name,
          team: player.team,
          stat_type: player.stat,
          season_average: seasonAvg,
          recent_form: recentForm,
          hit_rate: hitRate,
          trend_direction: recentForm > seasonAvg ? 'up' : 'down',
          edge_percentage: edge
        }, {
          onConflict: 'player_name,stat_type'
        });

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
        continue;
      }

      // Insert live odds
      const line = seasonAvg + (Math.random() - 0.5) * 2;
      const overOdds = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 200 + 100)}` : `-${Math.floor(Math.random() * 200 + 100)}`;
      const underOdds = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 200 + 100)}` : `-${Math.floor(Math.random() * 200 + 100)}`;

      const { data: oddsData, error: oddsError } = await supabase
        .from('live_odds')
        .upsert({
          player_name: player.name,
          team: player.team,
          stat_type: player.stat,
          line: line,
          over_odds: overOdds,
          under_odds: underOdds,
          sportsbook: 'DraftKings',
          confidence_score: Math.floor(hitRate),
          value_rating: edge > 5 ? 'high' : edge > 0 ? 'medium' : 'low',
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'player_name,stat_type,sportsbook'
        });

      if (oddsError) {
        console.error('Odds error:', oddsError);
        continue;
      }

      results.push({
        player: player.name,
        team: player.team,
        stat: player.stat,
        analytics: analyticsData,
        odds: oddsData
      });
    }

    console.log(`Updated analytics for ${results.length} players`);

    return new Response(JSON.stringify({
      success: true,
      message: `Updated analytics for ${results.length} players`,
      data: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-live-analytics:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});