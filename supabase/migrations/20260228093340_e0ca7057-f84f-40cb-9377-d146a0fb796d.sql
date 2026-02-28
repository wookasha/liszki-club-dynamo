
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.site_settings (key, value) VALUES 
  ('mzpn_table_url', 'https://malopolskizpn.pl/rozgrywki/2025-2026/seniorzy/ko2_krakow/?view=table'),
  ('mzpn_schedule_url', 'https://malopolskizpn.pl/rozgrywki/2025-2026/seniorzy/ko2_krakow/?view=schedule');
