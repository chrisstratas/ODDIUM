-- Create player matchups table for head-to-head performance tracking
CREATE TABLE public.player_matchups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    player_team TEXT NOT NULL,
    opponent_team TEXT NOT NULL,
    game_date DATE NOT NULL,
    stat_type TEXT NOT NULL,
    player_value NUMERIC NOT NULL,
    opponent_value NUMERIC NOT NULL,
    player_line NUMERIC,
    result TEXT CHECK (result IN ('over', 'under', 'push')),
    sport TEXT NOT NULL DEFAULT 'NBA',
    season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_matchups ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (read-only for analytics)
CREATE POLICY "Anyone can view player matchups" 
ON public.player_matchups 
FOR SELECT 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_player_matchups_player_opponent ON public.player_matchups (player_name, opponent_name, sport);
CREATE INDEX idx_player_matchups_date ON public.player_matchups (game_date DESC);
CREATE INDEX idx_player_matchups_stat_type ON public.player_matchups (stat_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_player_matchups_updated_at
BEFORE UPDATE ON public.player_matchups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();