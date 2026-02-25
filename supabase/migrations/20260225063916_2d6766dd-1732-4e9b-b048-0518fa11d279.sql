
-- Create gallery_photos table
CREATE TABLE public.gallery_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  album text NOT NULL DEFAULT 'Bez albumu',
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gallery photos" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Admins can insert gallery photos" ON public.gallery_photos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update gallery photos" ON public.gallery_photos FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete gallery photos" ON public.gallery_photos FOR DELETE USING (is_admin());

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND (SELECT is_admin()));
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images' AND (SELECT is_admin()));
