import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Game {
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  gameTime: string;
  venue?: string;
  network?: string;
  homeRecord?: string;
  awayRecord?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  weekNumber?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching sports schedules...');

    const { sport } = await req.json().catch(() => ({ sport: 'all' }));
    const sportsApiKey = Deno.env.get('SPORTS_API_KEY') || Deno.env.get('SPORTSDATA_API_KEY');

    if (!sportsApiKey) {
      console.error('No sports API key found');
      return new Response(
        JSON.stringify({ error: 'Sports API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current date for fetching this week's games
    const now = new Date();
    const currentWeek = now.toISOString().split('T')[0];

    const games: Game[] = [];

    // Fetch NFL schedule (using SportsData.io API format)
    if (sport === 'all' || sport === 'NFL') {
      try {
        const nflResponse = await fetch(
          `https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/2025/3?key=${sportsApiKey}`,
          { headers: { 'Ocp-Apim-Subscription-Key': sportsApiKey } }
        );
        
        if (nflResponse.ok) {
          const nflGames = await nflResponse.json();
          console.log(`Fetched ${nflGames.length} NFL games`);
          
          nflGames.slice(0, 5).forEach((game: any) => {
            games.push({
              gameId: `nfl-${game.GameKey || game.ScoreID}`,
              sport: 'NFL',
              homeTeam: game.HomeTeam || 'TBD',
              awayTeam: game.AwayTeam || 'TBD',
              gameDate: game.Date?.split('T')[0] || currentWeek,
              gameTime: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                timeZoneName: 'short' 
              }) : 'TBD',
              venue: game.StadiumDetails?.Name || 'TBD',
              network: game.Channel || 'TBD',
              homeRecord: `${game.HomeTeamWins || 0}-${game.HomeTeamLosses || 0}`,
              awayRecord: `${game.AwayTeamWins || 0}-${game.AwayTeamLosses || 0}`,
              status: game.Status === 'Final' ? 'final' : game.Status === 'InProgress' ? 'live' : 'scheduled',
              homeScore: game.HomeScore || undefined,
              awayScore: game.AwayScore || undefined,
              weekNumber: game.Week || 3
            });
          });
        }
      } catch (error) {
        console.error('Error fetching NFL data:', error);
      }
    }

    // Fetch NBA schedule (preseason/regular season)
    if (sport === 'all' || sport === 'NBA') {
      try {
        const nbaResponse = await fetch(
          `https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/2025-09-15?key=${sportsApiKey}`,
          { headers: { 'Ocp-Apim-Subscription-Key': sportsApiKey } }
        );
        
        if (nbaResponse.ok) {
          const nbaGames = await nbaResponse.json();
          console.log(`Fetched ${nbaGames.length} NBA games`);
          
          nbaGames.slice(0, 5).forEach((game: any) => {
            games.push({
              gameId: `nba-${game.GameID}`,
              sport: 'NBA',
              homeTeam: game.HomeTeam || 'TBD',
              awayTeam: game.AwayTeam || 'TBD',
              gameDate: game.Day || currentWeek,
              gameTime: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                timeZoneName: 'short' 
              }) : 'TBD',
              venue: game.StadiumDetails?.Name || 'TBD',
              network: game.Channel || 'TBD',
              homeRecord: game.Season?.SeasonType === 'Preseason' ? 'Preseason' : `${game.HomeTeamWins || 0}-${game.HomeTeamLosses || 0}`,
              awayRecord: game.Season?.SeasonType === 'Preseason' ? 'Preseason' : `${game.AwayTeamWins || 0}-${game.AwayTeamLosses || 0}`,
              status: game.Status === 'Final' ? 'final' : game.Status === 'InProgress' ? 'live' : 'scheduled',
              homeScore: game.HomeTeamScore || undefined,
              awayScore: game.AwayTeamScore || undefined
            });
          });
        }
      } catch (error) {
        console.error('Error fetching NBA data:', error);
      }
    }

    // Fetch MLB schedule
    if (sport === 'all' || sport === 'MLB') {
      try {
        const mlbResponse = await fetch(
          `https://api.sportsdata.io/v3/mlb/scores/json/GamesByDate/2025-09-15?key=${sportsApiKey}`,
          { headers: { 'Ocp-Apim-Subscription-Key': sportsApiKey } }
        );
        
        if (mlbResponse.ok) {
          const mlbGames = await mlbResponse.json();
          console.log(`Fetched ${mlbGames.length} MLB games`);
          
          mlbGames.slice(0, 5).forEach((game: any) => {
            games.push({
              gameId: `mlb-${game.GameID}`,
              sport: 'MLB',
              homeTeam: game.HomeTeam || 'TBD',
              awayTeam: game.AwayTeam || 'TBD',
              gameDate: game.Day || currentWeek,
              gameTime: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                timeZoneName: 'short' 
              }) : 'TBD',
              venue: game.StadiumDetails?.Name || 'TBD',
              network: game.Channel || 'TBD',
              homeRecord: `${game.HomeTeamWins || 0}-${game.HomeTeamLosses || 0}`,
              awayRecord: `${game.AwayTeamWins || 0}-${game.AwayTeamLosses || 0}`,
              status: game.Status === 'Final' ? 'final' : game.Status === 'InProgress' ? 'live' : 'scheduled',
              homeScore: game.HomeTeamScore || undefined,
              awayScore: game.AwayTeamScore || undefined
            });
          });
        }
      } catch (error) {
        console.error('Error fetching MLB data:', error);
      }
    }

    // Add some fallback data if API calls fail
    if (games.length === 0) {
      console.log('No games fetched from API, using fallback data');
      // Add current fallback games here as backup
      games.push({
        gameId: 'fallback-nfl-1',
        sport: 'NFL',
        homeTeam: 'Chiefs',
        awayTeam: 'Bills',
        gameDate: '2025-09-14',
        gameTime: '8:20 PM ET',
        venue: 'Arrowhead Stadium',
        network: 'NBC',
        homeRecord: '2-0',
        awayRecord: '2-0',
        status: 'scheduled',
        weekNumber: 2
      });
    }

    // Store games in database
    if (games.length > 0) {
      console.log(`Storing ${games.length} games in database`);
      
      // Clear existing games for this week
      await supabaseClient
        .from('games_schedule')
        .delete()
        .gte('game_date', currentWeek)
        .lte('game_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Insert new games
      const { error: insertError } = await supabaseClient
        .from('games_schedule')
        .insert(
          games.map(game => ({
            game_id: game.gameId,
            sport: game.sport,
            home_team: game.homeTeam,
            away_team: game.awayTeam,
            game_date: game.gameDate,
            game_time: game.gameTime,
            venue: game.venue,
            network: game.network,
            home_record: game.homeRecord,
            away_record: game.awayRecord,
            status: game.status,
            home_score: game.homeScore,
            away_score: game.awayScore,
            week_number: game.weekNumber,
            season_year: 2025
          }))
        );

      if (insertError) {
        console.error('Error inserting games:', insertError);
        throw insertError;
      }
    }

    console.log(`Successfully processed ${games.length} games`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        gamesProcessed: games.length,
        message: 'Schedule updated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-sports-schedule function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});