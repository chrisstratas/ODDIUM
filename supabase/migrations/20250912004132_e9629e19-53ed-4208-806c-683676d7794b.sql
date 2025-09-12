-- Create external_factors table for tracking non-gameplay factors
CREATE TABLE IF NOT EXISTS public.external_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  sport TEXT NOT NULL,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('hot_streak', 'milestone', 'weather', 'altitude', 'injury_concern', 'rest', 'motivation', 'usage_spike', 'travel', 'contract', 'personal')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('positive', 'negative', 'neutral')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  source TEXT NOT NULL,
  game_date DATE,
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.external_factors ENABLE ROW LEVEL SECURITY;

-- Create policies for external_factors
CREATE POLICY "Anyone can view external factors" 
ON public.external_factors 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX idx_external_factors_player_sport ON public.external_factors(player_name, sport);
CREATE INDEX idx_external_factors_game_date ON public.external_factors(game_date);
CREATE INDEX idx_external_factors_type ON public.external_factors(factor_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_external_factors_updated_at
BEFORE UPDATE ON public.external_factors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create player_milestones table for tracking achievements
CREATE TABLE IF NOT EXISTS public.player_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  sport TEXT NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('career_high', 'season_milestone', 'achievement_threshold', 'round_number', 'franchise_record')),
  stat_type TEXT NOT NULL,
  description TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  games_remaining INTEGER,
  likelihood INTEGER CHECK (likelihood >= 0 AND likelihood <= 100),
  season_year INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
  achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for player_milestones
CREATE POLICY "Anyone can view player milestones" 
ON public.player_milestones 
FOR SELECT 
USING (true);

-- Create indexes for player_milestones
CREATE INDEX idx_player_milestones_player_sport ON public.player_milestones(player_name, sport);
CREATE INDEX idx_player_milestones_achieved ON public.player_milestones(achieved);
CREATE INDEX idx_player_milestones_likelihood ON public.player_milestones(likelihood DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_player_milestones_updated_at
BEFORE UPDATE ON public.player_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();