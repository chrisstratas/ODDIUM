-- Update default sportsbook to FanDuel
ALTER TABLE public.profiles 
ALTER COLUMN preferred_sportsbook SET DEFAULT 'fanduel';