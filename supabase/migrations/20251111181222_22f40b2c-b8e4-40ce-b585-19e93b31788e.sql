-- Fix discovery_runs to ensure no unauthorized access
-- The issue is that "Service role can manage" policy uses USING (true) which might allow unintended access
DROP POLICY IF EXISTS "Service role can manage discovery runs" ON public.discovery_runs;

-- Only keep admin read access for actual users
-- Service role operations will bypass RLS automatically, so no special policy needed

-- Fix storage policies to exclude anonymous users
-- Change from auth.uid() IS NOT NULL to explicit authenticated role check

-- Article images bucket policies
DROP POLICY IF EXISTS "Authenticated users can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete article images" ON storage.objects;

CREATE POLICY "Non-anonymous users can view article images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Non-anonymous users can update article images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Non-anonymous users can delete article images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Non-anonymous users can insert article images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Opportunity documents bucket policies
DROP POLICY IF EXISTS "Authenticated users can view opportunity documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update opportunity documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete opportunity documents" ON storage.objects;

CREATE POLICY "Non-anonymous users can view opportunity documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'opportunity-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update opportunity documents"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'opportunity-documents' AND auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete opportunity documents"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'opportunity-documents' AND auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert opportunity documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'opportunity-documents' AND auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'::app_role));