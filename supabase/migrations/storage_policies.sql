-- =============================
-- Storage Bucket Policies
-- =============================

-- Public Bucket Policies
CREATE POLICY "Allow public read access for public bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public');

CREATE POLICY "Allow authenticated uploads for public bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates for public bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'public' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated deletes for public bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'public' AND auth.uid() = owner);

-- Products Bucket Policies
CREATE POLICY "Allow public read access for products bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated uploads for products bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates for products bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated deletes for products bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.uid() = owner);

-- Admin Override Policy for all storage objects
CREATE POLICY "Admins can manage all storage objects"
  ON storage.objects FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users));
