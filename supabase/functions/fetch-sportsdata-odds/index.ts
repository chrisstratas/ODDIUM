import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'WNBA']).optional().default('NBA'),
  date: z.string().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sportsdataApiKey = Deno.env.get('SPORTSDATA_IO_API_KEY');

    if (!sportsdataApiKey) {
      throw new Error('SPORTSDATA_IO_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { sport, date } = requestSchema.parse(body);

    const today = date || new Date().toISOString().split('T')[0];
    console.log(`Fetching ${sport} odds from SportsData IO for ${today}...`);

    const sportKey = sport.toLowerCase();
    const url = `https://api.sportsdata.io/v3/${sportKey}/odds/json/AlternateMarketGameOddsByDate/${today}`;

    const response = await fetch(url, {
      headers: { 'Ocp-Apim-Subscription-Key': sportsdataApiKey }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SportsData IO error: ${response.status} - ${errorText}`);
      throw new Error(`SportsData IO returned ${response.status}: ${errorText}`);
    }

    const oddsData = await response.json();
    console.log(`Fetched ${oddsData.length || 0} games with odds data`);

    const transformedOdds = [];

    for (const game of oddsData || []) {
      if (!game.PregameOdds || !game.AlternateMarketPregameOdds) continue;

      for (const bookmaker of game.PregameOdds) {
        for (const altMarket of game.AlternateMarketPregameOdds || []) {
          if (altMarket.MarketType?.includes('Player')) {
            const statType = mapMarketToStat(altMarket.MarketType);
            
            transformedOdds.push({
              player_name: altMarket.PlayerName || 'Unknown',
              team: game.HomeTeam || 'Unknown',
              sport: sport,
              stat_type: statType,
              line: parseFloat(altMarket.Line) || 0,
              over_odds: formatOdds(altMarket.OverPayout),
              under_odds: formatOdds(altMarket.UnderPayout),
              sportsbook: bookmaker.Name || 'SportsData IO',
              confidence_score: calculateConfidence(altMarket),
              value_rating: getValueRating(altMarket),
              last_updated: new Date().toISOString()
            });
          }
        }
      }
    }

    if (transformedOdds.length > 0) {
      const { error: upsertError } = await supabase
        .from('live_odds')
        .upsert(transformedOdds, {
          onConflict: 'player_name,stat_type,sportsbook',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting odds:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully upserted ${transformedOdds.length} odds records`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        oddsCount: transformedOdds.length,
        sport,
        date: today,
        source: 'sportsdata_io'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-sportsdata-odds:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapMarketToStat(market: string): string {
  const mappings: Record<string, string> = {
    'Player Points': 'Points',
    'Player Rebounds': 'Rebounds',
    'Player Assists': 'Assists',
    'Player Threes': '3-Pointers Made',
    'Player Passing Yards': 'Passing Yards',
    'Player Rushing Yards': 'Rushing Yards',
    'Player Receiving Yards': 'Receiving Yards',
    'Player Receptions': 'Receptions',
    'Player Touchdowns': 'Touchdowns',
    'Player Hits': 'Hits',
    'Player Home Runs': 'Home Runs',
    'Player RBIs': 'RBIs',
    'Player Goals': 'Goals',
    'Player Shots on Goal': 'Shots on Goal'
  };

  for (const key in mappings) {
    if (market.includes(key)) return mappings[key];
  }

  return 'Points';
}

function formatOdds(payout: number | undefined): string {
  if (!payout) return '+100';
  const odds = Math.round((payout - 1) * 100);
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

function calculateConfidence(market: any): number {
  return Math.floor(50 + Math.random() * 40);
}

function getValueRating(market: any): string {
  const random = Math.random();
  if (random > 0.8) return 'high';
  if (random > 0.5) return 'medium';
  return 'low';
}