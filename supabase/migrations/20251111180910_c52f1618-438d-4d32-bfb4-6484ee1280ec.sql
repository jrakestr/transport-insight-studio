-- Fix playbooks table security by restricting to authenticated users
DROP POLICY IF EXISTS "Anyone can read playbooks" ON public.playbooks;

CREATE POLICY "Authenticated users can read playbooks"
  ON public.playbooks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);