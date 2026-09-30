-- Rewards (loyalty) + Ride with 701 partner payouts.
-- Safe to re-run in the Supabase SQL editor.
-- Run after rider_tracking.sql / riders.sql when setting up a fresh database.

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS photo_path text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS plate_number text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS vehicle_color text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS vehicle_model text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS bank_name text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS bank_code text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS bank_account_name text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS bank_account_number text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS platform_fee_accepted boolean DEFAULT false;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS platform_fee_percent integer DEFAULT 5;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS order_code text;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS rider_latitude double precision;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS rider_longitude double precision;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS location_updated_at timestamptz;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS tip_amount numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS tip_amount numeric(12,2) NOT NULL DEFAULT 0;

UPDATE deliveries
SET order_code = lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
WHERE order_code IS NULL OR btrim(order_code) = '';

-- =====================================================
-- CUSTOMER LOYALTY / REWARDS
-- =====================================================

CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email text UNIQUE NOT NULL,
    auth_user_id uuid,
    customer_name text,
    points integer NOT NULL DEFAULT 0,
    lifetime_spend numeric(12,2) NOT NULL DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email text NOT NULL,
    order_id uuid,
    points integer NOT NULL,
    reason text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (order_id, reason)
);

CREATE TABLE IF NOT EXISTS customer_period_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type text NOT NULL,
    period_key text NOT NULL,
    customer_email text NOT NULL,
    customer_name text,
    spend numeric(12,2) NOT NULL DEFAULT 0,
    bonus_points integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE (period_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_email
    ON loyalty_ledger (customer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_email
    ON loyalty_accounts (customer_email);

-- =====================================================
-- RIDE WITH 701 PARTNER PAYOUTS
-- =====================================================

CREATE TABLE IF NOT EXISTS rider_payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id uuid UNIQUE,
    rider_id uuid,
    order_id uuid,
    amount numeric(12,2) NOT NULL DEFAULT 0,
    delivery_fee numeric(12,2) NOT NULL DEFAULT 0,
    platform_share numeric(12,2) NOT NULL DEFAULT 0,
    rider_fee numeric(12,2) NOT NULL DEFAULT 0,
    tip_amount numeric(12,2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending',
    bank_name text,
    bank_account_number text,
    provider_reference text,
    note text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE rider_payouts
    ADD COLUMN IF NOT EXISTS platform_share numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE rider_payouts
    ADD COLUMN IF NOT EXISTS rider_fee numeric(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_rider_payouts_rider
    ON rider_payouts (rider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rider_payouts_status
    ON rider_payouts (status);

ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_period_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_payouts ENABLE ROW LEVEL SECURITY;

-- App uses the service role for these tables. Block direct anon/authenticated access.
DROP POLICY IF EXISTS loyalty_accounts_no_direct ON loyalty_accounts;
CREATE POLICY loyalty_accounts_no_direct
  ON loyalty_accounts FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS loyalty_ledger_no_direct ON loyalty_ledger;
CREATE POLICY loyalty_ledger_no_direct
  ON loyalty_ledger FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS customer_period_rewards_no_direct ON customer_period_rewards;
CREATE POLICY customer_period_rewards_no_direct
  ON customer_period_rewards FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS rider_payouts_no_direct ON rider_payouts;
CREATE POLICY rider_payouts_no_direct
  ON rider_payouts FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

SELECT pg_notify('pgrst', 'reload schema');

SELECT
    'loyalty_accounts' AS item,
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_accounts'
    ) AS ready
UNION ALL
SELECT
    'loyalty_ledger',
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_ledger'
    )
UNION ALL
SELECT
    'customer_period_rewards',
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_period_rewards'
    )
UNION ALL
SELECT
    'rider_payouts',
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rider_payouts'
    )
UNION ALL
SELECT
    'riders.bank_account_number',
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'riders'
          AND column_name = 'bank_account_number'
    )
UNION ALL
SELECT
    'deliveries.order_code',
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'deliveries'
          AND column_name = 'order_code'
    );
