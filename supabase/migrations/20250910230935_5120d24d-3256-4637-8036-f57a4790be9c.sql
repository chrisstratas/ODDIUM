-- Fix security vulnerability: Restrict access_codes visibility to assigned users only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view active codes" ON public.access_codes;

-- Create a new secure policy that only allows users to see codes they have access to
CREATE POLICY "Users can only view their assigned access codes" 
ON public.access_codes 
FOR SELECT 
TO authenticated 
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 
    FROM public.user_access ua 
    WHERE ua.access_code_id = access_codes.id 
      AND ua.user_id = auth.uid() 
      AND ua.is_active = true
  )
);

-- Optional: Add policy for admins to view all codes (if you have admin roles)
-- This would require a user roles system - uncomment if needed:
-- CREATE POLICY "Admins can view all access codes" 
-- ON public.access_codes 
-- FOR SELECT 
-- TO authenticated 
-- USING (
--   EXISTS (
--     SELECT 1 
--     FROM public.user_roles ur 
--     WHERE ur.user_id = auth.uid() 
--       AND ur.role = 'admin'
--   )
-- );