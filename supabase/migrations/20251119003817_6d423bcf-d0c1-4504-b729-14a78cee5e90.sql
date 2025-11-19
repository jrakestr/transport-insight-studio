-- Create automated_searches table
CREATE TABLE automated_searches (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search Configuration
  search_type text NOT NULL CHECK (search_type IN ('agency', 'provider', 'keyword', 'rfp', 'vertical', 'relationship')),
  search_query text NOT NULL,
  search_parameters jsonb DEFAULT '{}'::jsonb,
  
  -- Entity Relationships (optional - for targeted searches)
  agency_id uuid REFERENCES transit_agencies(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Scheduling
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone DEFAULT now(),
  
  -- Status and Control
  is_active boolean DEFAULT true,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Performance Tracking
  results_count integer DEFAULT 0,
  total_runs integer DEFAULT 0,
  successful_runs integer DEFAULT 0,
  failed_runs integer DEFAULT 0,
  last_error text,
  
  -- Metadata
  tags text[],
  notes text,
  
  -- Audit Trail
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  
  -- Constraints
  CONSTRAINT valid_entity_reference CHECK (
    (search_type = 'agency' AND agency_id IS NOT NULL) OR
    (search_type = 'provider' AND provider_id IS NOT NULL) OR
    (search_type IN ('keyword', 'rfp', 'vertical', 'relationship'))
  )
);

-- Create indexes for performance
-- Fast lookup for scheduled searches
CREATE INDEX idx_automated_searches_next_run 
  ON automated_searches(next_run_at) 
  WHERE is_active = true;

-- Fast lookup by entity for management
CREATE INDEX idx_automated_searches_agency 
  ON automated_searches(agency_id) 
  WHERE agency_id IS NOT NULL;

CREATE INDEX idx_automated_searches_provider 
  ON automated_searches(provider_id) 
  WHERE provider_id IS NOT NULL;

-- Fast lookup by search type and priority
CREATE INDEX idx_automated_searches_type_priority 
  ON automated_searches(search_type, priority, is_active);

-- Fast lookup for active searches
CREATE INDEX idx_automated_searches_active 
  ON automated_searches(is_active, next_run_at) 
  WHERE is_active = true;

-- Full-text search on query text
CREATE INDEX idx_automated_searches_query_text 
  ON automated_searches USING gin(to_tsvector('english', search_query));

-- GIN index for tags array
CREATE INDEX idx_automated_searches_tags 
  ON automated_searches USING gin(tags);

-- Enable RLS
ALTER TABLE automated_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all automated searches"
  ON automated_searches
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view automated searches"
  ON automated_searches
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add automatic timestamp trigger
CREATE TRIGGER update_automated_searches_updated_at
  BEFORE UPDATE ON automated_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helper function to calculate next run time
CREATE OR REPLACE FUNCTION calculate_next_run(
  base_time timestamp with time zone,
  freq text
)
RETURNS timestamp with time zone
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE freq
    WHEN 'hourly' THEN base_time + interval '1 hour'
    WHEN 'daily' THEN base_time + interval '1 day'
    WHEN 'weekly' THEN base_time + interval '7 days'
    WHEN 'monthly' THEN base_time + interval '30 days'
    ELSE base_time + interval '1 day'
  END;
END;
$$;

-- Create function to update search after execution
CREATE OR REPLACE FUNCTION update_search_after_run(
  search_id uuid,
  success boolean,
  result_count integer DEFAULT 0,
  error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_frequency text;
BEGIN
  -- Get current frequency
  SELECT frequency INTO current_frequency
  FROM automated_searches
  WHERE id = search_id;
  
  -- Update search record
  UPDATE automated_searches
  SET 
    last_run_at = now(),
    next_run_at = calculate_next_run(now(), current_frequency),
    results_count = result_count,
    total_runs = total_runs + 1,
    successful_runs = CASE WHEN success THEN successful_runs + 1 ELSE successful_runs END,
    failed_runs = CASE WHEN NOT success THEN failed_runs + 1 ELSE failed_runs END,
    last_error = CASE WHEN NOT success THEN error_message ELSE NULL END,
    updated_at = now()
  WHERE id = search_id;
END;
$$;