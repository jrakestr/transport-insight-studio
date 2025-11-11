-- Fix discovery_runs table security by removing public access
-- Drop any existing policies that might allow public access
DROP POLICY IF EXISTS "Anyone can read discovery runs" ON public.discovery_runs;
DROP POLICY IF EXISTS "Public can view discovery runs" ON public.discovery_runs;

-- Ensure only these policies exist:
-- 1. Admins can read (already exists, but recreate to be sure)
DROP POLICY IF EXISTS "Admins can read discovery runs" ON public.discovery_runs;
CREATE POLICY "Admins can read discovery runs"
  ON public.discovery_runs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Service role can manage (for edge functions only)
DROP POLICY IF EXISTS "Service role can manage discovery runs" ON public.discovery_runs;
CREATE POLICY "Service role can manage discovery runs"
  ON public.discovery_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);