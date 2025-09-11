-- Enable real-time updates for games_schedule table
ALTER TABLE public.games_schedule REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.games_schedule;

-- Enable real-time updates for live_odds table  
ALTER TABLE public.live_odds REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_odds;

-- Enable real-time updates for player_matchups table
ALTER TABLE public.player_matchups REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_matchups;