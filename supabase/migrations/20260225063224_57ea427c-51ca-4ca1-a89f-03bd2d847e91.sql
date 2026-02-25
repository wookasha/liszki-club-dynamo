
-- Fix matches RLS: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Anyone can read matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can delete matches" ON public.matches;

CREATE POLICY "Anyone can read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins can insert matches" ON public.matches FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update matches" ON public.matches FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete matches" ON public.matches FOR DELETE USING (is_admin());

-- Fix league_table RLS: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Anyone can read league table" ON public.league_table;
DROP POLICY IF EXISTS "Admins can insert league table" ON public.league_table;
DROP POLICY IF EXISTS "Admins can update league table" ON public.league_table;
DROP POLICY IF EXISTS "Admins can delete league table" ON public.league_table;

CREATE POLICY "Anyone can read league table" ON public.league_table FOR SELECT USING (true);
CREATE POLICY "Admins can insert league table" ON public.league_table FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update league table" ON public.league_table FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete league table" ON public.league_table FOR DELETE USING (is_admin());

-- Add scorers column to matches
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS scorers JSONB DEFAULT '[]'::jsonb;
