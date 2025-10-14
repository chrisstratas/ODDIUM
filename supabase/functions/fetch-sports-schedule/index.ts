import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const oddsApiKey = Deno.env.get('THE_ODDS_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Fetching ${sport} schedule data from The Odds API...`);

    if (!oddsApiKey) {
      console.error('THE_ODDS_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'The Odds API key not configured',
        message: 'Please configure THE_ODDS_API_KEY in Supabase secrets'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sportKeys: Record<string, string> = {
      'NBA': 'basketball_nba',
      'NFL': 'americanfootball_nfl',
      'MLB': 'baseball_mlb',
      'NHL': 'icehockey_nhl',
      'WNBA': 'basketball_wnba'
    };

    const fetchOddsApiSchedule = async (sportType: string) => {
      const sportKey = sportKeys[sportType];
      if (!sportKey) {
        console.log(`No Odds API key found for ${sportType}`);
        return [];
      }

      try {
        console.log(`Fetching ${sportType} schedule from The Odds API...`);
        
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${oddsApiKey}&daysFrom=3`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!response.ok) {
          console.error(`Odds API ${sportType} fetch failed:`, response.status, await response.text());
          return [];
        }

        const data = await response.json();
        console.log(`Received ${data.length || 0} games from The Odds API for ${sportType}`);

        const transformedGames = [];
        const today = new Date().toISOString().split('T')[0];
        
        for (const game of data || []) {
          const gameDate = new Date(game.commence_time);
          transformedGames.push({
            id: crypto.randomUUID(),
            game_id: game.id || `odds_api_${sportType.toLowerCase()}_${Date.now()}_${Math.random()}`,
            sport: sportType,
            home_team: game.home_team || 'Home Team',
            away_team: game.away_team || 'Away Team',
            game_date: gameDate.toISOString().split('T')[0] || today,
            game_time: gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            venue: null,
            network: null,
            home_record: null,
            away_record: null,
            status: game.completed ? 'final' : 'scheduled',
            home_score: game.scores?.find((s: any) => s.name === game.home_team)?.score || null,
            away_score: game.scores?.find((s: any) => s.name === game.away_team)?.score || null,
            season_year: gameDate.getFullYear(),
            week_number: null,
            data_source: 'odds_api'
          });
        }

        return transformedGames;
      } catch (error) {
        console.error(`Error fetching ${sportType} schedule from The Odds API:`, error);
        return [];
      }
    };

    let allGames: any[] = [];

    if (sport === 'all') {
      const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
      
      for (const sportType of sports) {
        const gameData = await fetchOddsApiSchedule(sportType);
        allGames = allGames.concat(gameData);
      }
    } else {
      const gameData = await fetchOddsApiSchedule(sport.toUpperCase());
      allGames = allGames.concat(gameData);
    }

    if (allGames.length === 0) {
      console.log('No schedule data available from The Odds API');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No schedule data available',
        games_updated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uniqueGames = allGames.filter((game, index, self) => 
      index === self.findIndex(g => g.game_id === game.game_id)
    );

    console.log(`Found ${uniqueGames.length} unique games`);

    const { data, error } = await supabase
      .from('games_schedule')
      .upsert(uniqueGames, { 
        onConflict: 'game_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting schedule data:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to update schedule',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully updated ${uniqueGames.length} games in schedule`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Updated schedule with ${uniqueGames.length} games from The Odds API`,
      games_updated: uniqueGames.length,
      source: 'The Odds API'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-sports-schedule:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch schedule',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
