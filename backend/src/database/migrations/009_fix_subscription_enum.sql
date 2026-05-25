-- Migration 009: Fix subscription_tier enum to canonical values
-- Old: ('free','business','ai') or ('starter','pro')
-- New: ('free','pro','franchise')
-- A1 from prompt.md

DO $$ 
DECLARE
    current_enum_values TEXT[];
    has_old_values BOOLEAN;
BEGIN
    -- Check if enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) INTO current_enum_values
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'subscription_tier';

        -- Only migrate if values differ from canonical
        IF current_enum_values IS DISTINCT FROM ARRAY['free', 'pro', 'franchise'] THEN
            has_old_values := TRUE;

            -- Check if columns reference this enum before altering
            ALTER TYPE subscription_tier RENAME TO subscription_tier_old;

            CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'franchise');

            -- Update all tables that use this enum type
            ALTER TABLE tenants 
                ALTER COLUMN tier DROP DEFAULT,
                ALTER COLUMN tier TYPE subscription_tier 
                USING CASE tier::text
                    WHEN 'starter' THEN 'free'::subscription_tier
                    WHEN 'business' THEN 'pro'::subscription_tier
                    WHEN 'pro' THEN 'pro'::subscription_tier
                    WHEN 'free' THEN 'free'::subscription_tier
                    WHEN 'ai' THEN 'pro'::subscription_tier
                    ELSE 'free'::subscription_tier
                END,
                ALTER COLUMN tier SET DEFAULT 'free'::subscription_tier;

            DROP TYPE subscription_tier_old;
        END IF;
    END IF;
END $$;
