-- Create pending_articles table for human-in-the-loop review
CREATE TABLE public.pending_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Source information
  source_url TEXT NOT NULL,
  source_name TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  discovery_method TEXT, -- 'exa_search', 'manual', 'rss', etc.
  
  -- Article content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  
  -- Author information
  author_name TEXT,
  author_role TEXT,
  
  -- AI Analysis results
  ai_analysis JSONB, -- Full AI response for transparency
  ai_confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  extracted_category TEXT,
  extracted_verticals TEXT[],
  
  -- Extracted entities (AI-detected)
  extracted_agencies JSONB, -- [{name: string, ntd_id?: string, confidence: number}]
  extracted_providers JSONB, -- [{name: string, type?: string, confidence: number}]
  extracted_opportunities JSONB, -- [{type: string, description: string, confidence: number}]
  
  -- Review status
  review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_edit'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  
  -- If approved, link to published article
  published_article_id UUID REFERENCES public.articles(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for pending articles query
CREATE INDEX idx_pending_articles_status ON public.pending_articles(review_status, discovered_at DESC);
CREATE INDEX idx_pending_articles_source_url ON public.pending_articles(source_url);

-- Enable RLS
ALTER TABLE public.pending_articles ENABLE ROW LEVEL SECURITY;

-- Admins can read all pending articles
CREATE POLICY "Admins can read pending articles"
  ON public.pending_articles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert pending articles
CREATE POLICY "Admins can insert pending articles"
  ON public.pending_articles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update pending articles
CREATE POLICY "Admins can update pending articles"
  ON public.pending_articles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete pending articles
CREATE POLICY "Admins can delete pending articles"
  ON public.pending_articles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_pending_articles_updated_at
  BEFORE UPDATE ON public.pending_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tracking discovery runs
CREATE TABLE public.discovery_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  articles_discovered INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  articles_added INTEGER DEFAULT 0,
  error_message TEXT,
  run_metadata JSONB -- Store search queries, filters used, etc.
);

-- Enable RLS
ALTER TABLE public.discovery_runs ENABLE ROW LEVEL SECURITY;

-- Admins can read discovery runs
CREATE POLICY "Admins can read discovery runs"
  ON public.discovery_runs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Functions can insert/update discovery runs (we'll use service role)
CREATE POLICY "Service role can manage discovery runs"
  ON public.discovery_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);