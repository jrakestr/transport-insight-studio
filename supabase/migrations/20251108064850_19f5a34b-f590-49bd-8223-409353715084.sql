-- Add document columns to opportunities table
ALTER TABLE public.opportunities
ADD COLUMN document_url TEXT,
ADD COLUMN document_file_path TEXT;

COMMENT ON COLUMN public.opportunities.document_url IS 'External URL link to opportunity document';
COMMENT ON COLUMN public.opportunities.document_file_path IS 'Path to uploaded document file in storage';

-- Create storage bucket for opportunity documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('opportunity-documents', 'opportunity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for opportunity documents
CREATE POLICY "Authenticated users can view opportunity documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'opportunity-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can upload opportunity documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'opportunity-documents' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update opportunity documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'opportunity-documents' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete opportunity documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'opportunity-documents' AND
  has_role(auth.uid(), 'admin')
);