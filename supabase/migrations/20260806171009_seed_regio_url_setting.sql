-- Seed default regio_url setting so the regiowyniki.pl link is configurable
-- from the admin panel instead of hardcoded in the sync-mzpn edge function.

INSERT INTO public.site_settings (key, value) VALUES
  ('regio_url', 'https://regiowyniki.pl/kalendarz/Pilka_Nozna/2025/2026/Malopolskie/Liga_okregowa/Krakow_II/')
ON CONFLICT (key) DO NOTHING;
