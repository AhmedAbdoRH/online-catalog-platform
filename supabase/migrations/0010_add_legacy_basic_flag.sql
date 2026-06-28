-- Add is_legacy_basic column to identify legacy basic users
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS is_legacy_basic BOOLEAN DEFAULT FALSE;

-- Set is_legacy_basic = TRUE for existing basic users
UPDATE public.catalogs 
SET is_legacy_basic = TRUE 
WHERE plan = 'basic' AND trial_started_at IS NULL;
