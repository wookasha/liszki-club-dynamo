
CREATE TABLE public.youth_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ages TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'Stadion w Liszkach',
  coach TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.youth_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read youth groups" ON public.youth_groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert youth groups" ON public.youth_groups FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update youth groups" ON public.youth_groups FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete youth groups" ON public.youth_groups FOR DELETE USING (is_admin());
