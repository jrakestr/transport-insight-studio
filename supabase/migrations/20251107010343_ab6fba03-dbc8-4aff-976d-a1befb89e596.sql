-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for all existing tables to require admin role
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;

CREATE POLICY "Admins can delete articles"
  ON public.articles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles"
  ON public.articles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
  ON public.articles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update other tables similarly
DROP POLICY IF EXISTS "Authenticated users can delete transit agencies" ON public.transit_agencies;
DROP POLICY IF EXISTS "Authenticated users can insert transit agencies" ON public.transit_agencies;
DROP POLICY IF EXISTS "Authenticated users can update transit agencies" ON public.transit_agencies;

CREATE POLICY "Admins can delete transit agencies"
  ON public.transit_agencies
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transit agencies"
  ON public.transit_agencies
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transit agencies"
  ON public.transit_agencies
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete transportation providers" ON public.transportation_providers;
DROP POLICY IF EXISTS "Authenticated users can insert transportation providers" ON public.transportation_providers;
DROP POLICY IF EXISTS "Authenticated users can update transportation providers" ON public.transportation_providers;

CREATE POLICY "Admins can delete transportation providers"
  ON public.transportation_providers
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transportation providers"
  ON public.transportation_providers
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transportation providers"
  ON public.transportation_providers
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON public.opportunities;

CREATE POLICY "Admins can delete opportunities"
  ON public.opportunities
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert opportunities"
  ON public.opportunities
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update opportunities"
  ON public.opportunities
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON public.reports;

CREATE POLICY "Admins can delete reports"
  ON public.reports
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.reports
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete article agencies" ON public.article_agencies;
DROP POLICY IF EXISTS "Authenticated users can insert article agencies" ON public.article_agencies;

CREATE POLICY "Admins can delete article agencies"
  ON public.article_agencies
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert article agencies"
  ON public.article_agencies
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete article providers" ON public.article_providers;
DROP POLICY IF EXISTS "Authenticated users can insert article providers" ON public.article_providers;

CREATE POLICY "Admins can delete article providers"
  ON public.article_providers
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert article providers"
  ON public.article_providers
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete article verticals" ON public.article_verticals;
DROP POLICY IF EXISTS "Authenticated users can insert article verticals" ON public.article_verticals;

CREATE POLICY "Admins can delete article verticals"
  ON public.article_verticals
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert article verticals"
  ON public.article_verticals
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));