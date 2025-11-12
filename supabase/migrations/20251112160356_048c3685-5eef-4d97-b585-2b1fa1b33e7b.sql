-- Rename contractee_operator_name to transportation_provider
ALTER TABLE public.transportation_providers
  RENAME COLUMN contractee_operator_name TO transportation_provider;