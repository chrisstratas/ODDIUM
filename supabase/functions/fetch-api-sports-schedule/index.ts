import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HighlightlyGame {
  game_id: string;
  sport: string;
  home_team: string;
  away_team: string;
  game_date: string;
  game_time: string;
  venue?: string;
  status: string;
  season_year: number;
  week_number?: number;
  home_score?: number;
  away_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const highlightlyApiKey = Deno.env.get('HIGHLIGHTLY_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Fetching ${sport} daily schedule data from Highlightly for 2025-2026 season...`);

    if (!highlightlyApiKey) {
      console.error('HIGHLIGHTLY_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'Highlightly API key not configured',
        message: 'Please configure HIGHLIGHTLY_API_KEY in Supabase secrets'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Function to fetch daily schedule from Highlightly API
    const fetchHighlightlyDailySchedule = async (sportType: string) => {
      const sportEndpoints: Record<string, string> = {
        'NBA': 'nba',
        'NFL': 'nfl',
        'MLB': 'mlb', 
        'NHL': 'nhl',
        'WNBA': 'wnba'
      };

      const endpoint = sportEndpoints[sportType];
      if (!endpoint) {
        console.log(`No Highlightly endpoint found for ${sportType}`);
        return [];
      }

      try {
        console.log(`Fetching ${sportType} daily schedule from Highlightly...`);
        
        // Get today's date for daily schedule
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`https://api.highlightly.com/v1/${endpoint}/schedule/daily?date=${today}&season=2025-2026`, {
          headers: {
            'Authorization': `Bearer ${highlightlyApiKey}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        });

        if (!response.ok) {
          console.error(`Highlightly ${sportType} daily schedule fetch failed:`, response.status, await response.text());
          return [];
        }

        const data = await response.json();
        console.log(`Received ${data.games?.length || 0} daily games from Highlightly for ${sportType} 2025-2026 season`);

        const transformedGames = [];
        
        for (const game of data.games || []) {
          transformedGames.push({
            id: crypto.randomUUID(),
            game_id: game.game_id || `highlightly_daily_${sportType.toLowerCase()}_${Date.now()}_${Math.random()}`,
            sport: sportType,
            home_team: game.home_team || game.home?.name || 'Home Team',
            away_team: game.away_team || game.away?.name || 'Away Team',
            game_date: game.game_date || game.date || today,
            game_time: game.game_time || game.time || 'TBD',
            venue: game.venue || game.stadium || null,
            network: game.network || game.broadcast || null,
            home_record: game.home_record || null,
            away_record: game.away_record || null,
            status: game.status || 'scheduled',
            home_score: game.home_score || null,
            away_score: game.away_score || null,
            season_year: 2025, // Force 2025-2026 season
            week_number: game.week_number || game.week || null,
            data_source: 'highlightly_daily'
          });
        }

        return transformedGames;
      } catch (error) {
        console.error(`Error fetching ${sportType} daily schedule from Highlightly:`, error);
        return [];
      }
    };

    let allGames: HighlightlyGame[] = [];

    // Determine which sports to fetch
    if (sport === 'all') {
      const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
      
      for (const sportType of sports) {
        const gameData = await fetchHighlightlyDailySchedule(sportType);
        allGames = allGames.concat(gameData);
      }
    } else {
      const gameData = await fetchHighlightlyDailySchedule(sport.toUpperCase());
      allGames = allGames.concat(gameData);
    }

    if (allGames.length === 0) {
      console.log('No daily schedule data available from Highlightly for 2025-2026 season');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No daily schedule data available for 2025-2026 season',
        games_updated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Remove duplicates based on game_id
    const uniqueGames = allGames.filter((game, index, self) => 
      index === self.findIndex(g => g.game_id === game.game_id)
    );

    console.log(`Found ${uniqueGames.length} unique daily games for 2025-2026 season`);

    // Upsert schedule data to Supabase
    const { data, error } = await supabase
      .from('games_schedule')
      .upsert(uniqueGames, { 
        onConflict: 'game_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting daily schedule data:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to update daily schedule',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully updated ${uniqueGames.length} daily games in schedule`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Updated daily schedule with ${uniqueGames.length} games for 2025-2026 season from Highlightly`,
      games_updated: uniqueGames.length,
      season: '2025-2026',
      source: 'Highlightly Daily',
      date: new Date().toISOString().split('T')[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-api-sports-schedule:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch daily schedule',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});