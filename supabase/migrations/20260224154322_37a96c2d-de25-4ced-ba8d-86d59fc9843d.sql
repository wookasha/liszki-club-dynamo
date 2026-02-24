
-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

-- Anyone can view images (public bucket)
CREATE POLICY "Anyone can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

-- Only admins can upload images
CREATE POLICY "Admins can upload news images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'news-images' AND public.is_admin());

-- Only admins can update images
CREATE POLICY "Admins can update news images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'news-images' AND public.is_admin());

-- Only admins can delete images
CREATE POLICY "Admins can delete news images" ON storage.objects
  FOR DELETE USING (bucket_id = 'news-images' AND public.is_admin());
