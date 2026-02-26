
-- Create new table for gallery albums with Google Photos links
CREATE TABLE public.gallery_albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  google_photos_url text NOT NULL,
  cover_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read gallery albums" ON public.gallery_albums FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert gallery albums" ON public.gallery_albums FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update gallery albums" ON public.gallery_albums FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete gallery albums" ON public.gallery_albums FOR DELETE USING (public.is_admin());
