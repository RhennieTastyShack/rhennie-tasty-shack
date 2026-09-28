-- Run this in the Supabase SQL editor after rider_tracking.sql.

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

CREATE TABLE IF NOT EXISTS rider_payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id uuid UNIQUE,
    rider_id uuid,
    order_id uuid,
    amount numeric(12,2) NOT NULL DEFAULT 0,
    delivery_fee numeric(12,2) NOT NULL DEFAULT 0,
    tip_amount numeric(12,2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending',
    bank_name text,
    bank_account_number text,
    provider_reference text,
    note text,
    created_at timestamptz DEFAULT now()
);

SELECT pg_notify('pgrst', 'reload schema');

SELECT
    'riders.photo_path' AS item,
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riders' AND column_name = 'photo_path'
    ) AS ready
UNION ALL
SELECT
    'deliveries.order_code',
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'deliveries' AND column_name = 'order_code'
    )
UNION ALL
SELECT
    'loyalty_accounts',
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_accounts'
    )
UNION ALL
SELECT
    'rider_payouts',
    EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'rider_payouts'
    );
