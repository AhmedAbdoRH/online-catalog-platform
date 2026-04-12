-- Create customers table to store customer data from orders
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  catalog_id INTEGER NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  first_order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(catalog_id, phone)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_catalog_phone ON customers(catalog_id, phone);
