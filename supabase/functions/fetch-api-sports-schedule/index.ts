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
    const sportradarApiKey = Deno.env.get('SPORTRADAR_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    
    console.log(`Fetching ${sport} schedule data from SportRadar for 2025 season...`);

    if (!sportradarApiKey) {
      console.error('SPORTRADAR_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'SportRadar API key not configured',
        message: 'Please configure SPORTRADAR_API_KEY in Supabase secrets'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Function to fetch schedule from SportRadar API
    const fetchSportRadarSchedule = async (sportType: string) => {
      if (sportType !== 'NFL') {
        console.log(`SportRadar only supports NFL currently, ${sportType} not supported`);
        return [];
      }

      try {
        console.log(`Fetching ${sportType} schedule from SportRadar...`);
        
        const response = await fetch(`https://api.sportradar.com/nfl/official/trial/v7/en/games/2025/REG/schedule.json`, {
          headers: {
            'accept': 'application/json'
          },
          method: 'GET'
        });

        if (!response.ok) {
          console.error(`SportRadar ${sportType} schedule fetch failed:`, response.status, await response.text());
          return [];
        }

        const data = await response.json();
        console.log(`Received ${data.games?.length || 0} games from SportRadar for ${sportType} 2025 season`);

        const transformedGames = [];
        
        for (const game of data.games || []) {
          // Parse date and time from scheduled timestamp
          const scheduledDate = new Date(game.scheduled);
          const gameDate = scheduledDate.toISOString().split('T')[0];
          const gameTime = scheduledDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });

          transformedGames.push({
            id: crypto.randomUUID(),
            game_id: game.id || `sportradar_${sportType.toLowerCase()}_${Date.now()}_${Math.random()}`,
            sport: sportType,
            home_team: game.home?.name || 'Home Team',
            away_team: game.away?.name || 'Away Team',
            game_date: gameDate,
            game_time: gameTime,
            venue: game.venue?.name || null,
            network: game.broadcast?.network || null,
            home_record: null, // SportRadar doesn't provide record in schedule
            away_record: null,
            status: game.status || 'scheduled',
            home_score: game.home_points || null,
            away_score: game.away_points || null,
            season_year: 2025,
            week_number: game.week || null,
            data_source: 'sportradar'
          });
        }

        return transformedGames;
      } catch (error) {
        console.error(`Error fetching ${sportType} schedule from SportRadar:`, error);
        return [];
      }
    };

    let allGames: HighlightlyGame[] = [];

    // Determine which sports to fetch
    if (sport === 'all') {
      // Only fetch NFL from SportRadar for now
      const gameData = await fetchSportRadarSchedule('NFL');
      allGames = allGames.concat(gameData);
    } else {
      const gameData = await fetchSportRadarSchedule(sport.toUpperCase());
      allGames = allGames.concat(gameData);
    }

    if (allGames.length === 0) {
      console.log('No schedule data available from SportRadar for 2025 season');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No schedule data available for 2025 season',
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
      message: `Updated schedule with ${uniqueGames.length} games for 2025 season from SportRadar`,
      games_updated: uniqueGames.length,
      season: '2025',
      source: 'SportRadar',
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