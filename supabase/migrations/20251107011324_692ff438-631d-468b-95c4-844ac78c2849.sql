-- Allow public read access to articles (for the public-facing website)
CREATE POLICY "Anyone can read published articles"
ON public.articles
FOR SELECT
TO anon
USING (true);