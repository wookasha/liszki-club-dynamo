
CREATE TABLE public.squad_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL DEFAULT 'midfielder',
  shirt_number integer,
  photo_url text,
  birth_year integer,
  is_captain boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read squad members" ON public.squad_members FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert squad members" ON public.squad_members FOR INSERT TO public WITH CHECK (is_admin());
CREATE POLICY "Admins can update squad members" ON public.squad_members FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete squad members" ON public.squad_members FOR DELETE TO public USING (is_admin());
