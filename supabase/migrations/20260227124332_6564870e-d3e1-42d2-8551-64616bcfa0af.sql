
ALTER TABLE public.gallery_albums 
  ADD COLUMN r2_folder_path text NOT NULL DEFAULT '',
  ADD COLUMN photo_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.gallery_albums 
  ALTER COLUMN google_photos_url SET DEFAULT '',
  ALTER COLUMN google_photos_url DROP NOT NULL;
