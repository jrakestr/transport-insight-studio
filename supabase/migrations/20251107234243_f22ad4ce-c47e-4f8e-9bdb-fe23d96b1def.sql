-- Create article processing status table
CREATE TABLE IF NOT EXISTS public.article_processing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  last_processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id)
);

-- Enable RLS
ALTER TABLE public.article_processing_status ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can read processing status"
  ON public.article_processing_status
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert processing status"
  ON public.article_processing_status
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update processing status"
  ON public.article_processing_status
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_article_processing_status_updated_at
  BEFORE UPDATE ON public.article_processing_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_article_processing_status_article_id ON public.article_processing_status(article_id);
CREATE INDEX idx_article_processing_status_status ON public.article_processing_status(status);