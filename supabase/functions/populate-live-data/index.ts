import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const apiSportsKey = Deno.env.get('API_SPORTS_KEY');

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
    console.log('Starting live data population...');

    // Generate realistic mock data for demo purposes
    await populateMockLiveOdds(supabase);
    await populateMockPlayerStats(supabase);
    await populateMockPropAnalytics(supabase);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Live data populated successfully'
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

async function populateMockLiveOdds(supabase: any) {
  const mockOdds = [
    // NBA Player Props
    {
      player_name: 'LeBron James',
      team: 'LAL',
      sport: 'NBA',
      stat_type: 'Points',
      line: 25.5,
      over_odds: '-110',
      under_odds: '-110',
      sportsbook: 'DraftKings',
      confidence_score: 78,
      value_rating: 'medium'
    },
    {
      player_name: 'LeBron James',
      team: 'LAL',
      sport: 'NBA',
      stat_type: 'Points',
      line: 26.5,
      over_odds: '-105',
      under_odds: '-115',
      sportsbook: 'FanDuel',
      confidence_score: 75,
      value_rating: 'high'
    },
    {
      player_name: 'Stephen Curry',
      team: 'GSW',
      sport: 'NBA',
      stat_type: 'Three Pointers Made',
      line: 4.5,
      over_odds: '+100',
      under_odds: '-120',
      sportsbook: 'DraftKings',
      confidence_score: 82,
      value_rating: 'high'
    },
    {
      player_name: 'Nikola Jokic',
      team: 'DEN',
      sport: 'NBA',
      stat_type: 'Rebounds',
      line: 12.5,
      over_odds: '-105',
      under_odds: '-115',
      sportsbook: 'BetMGM',
      confidence_score: 85,
      value_rating: 'medium'
    },
    // NFL Props
    {
      player_name: 'Josh Allen',
      team: 'BUF',
      sport: 'NFL',
      stat_type: 'Passing Yards',
      line: 275.5,
      over_odds: '-110',
      under_odds: '-110',
      sportsbook: 'DraftKings',
      confidence_score: 73,
      value_rating: 'low'
    },
    {
      player_name: 'Travis Kelce',
      team: 'KC',
      sport: 'NFL',
      stat_type: 'Receiving Yards',
      line: 65.5,
      over_odds: '-115',
      under_odds: '-105',
      sportsbook: 'FanDuel',
      confidence_score: 79,
      value_rating: 'medium'
    }
  ];

  // Clear existing mock data
  await supabase.from('live_odds').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new mock data
  const { error } = await supabase.from('live_odds').insert(mockOdds);
  if (error) {
    console.error('Error inserting live odds:', error);
  } else {
    console.log(`Inserted ${mockOdds.length} live odds entries`);
  }
}

async function populateMockPlayerStats(supabase: any) {
  const today = new Date();
  const mockStats = [];

  // Generate last 10 games for key players
  const players = [
    { name: 'LeBron James', team: 'LAL', sport: 'NBA' },
    { name: 'Stephen Curry', team: 'GSW', sport: 'NBA' },
    { name: 'Nikola Jokic', team: 'DEN', sport: 'NBA' },
    { name: 'Josh Allen', team: 'BUF', sport: 'NFL' },
    { name: 'Travis Kelce', team: 'KC', sport: 'NFL' }
  ];

  for (const player of players) {
    for (let i = 0; i < 10; i++) {
      const gameDate = new Date(today);
      gameDate.setDate(gameDate.getDate() - (i + 1));

      if (player.sport === 'NBA') {
        // Points
        mockStats.push({
          player_name: player.name,
          team: player.team,
          stat_type: 'Points',
          value: 20 + Math.random() * 15, // 20-35 range
          game_date: gameDate.toISOString().split('T')[0],
          season_year: 2025,
          source: 'mock'
        });

        // Rebounds
        if (player.name === 'Nikola Jokic') {
          mockStats.push({
            player_name: player.name,
            team: player.team,
            stat_type: 'Rebounds',
            value: 10 + Math.random() * 8, // 10-18 range
            game_date: gameDate.toISOString().split('T')[0],
            season_year: 2025,
            source: 'mock'
          });
        }

        // Three Pointers
        if (player.name === 'Stephen Curry') {
          mockStats.push({
            player_name: player.name,
            team: player.team,
            stat_type: 'Three Pointers Made',
            value: 2 + Math.random() * 6, // 2-8 range
            game_date: gameDate.toISOString().split('T')[0],
            season_year: 2025,
            source: 'mock'
          });
        }
      }

      if (player.sport === 'NFL') {
        if (player.name === 'Josh Allen') {
          mockStats.push({
            player_name: player.name,
            team: player.team,
            stat_type: 'Passing Yards',
            value: 200 + Math.random() * 150, // 200-350 range
            game_date: gameDate.toISOString().split('T')[0],
            season_year: 2025,
            source: 'mock'
          });
        }

        if (player.name === 'Travis Kelce') {
          mockStats.push({
            player_name: player.name,
            team: player.team,
            stat_type: 'Receiving Yards',
            value: 30 + Math.random() * 80, // 30-110 range
            game_date: gameDate.toISOString().split('T')[0],
            season_year: 2025,
            source: 'mock'
          });
        }
      }
    }
  }

  // Clear existing mock data
  await supabase.from('player_stats').delete().eq('source', 'mock');

  // Insert new mock data
  const { error } = await supabase.from('player_stats').insert(mockStats);
  if (error) {
    console.error('Error inserting player stats:', error);
  } else {
    console.log(`Inserted ${mockStats.length} player stats entries`);
  }
}

async function populateMockPropAnalytics(supabase: any) {
  const mockAnalytics = [
    {
      player_name: 'LeBron James',
      team: 'LAL',
      sport: 'NBA',
      stat_type: 'Points',
      season_average: 25.8,
      recent_form: 27.2,
      hit_rate: 0.65,
      edge_percentage: 8.5,
      trend_direction: 'up'
    },
    {
      player_name: 'Stephen Curry',
      team: 'GSW',
      sport: 'NBA',
      stat_type: 'Three Pointers Made',
      season_average: 4.2,
      recent_form: 5.1,
      hit_rate: 0.71,
      edge_percentage: 12.3,
      trend_direction: 'up'
    },
    {
      player_name: 'Nikola Jokic',
      team: 'DEN',
      sport: 'NBA',
      stat_type: 'Rebounds',
      season_average: 13.1,
      recent_form: 12.8,
      hit_rate: 0.58,
      edge_percentage: 5.2,
      trend_direction: 'steady'
    },
    {
      player_name: 'Josh Allen',
      team: 'BUF',
      sport: 'NFL',
      stat_type: 'Passing Yards',
      season_average: 268.5,
      recent_form: 285.3,
      hit_rate: 0.62,
      edge_percentage: 7.1,
      trend_direction: 'up'
    },
    {
      player_name: 'Travis Kelce',
      team: 'KC',
      sport: 'NFL',
      stat_type: 'Receiving Yards',
      season_average: 72.3,
      recent_form: 68.1,
      hit_rate: 0.55,
      edge_percentage: -3.2,
      trend_direction: 'down'
    }
  ];

  // Clear existing data
  await supabase.from('prop_analytics').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new data
  const { error } = await supabase.from('prop_analytics').insert(mockAnalytics);
  if (error) {
    console.error('Error inserting prop analytics:', error);
  } else {
    console.log(`Inserted ${mockAnalytics.length} prop analytics entries`);
  }
}