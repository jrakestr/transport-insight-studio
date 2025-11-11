-- Fix transit_agencies to properly require authentication
DROP POLICY IF EXISTS "Authenticated users can read transit agencies" ON public.transit_agencies;

CREATE POLICY "Authenticated users can read transit agencies"
  ON public.transit_agencies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);