-- Add direct_order_enabled field to catalogs table
ALTER TABLE catalogs
ADD COLUMN direct_order_enabled BOOLEAN DEFAULT TRUE;
