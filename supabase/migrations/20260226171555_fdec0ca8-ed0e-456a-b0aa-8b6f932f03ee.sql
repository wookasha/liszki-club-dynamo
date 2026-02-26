
-- Create sponsors table
CREATE TABLE public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  website_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read sponsors" ON public.sponsors
  FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins can insert sponsors" ON public.sponsors
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update sponsors" ON public.sponsors
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete sponsors" ON public.sponsors
  FOR DELETE USING (public.is_admin());

-- Storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view sponsor logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Admins can insert sponsor logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sponsor-logos' AND public.is_admin());

CREATE POLICY "Admins can delete sponsor logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'sponsor-logos' AND public.is_admin());

CREATE POLICY "Admins can update sponsor logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sponsor-logos' AND public.is_admin());
