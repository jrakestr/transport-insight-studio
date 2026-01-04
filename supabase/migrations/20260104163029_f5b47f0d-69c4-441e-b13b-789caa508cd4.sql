-- Create user_subscriptions table for tracking what users want to follow
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('agency', 'provider', 'topic', 'state', 'mode')),
  entity_id uuid,
  entity_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure either entity_id or entity_value is set based on type
  CONSTRAINT valid_entity CHECK (
    (entity_type IN ('agency', 'provider') AND entity_id IS NOT NULL) OR
    (entity_type IN ('topic', 'state', 'mode') AND entity_value IS NOT NULL)
  ),
  
  -- Prevent duplicate subscriptions
  CONSTRAINT unique_subscription UNIQUE (user_id, entity_type, entity_id, entity_value)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.user_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_entity ON public.user_subscriptions(entity_type, entity_id);
CREATE INDEX idx_user_subscriptions_value ON public.user_subscriptions(entity_type, entity_value);