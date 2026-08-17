-- Logos for opponents that are not in league_table (e.g. Puchar Polski teams
-- from a different league/division). Kept separate from league_table so the
-- league sync (which fully replaces league_table on every run) never touches
-- these one-off crests.

CREATE TABLE public.extra_team_logos (
  team TEXT PRIMARY KEY,
  logo_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_team_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read extra team logos" ON public.extra_team_logos FOR SELECT USING (true);
CREATE POLICY "Admins can insert extra team logos" ON public.extra_team_logos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update extra team logos" ON public.extra_team_logos FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete extra team logos" ON public.extra_team_logos FOR DELETE USING (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.extra_team_logos TO authenticated;
GRANT ALL ON public.extra_team_logos TO service_role;
