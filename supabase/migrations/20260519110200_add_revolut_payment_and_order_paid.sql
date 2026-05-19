-- ============================================================
-- Migration: Add Revolut payment method and order paid tracking
-- ============================================================

-- Add 'revolut' to payment method enum
ALTER TYPE nacin_placanja_tip ADD VALUE IF NOT EXISTS 'revolut';

-- Add paid status and payment date to orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS placeno BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS datum_placanja TIMESTAMPTZ;

-- Add comment for clarity
COMMENT ON COLUMN orders.placeno IS 'Označava je li narudžba plaćena (za revolut/bankovno)';
COMMENT ON COLUMN orders.datum_placanja IS 'Datum i vrijeme kada je uplata potvrđena';
