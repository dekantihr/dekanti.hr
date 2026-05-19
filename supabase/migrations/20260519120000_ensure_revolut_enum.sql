-- Ensure revolut is in the payment method enum
-- This migration is idempotent and safe to run multiple times

DO $$ 
BEGIN
    -- Check if 'revolut' exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'nacin_placanja_tip' 
        AND e.enumlabel = 'revolut'
    ) THEN
        -- Add 'revolut' to the enum
        ALTER TYPE nacin_placanja_tip ADD VALUE 'revolut';
        RAISE NOTICE 'Added revolut to nacin_placanja_tip enum';
    ELSE
        RAISE NOTICE 'revolut already exists in nacin_placanja_tip enum';
    END IF;
END $$;
