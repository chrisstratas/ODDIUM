-- Add unique constraint to player_matchups table to support ON CONFLICT operations
ALTER TABLE player_matchups 
ADD CONSTRAINT player_matchups_unique_game 
UNIQUE (player_name, stat_type, game_date, season_year);