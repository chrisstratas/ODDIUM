-- Add unique constraints to support upsert operations
ALTER TABLE prop_analytics ADD CONSTRAINT prop_analytics_unique_player_stat UNIQUE (player_name, stat_type);

ALTER TABLE live_odds ADD CONSTRAINT live_odds_unique_player_stat_book UNIQUE (player_name, stat_type, sportsbook);