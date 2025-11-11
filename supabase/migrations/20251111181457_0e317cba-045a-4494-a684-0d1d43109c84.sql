-- Fix article_agencies to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read article agencies" ON public.article_agencies;

CREATE POLICY "Authenticated users can read article agencies"
  ON public.article_agencies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix article_providers to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read article providers" ON public.article_providers;

CREATE POLICY "Authenticated users can read article providers"
  ON public.article_providers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix article_verticals to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read article verticals" ON public.article_verticals;

CREATE POLICY "Authenticated users can read article verticals"
  ON public.article_verticals
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix agency_contractors to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read agency contractors" ON public.agency_contractors;

CREATE POLICY "Authenticated users can read agency contractors"
  ON public.agency_contractors
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix articles to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read articles" ON public.articles;

CREATE POLICY "Authenticated users can read articles"
  ON public.articles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix opportunities to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON public.opportunities;

CREATE POLICY "Authenticated users can read opportunities"
  ON public.opportunities
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix reports to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read reports" ON public.reports;

CREATE POLICY "Authenticated users can read reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix transportation_providers to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read transportation providers" ON public.transportation_providers;

CREATE POLICY "Authenticated users can read transportation providers"
  ON public.transportation_providers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix playbooks to require proper authentication
DROP POLICY IF EXISTS "Authenticated users can read playbooks" ON public.playbooks;

CREATE POLICY "Authenticated users can read playbooks"
  ON public.playbooks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);