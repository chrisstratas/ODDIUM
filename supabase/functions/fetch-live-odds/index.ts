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
const oddsApiKey = Deno.env.get('THE_ODDS_API_KEY');

const fetchLiveOdds = async () => {
  if (!oddsApiKey) {
    console.log('No THE_ODDS_API_KEY found, skipping live odds fetch');
    return [];
  }

  const sportKeys = ['basketball_nba', 'americanfootball_nfl', 'baseball_mlb', 'icehockey_nhl', 'basketball_wnba'];
  const allOdds = [];

  for (const sportKey of sportKeys) {
    try {
      console.log(`Fetching live odds for ${sportKey}...`);
      
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${oddsApiKey}&regions=us&markets=player_points,player_rebounds,player_assists,player_threes,h2h&oddsFormat=american`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.length || 0} games with odds for ${sportKey}`);
        
        for (const game of data || []) {
          for (const bookmaker of game.bookmakers || []) {
            for (const market of bookmaker.markets || []) {
              if (market.key.startsWith('player_')) {
                for (const outcome of market.outcomes || []) {
                  const statType = mapMarketToStat(market.key);
                  allOdds.push({
                    player_name: outcome.description || outcome.name,
                    team: outcome.name === game.home_team ? game.home_team : game.away_team,
                    stat_type: statType,
                    sport: mapSportKey(sportKey),
                    line: outcome.point || 0,
                    over_odds: outcome.name === 'Over' ? formatOdds(outcome.price) : '+100',
                    under_odds: outcome.name === 'Under' ? formatOdds(outcome.price) : '-110',
                    sportsbook: bookmaker.title || 'Unknown',
                    confidence_score: Math.floor(Math.random() * 35 + 60),
                    value_rating: getValueRating(outcome.price),
                    last_updated: new Date().toISOString()
                  });
                }
              }
            }
          }
        }
      } else {
        console.error(`The Odds API ${sportKey} fetch failed:`, response.status, await response.text());
      }
    } catch (error) {
      console.error(`Error fetching ${sportKey} odds:`, error);
    }
  }

  return allOdds;
};

const mapMarketToStat = (market: string): string => {
  const mappings: Record<string, string> = {
    'player_points': 'Points',
    'player_rebounds': 'Rebounds',
    'player_assists': 'Assists',
    'player_threes': '3-Point FG',
    'player_pass_tds': 'Passing TDs',
    'player_pass_yds': 'Passing Yards',
    'player_rush_yds': 'Rushing Yards',
    'player_receptions': 'Receptions'
  };
  
  return mappings[market] || 'Points';
};

const mapSportKey = (sportKey: string): string => {
  const mappings: Record<string, string> = {
    'basketball_nba': 'NBA',
    'americanfootball_nfl': 'NFL',
    'baseball_mlb': 'MLB',
    'icehockey_nhl': 'NHL',
    'basketball_wnba': 'WNBA'
  };
  
  return mappings[sportKey] || 'NBA';
};

const formatOdds = (price: number): string => {
  return price > 0 ? `+${price}` : `${price}`;
};

const getValueRating = (odds: number): string => {
  const numericOdds = Math.abs(odds);
  if (numericOdds > 150) return 'high';
  if (numericOdds > 100) return 'medium';
  return 'low';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting live odds fetch from The Odds API...');
    
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

    console.log(`Updated ${results.length} live odds from The Odds API`);

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
