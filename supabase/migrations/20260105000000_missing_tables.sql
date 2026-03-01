-- Migration: Create 6 tables that were created via Lovable UI
-- and never captured in migration files.

-- 1. procurement_crawl_schedule
CREATE TABLE IF NOT EXISTS procurement_crawl_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES transit_agencies(id),
  source_url text NOT NULL,
  crawl_frequency text DEFAULT 'weekly',
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  last_crawl_at timestamptz,
  last_crawl_status text,
  last_crawl_error text,
  items_found_last integer DEFAULT 0,
  next_crawl_at timestamptz,
  total_crawls integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_crawl_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read procurement_crawl_schedule"
  ON procurement_crawl_schedule FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage procurement_crawl_schedule"
  ON procurement_crawl_schedule FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_procurement_crawl_schedule_agency_id
  ON procurement_crawl_schedule(agency_id);

CREATE TRIGGER update_procurement_crawl_schedule_updated_at
  BEFORE UPDATE ON procurement_crawl_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. procurement_documents
CREATE TABLE IF NOT EXISTS procurement_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES transit_agencies(id),
  opportunity_id uuid REFERENCES procurement_opportunities(id),
  url text NOT NULL,
  title text,
  content_type text,
  content_hash text,
  file_size_bytes integer,
  page_count integer,
  raw_content text,
  parse_status text DEFAULT 'pending',
  parse_error text,
  parsed_at timestamptz,
  discovered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read procurement_documents"
  ON procurement_documents FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage procurement_documents"
  ON procurement_documents FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_procurement_documents_agency_id
  ON procurement_documents(agency_id);

CREATE INDEX idx_procurement_documents_opportunity_id
  ON procurement_documents(opportunity_id);

CREATE TRIGGER update_procurement_documents_updated_at
  BEFORE UPDATE ON procurement_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. procurement_embeddings
CREATE TABLE IF NOT EXISTS procurement_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL,
  source_type text NOT NULL,
  chunk_index integer DEFAULT 0,
  content_preview text,
  embedding jsonb,
  embedding_model text,
  token_count integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read procurement_embeddings"
  ON procurement_embeddings FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage procurement_embeddings"
  ON procurement_embeddings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_procurement_embeddings_source
  ON procurement_embeddings(source_id, source_type);

-- 4. procurement_raw_items
CREATE TABLE IF NOT EXISTS procurement_raw_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES transit_agencies(id),
  crawl_schedule_id uuid REFERENCES procurement_crawl_schedule(id),
  opportunity_id uuid REFERENCES procurement_opportunities(id),
  source_url text NOT NULL,
  content_hash text NOT NULL,
  raw_html text,
  raw_json jsonb,
  is_processed boolean DEFAULT false,
  processed_at timestamptz,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_raw_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read procurement_raw_items"
  ON procurement_raw_items FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage procurement_raw_items"
  ON procurement_raw_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_procurement_raw_items_agency_id
  ON procurement_raw_items(agency_id);

CREATE INDEX idx_procurement_raw_items_crawl_schedule_id
  ON procurement_raw_items(crawl_schedule_id);

CREATE INDEX idx_procurement_raw_items_content_hash
  ON procurement_raw_items(content_hash);

-- 5. user_opportunity_matches
CREATE TABLE IF NOT EXISTS user_opportunity_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid NOT NULL REFERENCES procurement_opportunities(id),
  relevance_score numeric DEFAULT 0,
  match_signals jsonb,
  is_saved boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_opportunity_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own opportunity matches"
  ON user_opportunity_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own opportunity matches"
  ON user_opportunity_matches FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_opportunity_matches_user_id
  ON user_opportunity_matches(user_id);

CREATE INDEX idx_user_opportunity_matches_opportunity_id
  ON user_opportunity_matches(opportunity_id);

CREATE TRIGGER update_user_opportunity_matches_updated_at
  BEFORE UPDATE ON user_opportunity_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preference_type text NOT NULL,
  preference_value text NOT NULL,
  weight numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_preferences_user_id
  ON user_preferences(user_id);

CREATE INDEX idx_user_preferences_type
  ON user_preferences(user_id, preference_type);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
