
CREATE TABLE public.player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  stat_type text NOT NULL DEFAULT 'goals',
  count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read player stats" ON public.player_stats FOR SELECT USING (true);
CREATE POLICY "Admins can insert player stats" ON public.player_stats FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update player stats" ON public.player_stats FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete player stats" ON public.player_stats FOR DELETE USING (is_admin());
