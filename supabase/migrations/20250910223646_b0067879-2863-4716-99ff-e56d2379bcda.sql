-- Create access_codes table for premium access
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited uses
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_access table to track which users have used codes
CREATE TABLE public.user_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, access_code_id)
);

-- Enable Row Level Security
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_codes (only viewable by authenticated users)
CREATE POLICY "Authenticated users can view active codes" ON public.access_codes
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for user_access
CREATE POLICY "Users can view their own access" ON public.user_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access" ON public.user_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample access codes
INSERT INTO public.access_codes (code, max_uses, expires_at) VALUES
  ('PREMIUM2024', 100, '2024-12-31 23:59:59+00'),
  ('EARLYACCESS', 50, '2024-06-30 23:59:59+00'),
  ('UNLIMITED', NULL, NULL);

-- Function to check if user has valid access
CREATE OR REPLACE FUNCTION public.user_has_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_access ua
    JOIN public.access_codes ac ON ua.access_code_id = ac.id
    WHERE ua.user_id = user_has_access.user_id 
      AND ua.is_active = true 
      AND ac.is_active = true
      AND (ac.expires_at IS NULL OR ac.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;