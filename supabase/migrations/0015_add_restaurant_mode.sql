-- Add restaurant/cafe mode columns to catalogs table
-- This enables table number selection instead of shipping/delivery

-- Add table numbers configuration (stores table names/numbers as array)
ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS table_numbers TEXT[] DEFAULT '{}';

-- Add flag to enable restaurant mode
ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS restaurant_mode_enabled BOOLEAN DEFAULT FALSE;

-- Comment columns
COMMENT ON COLUMN catalogs.table_numbers IS 'List of table names/numbers for restaurant/cafe mode (e.g., ["1", "2", "A1", "VIP-1"])';
COMMENT ON COLUMN catalogs.restaurant_mode_enabled IS 'Enable restaurant/cafe mode - customers select table number instead of shipping address';
