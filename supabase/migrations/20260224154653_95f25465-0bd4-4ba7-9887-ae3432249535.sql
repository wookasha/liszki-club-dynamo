
-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'dom',
  score_home INTEGER,
  score_away INTEGER,
  is_played BOOLEAN NOT NULL DEFAULT false,
  league TEXT NOT NULL DEFAULT 'Klasa okręgowa, grupa II',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches" ON public.matches
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update matches" ON public.matches
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete matches" ON public.matches
  FOR DELETE USING (public.is_admin());

-- League table
CREATE TABLE public.league_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL,
  team TEXT NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  is_own_team BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.league_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read league table" ON public.league_table
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert league table" ON public.league_table
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update league table" ON public.league_table
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete league table" ON public.league_table
  FOR DELETE USING (public.is_admin());
