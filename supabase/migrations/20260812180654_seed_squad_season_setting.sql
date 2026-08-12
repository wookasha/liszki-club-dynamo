-- Seed default squad_season setting so the "Sezon YYYY/YYYY" label shown on
-- the Kadra page header and on player cards is editable from the admin
-- panel instead of hardcoded in SquadPage.tsx.

INSERT INTO public.site_settings (key, value) VALUES
  ('squad_season', '2025/2026')
ON CONFLICT (key) DO NOTHING;
