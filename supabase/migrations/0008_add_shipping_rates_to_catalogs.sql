-- Add per-governorate shipping rates to catalogs.
ALTER TABLE catalogs
ADD COLUMN IF NOT EXISTS shipping_rates JSONB DEFAULT '{}'::jsonb;
