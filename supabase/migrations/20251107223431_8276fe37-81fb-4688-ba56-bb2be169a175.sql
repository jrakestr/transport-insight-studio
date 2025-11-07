-- Create article_categories junction table
CREATE TABLE public.article_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read article categories"
ON public.article_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert article categories"
ON public.article_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete article categories"
ON public.article_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));