-- Allow public read access to transportation_providers
CREATE POLICY "Anyone can read transportation providers" 
ON public.transportation_providers 
FOR SELECT 
USING (true);