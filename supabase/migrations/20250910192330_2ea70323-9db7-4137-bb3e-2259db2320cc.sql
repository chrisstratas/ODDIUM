-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_sportsbook TEXT DEFAULT 'draftkings',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parlays table for saved parlay builds
CREATE TABLE public.parlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  game_info JSONB NOT NULL, -- Store game details
  total_picks INTEGER NOT NULL DEFAULT 0,
  average_confidence DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parlay_picks table for individual picks within parlays
CREATE TABLE public.parlay_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parlay_id UUID NOT NULL REFERENCES public.parlays(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  prop_type TEXT NOT NULL,
  bet_type TEXT NOT NULL, -- 'over' or 'under'
  line DECIMAL(5,1) NOT NULL,
  odds TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parlay_picks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Parlays policies
CREATE POLICY "Users can view their own parlays" 
ON public.parlays 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parlays" 
ON public.parlays 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parlays" 
ON public.parlays 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parlays" 
ON public.parlays 
FOR DELETE 
USING (auth.uid() = user_id);

-- Parlay picks policies
CREATE POLICY "Users can view their own parlay picks" 
ON public.parlay_picks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parlay picks" 
ON public.parlay_picks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parlay picks" 
ON public.parlay_picks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parlay picks" 
ON public.parlay_picks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parlays_updated_at
  BEFORE UPDATE ON public.parlays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();