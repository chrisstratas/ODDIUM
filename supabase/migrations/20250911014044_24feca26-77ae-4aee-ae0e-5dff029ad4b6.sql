-- Add data_source column to track where data comes from
ALTER TABLE public.games_schedule 
ADD COLUMN data_source text DEFAULT 'api';

-- Add index for better performance on data_source queries
CREATE INDEX idx_games_schedule_data_source ON public.games_schedule(data_source);