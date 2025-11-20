-- Add user feedback and learning state tables

-- 1. Track user ratings for search results (THE TRUE REWARD SIGNAL)
CREATE TABLE IF NOT EXISTS public.search_result_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_result_id UUID NOT NULL REFERENCES public.search_results(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  relevance_rating INTEGER CHECK (relevance_rating BETWEEN 0 AND 100),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 0 AND 100),
  novelty_rating INTEGER CHECK (novelty_rating BETWEEN 0 AND 100),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(search_result_id, user_id)
);

-- 2. Store learning state for query generation (θ, A matrices)
CREATE TABLE IF NOT EXISTS public.query_learning_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_key TEXT NOT NULL, -- e.g., "agency:chicago-cta" or "topic:bus-contracts"
  theta JSONB NOT NULL DEFAULT '[]'::jsonb, -- Feature weights vector
  a_matrix JSONB NOT NULL DEFAULT '[]'::jsonb, -- Covariance matrix
  proven_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  effective_terms JSONB NOT NULL DEFAULT '{}'::jsonb, -- term -> avg score
  exhausted_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_queries INTEGER DEFAULT 0,
  avg_reward NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(context_key)
);

-- 3. Track query execution history with features
CREATE TABLE IF NOT EXISTS public.query_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_state_id UUID REFERENCES public.query_learning_state(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_features JSONB NOT NULL, -- Feature vector used for LinUCB
  predicted_reward NUMERIC,
  uncertainty NUMERIC,
  novelty_score NUMERIC,
  ucb_score NUMERIC,
  actual_reward NUMERIC, -- User rating after execution
  articles_found INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.search_result_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_learning_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_execution_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can rate search results"
  ON public.search_result_ratings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own ratings"
  ON public.search_result_ratings
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage learning state"
  ON public.query_learning_state
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view execution logs"
  ON public.query_execution_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert execution logs"
  ON public.query_execution_log
  FOR INSERT
  WITH CHECK (true); -- Will be called from edge functions

-- Indexes for performance
CREATE INDEX idx_search_result_ratings_result_id ON public.search_result_ratings(search_result_id);
CREATE INDEX idx_query_learning_state_context ON public.query_learning_state(context_key);
CREATE INDEX idx_query_execution_log_state_id ON public.query_execution_log(learning_state_id);
CREATE INDEX idx_query_execution_log_executed_at ON public.query_execution_log(executed_at DESC);