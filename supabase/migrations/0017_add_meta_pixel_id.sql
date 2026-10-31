-- 0017: per-merchant Meta (Facebook) Pixel ID
-- Lets each merchant track their own storefront traffic with their own pixel.

ALTER TABLE public.catalogs
  ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;

COMMENT ON COLUMN public.catalogs.meta_pixel_id IS
  'Meta (Facebook) Pixel ID set by the merchant to track their own storefront traffic.';
