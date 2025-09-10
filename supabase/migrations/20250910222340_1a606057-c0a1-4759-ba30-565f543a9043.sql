-- Add sport column to both tables to enable sport-specific filtering
ALTER TABLE public.live_odds ADD COLUMN sport text;
ALTER TABLE public.prop_analytics ADD COLUMN sport text;

-- Create indexes for better performance
CREATE INDEX idx_live_odds_sport ON public.live_odds(sport);
CREATE INDEX idx_prop_analytics_sport ON public.prop_analytics(sport);