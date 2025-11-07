-- Create transit_agencies table
CREATE TABLE public.transit_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  formal_name TEXT,
  location TEXT,
  ntd_id TEXT,
  fleet_size INTEGER,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transportation_providers table
CREATE TABLE public.transportation_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT,
  location TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT,
  source_url TEXT,
  source_name TEXT,
  image_url TEXT,
  author_name TEXT,
  author_role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create article_agencies junction table
CREATE TABLE public.article_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  mention_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, agency_id)
);

-- Create article_providers junction table
CREATE TABLE public.article_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.transportation_providers(id) ON DELETE CASCADE,
  mention_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, provider_id)
);

-- Create article_verticals junction table
CREATE TABLE public.article_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  vertical TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, vertical)
);

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  agency_id UUID REFERENCES public.transit_agencies(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.transportation_providers(id) ON DELETE SET NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_url TEXT,
  read_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Enable RLS on all tables
ALTER TABLE public.transit_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to read all data
CREATE POLICY "Authenticated users can read transit agencies"
ON public.transit_agencies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read transportation providers"
ON public.transportation_providers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read articles"
ON public.articles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read article agencies"
ON public.article_agencies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read article providers"
ON public.article_providers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read article verticals"
ON public.article_verticals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read opportunities"
ON public.opportunities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read reports"
ON public.reports FOR SELECT
TO authenticated
USING (true);

-- RLS Policies: Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert transit agencies"
ON public.transit_agencies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transit agencies"
ON public.transit_agencies FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete transit agencies"
ON public.transit_agencies FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert transportation providers"
ON public.transportation_providers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transportation providers"
ON public.transportation_providers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete transportation providers"
ON public.transportation_providers FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
ON public.articles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete articles"
ON public.articles FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert article agencies"
ON public.article_agencies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article agencies"
ON public.article_agencies FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert article providers"
ON public.article_providers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article providers"
ON public.article_providers FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert article verticals"
ON public.article_verticals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article verticals"
ON public.article_verticals FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert opportunities"
ON public.opportunities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
ON public.opportunities FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete opportunities"
ON public.opportunities FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reports"
ON public.reports FOR DELETE
TO authenticated
USING (true);

-- Storage policies for article-images bucket
CREATE POLICY "Authenticated users can view article images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can update article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can delete article images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on tables with updated_at column
CREATE TRIGGER update_transit_agencies_updated_at
BEFORE UPDATE ON public.transit_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transportation_providers_updated_at
BEFORE UPDATE ON public.transportation_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_article_agencies_article_id ON public.article_agencies(article_id);
CREATE INDEX idx_article_agencies_agency_id ON public.article_agencies(agency_id);
CREATE INDEX idx_article_providers_article_id ON public.article_providers(article_id);
CREATE INDEX idx_article_providers_provider_id ON public.article_providers(provider_id);
CREATE INDEX idx_article_verticals_article_id ON public.article_verticals(article_id);
CREATE INDEX idx_article_verticals_vertical ON public.article_verticals(vertical);
CREATE INDEX idx_opportunities_agency_id ON public.opportunities(agency_id);
CREATE INDEX idx_opportunities_provider_id ON public.opportunities(provider_id);
CREATE INDEX idx_reports_slug ON public.reports(slug);
CREATE INDEX idx_reports_published_at ON public.reports(published_at DESC);