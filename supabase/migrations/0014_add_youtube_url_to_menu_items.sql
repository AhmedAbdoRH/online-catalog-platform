-- Optional YouTube video URL for product pages
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS youtube_url TEXT;
