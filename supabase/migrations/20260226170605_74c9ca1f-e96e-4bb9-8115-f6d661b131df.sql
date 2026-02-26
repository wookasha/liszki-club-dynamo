
-- Add logo_url column to league_table
ALTER TABLE public.league_table ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for team logos
CREATE POLICY "Anyone can view team logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-logos');

-- Admin upload team logos
CREATE POLICY "Admins can insert team logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'team-logos' AND public.is_admin());

-- Admin delete team logos  
CREATE POLICY "Admins can remove team logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'team-logos' AND public.is_admin());

-- Admin update team logos
CREATE POLICY "Admins can update team logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'team-logos' AND public.is_admin());
