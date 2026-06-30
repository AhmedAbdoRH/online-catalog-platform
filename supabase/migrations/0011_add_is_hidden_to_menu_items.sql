-- Add is_hidden column to menu_items for product visibility control
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
