-- Create games schedule table
CREATE TABLE public.games_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  sport TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TEXT NOT NULL,
  venue TEXT,
  network TEXT,
  home_record TEXT,
  away_record TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  home_score INTEGER,
  away_score INTEGER,
  week_number INTEGER,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.games_schedule ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view games schedule" 
ON public.games_schedule 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX idx_games_schedule_sport_date ON public.games_schedule(sport, game_date);
CREATE INDEX idx_games_schedule_status ON public.games_schedule(status);
CREATE INDEX idx_games_schedule_week ON public.games_schedule(sport, week_number, season_year);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_games_schedule_updated_at
BEFORE UPDATE ON public.games_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();