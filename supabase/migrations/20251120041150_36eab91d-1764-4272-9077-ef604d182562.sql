-- Add AI confidence score and score source tracking to search_results
ALTER TABLE search_results
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC,
ADD COLUMN IF NOT EXISTS score_source TEXT DEFAULT 'exa_api',
ADD COLUMN IF NOT EXISTS final_score NUMERIC;

-- Add comment explaining the scoring fields
COMMENT ON COLUMN search_results.ai_confidence_score IS 'AI-generated confidence score (0-100) from LLM analysis';
COMMENT ON COLUMN search_results.score_source IS 'Source of relevance_score: exa_api, calculated, default, or composite';
COMMENT ON COLUMN search_results.final_score IS 'Weighted composite score combining relevance_score (40%) and ai_confidence_score (60%)';

-- Create function to calculate final score
CREATE OR REPLACE FUNCTION calculate_final_score(
  relevance NUMERIC,
  ai_confidence NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  -- If both scores exist, use weighted average (40% relevance, 60% AI)
  IF relevance IS NOT NULL AND ai_confidence IS NOT NULL THEN
    RETURN ROUND((relevance * 0.4 + ai_confidence * 0.6), 2);
  -- If only one exists, use that
  ELSIF relevance IS NOT NULL THEN
    RETURN relevance;
  ELSIF ai_confidence IS NOT NULL THEN
    RETURN ai_confidence;
  -- If neither exists, return NULL
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-calculate final_score
CREATE OR REPLACE FUNCTION update_final_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_score = calculate_final_score(NEW.relevance_score, NEW.ai_confidence_score);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_final_score ON search_results;
CREATE TRIGGER trigger_update_final_score
  BEFORE INSERT OR UPDATE OF relevance_score, ai_confidence_score
  ON search_results
  FOR EACH ROW
  EXECUTE FUNCTION update_final_score();