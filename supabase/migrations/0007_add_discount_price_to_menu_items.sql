ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS discount_price numeric NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'menu_items_discount_price_lt_price'
  ) THEN
    ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_discount_price_lt_price
    CHECK (discount_price IS NULL OR discount_price < price);
  END IF;
END $$;
