-- Create search_results table
CREATE TABLE search_results (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search Relationship
  automated_search_id uuid NOT NULL REFERENCES automated_searches(id) ON DELETE CASCADE,
  
  -- Article Details
  source_url text NOT NULL,
  title text,
  description text,
  author text,
  published_date timestamp with time zone,
  
  -- Content
  excerpt text,
  image_url text,
  
  -- Exa API Response Data
  exa_id text,
  exa_score numeric(5,4),
  exa_metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Processing Status
  processed boolean DEFAULT false,
  added_to_pending boolean DEFAULT false,
  pending_article_id uuid REFERENCES pending_articles(id) ON DELETE SET NULL,
  
  -- Quality Metrics
  relevance_score numeric(3,2),
  duplicate_of uuid REFERENCES search_results(id) ON DELETE SET NULL,
  skip_reason text,
  
  -- Audit Trail
  discovered_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Deduplication: same URL from same search should only exist once
  UNIQUE(automated_search_id, source_url)
);

-- Create indexes for performance
-- Fast lookup for unprocessed results
CREATE INDEX idx_search_results_unprocessed 
  ON search_results(processed, discovered_at) 
  WHERE processed = false;

-- Fast lookup by automated search
CREATE INDEX idx_search_results_by_search 
  ON search_results(automated_search_id, discovered_at DESC);

-- Fast lookup for pending article links
CREATE INDEX idx_search_results_pending_link 
  ON search_results(pending_article_id) 
  WHERE pending_article_id IS NOT NULL;

-- Global deduplication: find same URL across all searches
CREATE INDEX idx_search_results_source_url 
  ON search_results(source_url);

-- Fast lookup for duplicate detection
CREATE INDEX idx_search_results_duplicates 
  ON search_results(duplicate_of) 
  WHERE duplicate_of IS NOT NULL;

-- Fast lookup by Exa ID for API result matching
CREATE INDEX idx_search_results_exa_id 
  ON search_results(exa_id) 
  WHERE exa_id IS NOT NULL;

-- Fast lookup by relevance score
CREATE INDEX idx_search_results_relevance 
  ON search_results(relevance_score DESC NULLS LAST) 
  WHERE relevance_score IS NOT NULL;

-- Enable RLS
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all search results"
  ON search_results
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view search results"
  ON search_results
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add automatic timestamp trigger
CREATE TRIGGER update_search_results_updated_at
  BEFORE UPDATE ON search_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check for duplicate URLs across all searches
CREATE OR REPLACE FUNCTION check_duplicate_url(url_to_check text)
RETURNS TABLE(
  result_id uuid,
  search_id uuid,
  discovered timestamp with time zone,
  is_processed boolean,
  pending_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    automated_search_id,
    discovered_at,
    processed,
    pending_article_id
  FROM search_results
  WHERE source_url = url_to_check
  ORDER BY discovered_at DESC
  LIMIT 1;
$$;

-- Create function to mark result as processed
CREATE OR REPLACE FUNCTION mark_result_processed(
  result_id uuid,
  pending_id uuid DEFAULT NULL,
  skip_reason_text text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE search_results
  SET 
    processed = true,
    processed_at = now(),
    added_to_pending = (pending_id IS NOT NULL),
    pending_article_id = pending_id,
    skip_reason = skip_reason_text,
    updated_at = now()
  WHERE id = result_id;
END;
$$;

-- Create function to get processing stats for a search
CREATE OR REPLACE FUNCTION get_search_processing_stats(search_id uuid)
RETURNS TABLE(
  total_results integer,
  processed_count integer,
  added_to_pending_count integer,
  duplicate_count integer,
  skipped_count integer,
  avg_relevance_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::integer as total_results,
    COUNT(*) FILTER (WHERE processed = true)::integer as processed_count,
    COUNT(*) FILTER (WHERE added_to_pending = true)::integer as added_to_pending_count,
    COUNT(*) FILTER (WHERE duplicate_of IS NOT NULL)::integer as duplicate_count,
    COUNT(*) FILTER (WHERE skip_reason IS NOT NULL)::integer as skipped_count,
    AVG(relevance_score) as avg_relevance_score
  FROM search_results
  WHERE automated_search_id = search_id;
$$;