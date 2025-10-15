-- Create player_profiles table for comprehensive player information
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text NOT NULL UNIQUE,
  player_name text NOT NULL,
  team text NOT NULL,
  sport text NOT NULL,
  position text,
  jersey_number integer,
  height text,
  weight integer,
  age integer,
  birth_date date,
  college text,
  draft_year integer,
  draft_round integer,
  draft_pick integer,
  injury_status text DEFAULT 'Healthy',
  injury_detail text,
  depth_chart_order integer,
  career_stats jsonb DEFAULT '{}'::jsonb,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create player_projections table for performance projections
CREATE TABLE IF NOT EXISTS public.player_projections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text NOT NULL,
  player_name text NOT NULL,
  team text NOT NULL,
  sport text NOT NULL,
  game_date date NOT NULL,
  projected_stats jsonb DEFAULT '{}'::jsonb,
  dfs_draftkings_points numeric,
  dfs_fanduel_points numeric,
  confidence_score integer,
  matchup_rating text,
  projection_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create live_game_stats table for real-time game statistics
CREATE TABLE IF NOT EXISTS public.live_game_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id text NOT NULL,
  sport text NOT NULL,
  quarter_period text,
  time_remaining text,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  player_stats jsonb DEFAULT '[]'::jsonb,
  team_stats jsonb DEFAULT '{}'::jsonb,
  last_play text,
  game_status text DEFAULT 'scheduled',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhance games_schedule table with venue and betting info
ALTER TABLE public.games_schedule
ADD COLUMN IF NOT EXISTS venue_capacity integer,
ADD COLUMN IF NOT EXISTS venue_location text,
ADD COLUMN IF NOT EXISTS weather_condition text,
ADD COLUMN IF NOT EXISTS weather_temp integer,
ADD COLUMN IF NOT EXISTS broadcast_network text,
ADD COLUMN IF NOT EXISTS broadcast_streaming text,
ADD COLUMN IF NOT EXISTS game_importance text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS spread numeric,
ADD COLUMN IF NOT EXISTS total_line numeric,
ADD COLUMN IF NOT EXISTS moneyline_home integer,
ADD COLUMN IF NOT EXISTS moneyline_away integer;

-- Enhance player_stats table with detailed game context
ALTER TABLE public.player_stats
ADD COLUMN IF NOT EXISTS home_away text,
ADD COLUMN IF NOT EXISTS opponent_team text,
ADD COLUMN IF NOT EXISTS minutes_played numeric,
ADD COLUMN IF NOT EXISTS field_goal_percentage numeric,
ADD COLUMN IF NOT EXISTS three_point_percentage numeric,
ADD COLUMN IF NOT EXISTS free_throw_percentage numeric,
ADD COLUMN IF NOT EXISTS plus_minus integer,
ADD COLUMN IF NOT EXISTS usage_rate numeric;

-- Enhance live_odds table with spread and line movement tracking
ALTER TABLE public.live_odds
ADD COLUMN IF NOT EXISTS spread numeric,
ADD COLUMN IF NOT EXISTS total_line numeric,
ADD COLUMN IF NOT EXISTS moneyline integer,
ADD COLUMN IF NOT EXISTS opening_line numeric,
ADD COLUMN IF NOT EXISTS line_movement text DEFAULT 'stable';

-- Enable RLS on new tables
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_game_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for player_profiles (public read)
CREATE POLICY "Anyone can view player profiles"
ON public.player_profiles FOR SELECT
USING (true);

-- Create RLS policies for player_projections (public read)
CREATE POLICY "Anyone can view player projections"
ON public.player_projections FOR SELECT
USING (true);

-- Create RLS policies for live_game_stats (public read)
CREATE POLICY "Anyone can view live game stats"
ON public.live_game_stats FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_profiles_player_id ON public.player_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_sport ON public.player_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_player_profiles_team ON public.player_profiles(team);
CREATE INDEX IF NOT EXISTS idx_player_projections_player_id ON public.player_projections(player_id);
CREATE INDEX IF NOT EXISTS idx_player_projections_game_date ON public.player_projections(game_date);
CREATE INDEX IF NOT EXISTS idx_live_game_stats_game_id ON public.live_game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_live_game_stats_sport ON public.live_game_stats(sport);

-- Create trigger for updating updated_at on player_profiles
CREATE TRIGGER update_player_profiles_updated_at
BEFORE UPDATE ON public.player_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();