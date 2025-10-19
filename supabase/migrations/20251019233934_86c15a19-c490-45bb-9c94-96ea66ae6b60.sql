-- Enable realtime for live_odds table
ALTER TABLE live_odds REPLICA IDENTITY FULL;

-- Create odds movement tracking table
CREATE TABLE IF NOT EXISTS odds_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  stat_type TEXT NOT NULL,
  sport TEXT NOT NULL,
  old_line NUMERIC,
  new_line NUMERIC,
  old_odds TEXT,
  new_odds TEXT,
  movement_size NUMERIC,
  sharp_action BOOLEAN DEFAULT FALSE,
  sportsbook TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on odds_movements
ALTER TABLE odds_movements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view odds movements
CREATE POLICY "Anyone can view odds movements"
  ON odds_movements
  FOR SELECT
  USING (true);

-- Create user refresh preferences table
CREATE TABLE IF NOT EXISTS user_refresh_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_refresh_enabled BOOLEAN DEFAULT TRUE,
  refresh_interval INTEGER DEFAULT 5,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  sports_to_refresh TEXT[] DEFAULT ARRAY['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_refresh_preferences
ALTER TABLE user_refresh_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_refresh_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON user_refresh_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_refresh_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_refresh_preferences_updated_at
  BEFORE UPDATE ON user_refresh_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();