
-- Add slug column
ALTER TABLE public.news_posts ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX news_posts_slug_unique ON public.news_posts(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_news_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Transliterate Polish characters and generate slug
  base_slug := lower(NEW.title);
  base_slug := replace(base_slug, 'ą', 'a');
  base_slug := replace(base_slug, 'ć', 'c');
  base_slug := replace(base_slug, 'ę', 'e');
  base_slug := replace(base_slug, 'ł', 'l');
  base_slug := replace(base_slug, 'ń', 'n');
  base_slug := replace(base_slug, 'ó', 'o');
  base_slug := replace(base_slug, 'ś', 's');
  base_slug := replace(base_slug, 'ź', 'z');
  base_slug := replace(base_slug, 'ż', 'z');
  base_slug := replace(base_slug, 'Ą', 'a');
  base_slug := replace(base_slug, 'Ć', 'c');
  base_slug := replace(base_slug, 'Ę', 'e');
  base_slug := replace(base_slug, 'Ł', 'l');
  base_slug := replace(base_slug, 'Ń', 'n');
  base_slug := replace(base_slug, 'Ó', 'o');
  base_slug := replace(base_slug, 'Ś', 's');
  base_slug := replace(base_slug, 'Ź', 'z');
  base_slug := replace(base_slug, 'Ż', 'z');
  -- Replace non-alphanumeric with hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  -- Truncate to reasonable length
  base_slug := left(base_slug, 80);
  base_slug := regexp_replace(base_slug, '-$', '', 'g');
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.news_posts WHERE slug = final_slug AND id != NEW.id
    );
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate slug on insert/update of title
CREATE TRIGGER news_posts_generate_slug
  BEFORE INSERT OR UPDATE OF title ON public.news_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_news_slug();

-- Generate slugs for existing posts
UPDATE public.news_posts SET slug = id WHERE slug IS NULL;
UPDATE public.news_posts SET title = title;

-- Now make slug NOT NULL
ALTER TABLE public.news_posts ALTER COLUMN slug SET NOT NULL;
