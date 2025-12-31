-- Fix search_path for calculate_final_score function
CREATE OR REPLACE FUNCTION public.calculate_final_score(relevance numeric, ai_confidence numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
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
$function$;

-- Fix search_path for calculate_next_run function
CREATE OR REPLACE FUNCTION public.calculate_next_run(base_time timestamp with time zone, freq text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  RETURN CASE freq
    WHEN 'hourly' THEN base_time + interval '1 hour'
    WHEN 'daily' THEN base_time + interval '1 day'
    WHEN 'weekly' THEN base_time + interval '7 days'
    WHEN 'monthly' THEN base_time + interval '30 days'
    ELSE base_time + interval '1 day'
  END;
END;
$function$;

-- Fix search_path for update_final_score trigger function
CREATE OR REPLACE FUNCTION public.update_final_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.final_score = calculate_final_score(NEW.relevance_score, NEW.ai_confidence_score);
  RETURN NEW;
END;
$function$;