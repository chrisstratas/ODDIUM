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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Populating player matchups...');

    // Sample NBA players and their typical opponents
    const players = [
      { name: 'LeBron James', team: 'LAL', opponents: ['Stephen Curry', 'Luka Doncic', 'Jayson Tatum'] },
      { name: 'Stephen Curry', team: 'GSW', opponents: ['LeBron James', 'Damian Lillard', 'Ja Morant'] },
      { name: 'Luka Doncic', team: 'DAL', opponents: ['LeBron James', 'Nikola Jokic', 'Shai Gilgeous-Alexander'] },
      { name: 'Jayson Tatum', team: 'BOS', opponents: ['LeBron James', 'Kevin Durant', 'Jimmy Butler'] },
      { name: 'Nikola Jokic', team: 'DEN', opponents: ['Anthony Davis', 'Joel Embiid', 'Giannis Antetokounmpo'] },
      { name: 'Giannis Antetokounmpo', team: 'MIL', opponents: ['Joel Embiid', 'Kevin Durant', 'Jayson Tatum'] }
    ];

    const teams = {
      'LAL': 'Lakers', 'GSW': 'Warriors', 'DAL': 'Mavericks', 'BOS': 'Celtics', 
      'DEN': 'Nuggets', 'MIL': 'Bucks', 'PHI': '76ers', 'BKN': 'Nets', 'MIA': 'Heat'
    };

    const statTypes = ['points', 'rebounds', 'assists', 'steals', 'blocks', 'three_pointers'];

    const matchupsToInsert = [];

    // Generate historical matchup data for each player
    for (const player of players) {
      for (const opponent of player.opponents) {
        for (const statType of statTypes) {
          // Generate 10 games of historical data
          for (let gameIndex = 0; gameIndex < 10; gameIndex++) {
            const gameDate = new Date();
            gameDate.setDate(gameDate.getDate() - (gameIndex * 7 + Math.floor(Math.random() * 7)));

            // Generate realistic stat values based on stat type
            let playerValue, opponentValue, playerLine;
            
            switch (statType) {
              case 'points':
                playerValue = Math.round((Math.random() * 20 + 15) * 10) / 10;
                opponentValue = Math.round((Math.random() * 20 + 15) * 10) / 10;
                playerLine = Math.round(playerValue + (Math.random() - 0.5) * 5);
                break;
              case 'rebounds':
                playerValue = Math.round((Math.random() * 8 + 4) * 10) / 10;
                opponentValue = Math.round((Math.random() * 8 + 4) * 10) / 10;
                playerLine = Math.round(playerValue + (Math.random() - 0.5) * 3);
                break;
              case 'assists':
                playerValue = Math.round((Math.random() * 8 + 3) * 10) / 10;
                opponentValue = Math.round((Math.random() * 8 + 3) * 10) / 10;
                playerLine = Math.round(playerValue + (Math.random() - 0.5) * 2);
                break;
              default:
                playerValue = Math.round((Math.random() * 4 + 1) * 10) / 10;
                opponentValue = Math.round((Math.random() * 4 + 1) * 10) / 10;
                playerLine = Math.round(playerValue + (Math.random() - 0.5) * 2);
            }

            // Determine result based on line
            let result = null;
            if (playerLine) {
              if (playerValue > playerLine) result = 'over';
              else if (playerValue < playerLine) result = 'under';
              else result = 'push';
            }

            const opponentTeam = Object.keys(teams)[Math.floor(Math.random() * Object.keys(teams).length)];

            matchupsToInsert.push({
              player_name: player.name,
              opponent_name: opponent,
              player_team: player.team,
              opponent_team: opponentTeam,
              game_date: gameDate.toISOString().split('T')[0],
              stat_type: statType,
              player_value: playerValue,
              opponent_value: opponentValue,
              player_line: playerLine,
              result: result,
              sport: 'NBA',
              season_year: 2024
            });
          }
        }
      }
    }

    console.log(`Inserting ${matchupsToInsert.length} matchup records...`);

    // Insert matchups in batches
    const batchSize = 100;
    for (let i = 0; i < matchupsToInsert.length; i += batchSize) {
      const batch = matchupsToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await supabaseClient
        .from('player_matchups')
        .upsert(batch, { 
          onConflict: 'player_name,opponent_name,game_date,stat_type',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error inserting batch:', insertError);
        throw insertError;
      }
    }

    console.log('Player matchups populated successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Player matchups populated successfully',
        records: matchupsToInsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-matchups function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});