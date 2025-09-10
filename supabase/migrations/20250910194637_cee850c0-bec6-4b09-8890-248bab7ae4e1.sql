-- Create tables for analytics data
CREATE TABLE public.player_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  team text NOT NULL,
  stat_type text NOT NULL,
  value numeric NOT NULL,
  game_date date NOT NULL,
  season_year integer NOT NULL,
  source text NOT NULL DEFAULT 'api',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for live odds data
CREATE TABLE public.live_odds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  team text NOT NULL,
  stat_type text NOT NULL,
  line numeric NOT NULL,
  over_odds text NOT NULL,
  under_odds text NOT NULL,
  sportsbook text NOT NULL,
  confidence_score integer,
  value_rating text,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for analytics calculations
CREATE TABLE public.prop_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  team text NOT NULL,
  stat_type text NOT NULL,
  season_average numeric,
  recent_form numeric,
  hit_rate numeric,
  trend_direction text,
  edge_percentage numeric,
  calculated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_player_stats_player_stat ON public.player_stats(player_name, stat_type);
CREATE INDEX idx_player_stats_date ON public.player_stats(game_date);
CREATE INDEX idx_live_odds_player_stat ON public.live_odds(player_name, stat_type);
CREATE INDEX idx_live_odds_updated ON public.live_odds(last_updated);
CREATE INDEX idx_prop_analytics_player_stat ON public.prop_analytics(player_name, stat_type);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (analytics data should be readable by all users)
CREATE POLICY "Anyone can view player stats" 
ON public.player_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view live odds" 
ON public.live_odds 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view prop analytics" 
ON public.prop_analytics 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_player_stats_updated_at
BEFORE UPDATE ON public.player_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();