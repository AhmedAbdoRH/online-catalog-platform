-- Migration 0016: Add business segment (store / restaurant) to catalogs
-- The segment is chosen once at signup via the BusinessTypeSelector.

ALTER TABLE catalogs
ADD COLUMN IF NOT EXISTS business_type TEXT NOT NULL DEFAULT 'store';

-- Constrain to known segments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'catalogs_business_type_check'
  ) THEN
    ALTER TABLE catalogs
    ADD CONSTRAINT catalogs_business_type_check
    CHECK (business_type IN ('store', 'restaurant'));
  END IF;
END $$;

-- Backfill: catalogs that already enabled restaurant mode are restaurants
UPDATE catalogs
SET business_type = 'restaurant'
WHERE restaurant_mode_enabled = TRUE AND business_type = 'store';

COMMENT ON COLUMN catalogs.business_type IS 'Business segment: store (متجر) or restaurant (مطعم/كافيه). Chosen once at signup.';
