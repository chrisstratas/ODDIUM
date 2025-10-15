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

    const { sport, season } = await req.json();
    const currentSeason = season || new Date().getFullYear();
    
    console.log(`Fetching stats for ${sport} season ${currentSeason}...`);

    const sportMap: Record<string, string> = {
      'NBA': 'nba',
      'NFL': 'nfl',
      'MLB': 'mlb',
      'NHL': 'nhl',
      'WNBA': 'wnba'
    };

    const sportKey = sportMap[sport] || 'nba';
    const statsUrl = `https://api.sportsdata.io/v3/${sportKey}/stats/json/PlayerSeasonStats/${currentSeason}?key=${sportsDataKey}`;

    console.log(`Fetching from Sports Data IO stats API`);
    const response = await fetch(statsUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sports Data IO error:`, response.status, errorText);
      
      if (response.status === 404 || response.status === 422) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `No stats available for ${sport} season ${currentSeason}`,
            count: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Sports Data IO API error: ${response.status}`);
    }

    const stats = await response.json();
    console.log(`Received ${stats?.length || 0} player season stats`);

    if (!stats || stats.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `No stats available for ${sport}`,
          count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform stats based on sport
    const transformedStats = stats.slice(0, 200).map((stat: any) => {
      const baseStats = {
        player_name: stat.Name || `${stat.FirstName || ''} ${stat.LastName || ''}`.trim(),
        team: stat.Team || 'Unknown',
        season_year: currentSeason,
        source: 'sportsdata_io',
        game_date: new Date().toISOString().split('T')[0],
        minutes_played: stat.Minutes || null,
        usage_rate: stat.UsageRatePercentage || null,
        plus_minus: stat.PlusMinus || null,
      };

      if (sport === 'NBA' || sport === 'WNBA') {
        return [{
          ...baseStats,
          stat_type: 'points',
          value: stat.Points || 0,
          field_goal_percentage: stat.FieldGoalsPercentage || null,
          three_point_percentage: stat.ThreePointersPercentage || null,
          free_throw_percentage: stat.FreeThrowsPercentage || null,
        }, {
          ...baseStats,
          stat_type: 'rebounds',
          value: stat.Rebounds || 0,
        }, {
          ...baseStats,
          stat_type: 'assists',
          value: stat.Assists || 0,
        }];
      } else if (sport === 'NFL') {
        return [{
          ...baseStats,
          stat_type: 'passing_yards',
          value: stat.PassingYards || 0,
        }, {
          ...baseStats,
          stat_type: 'rushing_yards',
          value: stat.RushingYards || 0,
        }, {
          ...baseStats,
          stat_type: 'receiving_yards',
          value: stat.ReceivingYards || 0,
        }];
      }
      
      return [baseStats];
    }).flat();

    const { error: insertError } = await supabase
      .from('player_stats')
      .upsert(transformedStats, { ignoreDuplicates: true });

    if (insertError) {
      console.error('Error inserting stats:', insertError);
      throw insertError;
    }

    console.log(`Successfully upserted ${transformedStats.length} player stats`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fetched and stored ${transformedStats.length} stats for ${sport}`,
        count: transformedStats.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-sportsdata-stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
