
-- Club history content (single editable page content)
CREATE TABLE public.club_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.club_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read club history" ON public.club_history FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert club history" ON public.club_history FOR INSERT TO public WITH CHECK (is_admin());
CREATE POLICY "Admins can update club history" ON public.club_history FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete club history" ON public.club_history FOR DELETE TO public USING (is_admin());

-- Timeline events
CREATE TABLE public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read timeline events" ON public.timeline_events FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert timeline events" ON public.timeline_events FOR INSERT TO public WITH CHECK (is_admin());
CREATE POLICY "Admins can update timeline events" ON public.timeline_events FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete timeline events" ON public.timeline_events FOR DELETE TO public USING (is_admin());
