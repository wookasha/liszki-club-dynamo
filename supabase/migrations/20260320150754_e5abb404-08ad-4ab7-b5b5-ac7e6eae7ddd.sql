
-- Fix search_path security warning
ALTER FUNCTION public.generate_news_slug() SET search_path = public;
