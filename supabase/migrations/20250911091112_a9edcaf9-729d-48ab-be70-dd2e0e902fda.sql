-- Add unique constraints for proper ON CONFLICT handling

-- Add unique constraint for player_matchups table
ALTER TABLE player_matchups 
ADD CONSTRAINT unique_player_matchup 
UNIQUE (player_name, opponent_name, game_date, stat_type);

-- Add unique constraint for games_schedule table  
ALTER TABLE games_schedule 
ADD CONSTRAINT unique_game_schedule 
UNIQUE (game_id);

-- Add unique constraint for prop_analytics table
ALTER TABLE prop_analytics 
ADD CONSTRAINT unique_prop_analytics 
UNIQUE (player_name, stat_type, sport);

-- Add unique constraint for live_odds table
ALTER TABLE live_odds 
ADD CONSTRAINT unique_live_odds 
UNIQUE (player_name, stat_type, sportsbook);