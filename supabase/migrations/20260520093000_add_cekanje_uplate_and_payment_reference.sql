-- ============================================================
-- Add `cekanje_uplate` (awaiting payment) status and payment_reference
-- ============================================================
-- This enables the personal-Revolut reconciliation flow where:
--  1. Customer creates an order
--  2. Order starts in `cekanje_uplate` until merchant verifies the
--     incoming payment in their Revolut app
--  3. Merchant clicks "Mark paid" in admin → status becomes `nova`
--     and `placeno` flips to true

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'cekanje_uplate'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'narudzba_status')
  ) THEN
    ALTER TYPE narudzba_status ADD VALUE 'cekanje_uplate' BEFORE 'nova';
  END IF;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE INDEX IF NOT EXISTS orders_unpaid_idx
  ON orders (placeno, status) WHERE placeno = false;

COMMENT ON COLUMN orders.payment_reference IS
  'Reference shown to customer on payment page; matches order_number';
