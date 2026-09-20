-- =====================================================
-- SUBSCRIPTIONS (Meal Plans)
-- Rhennie Tasty Shack
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id uuid REFERENCES customers(id),

    customer_code text,

    plan_slug text,

    plan_name text,

    customer_name text,

    customer_email text,

    customer_phone text,

    delivery_address text,

    delivery_days jsonb DEFAULT '[]'::jsonb,

    delivery_time text,

    timetable jsonb DEFAULT '[]'::jsonb,

    special_requests text,

    amount numeric(12,2),

    currency text DEFAULT 'NGN',

    status text DEFAULT 'PENDING',

    payment_status text DEFAULT 'UNPAID',

    payment_reference text,

    admin_notes text,

    start_date date,

    end_date date,

    source_subscription_id uuid REFERENCES subscriptions(id),

    created_at timestamptz DEFAULT now(),

    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer
ON subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status
ON subscriptions(payment_status);

-- Link payments to meal-plan subscriptions (idempotent)
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS subscription_id uuid;

CREATE INDEX IF NOT EXISTS idx_payment_subscription
ON payments(subscription_id);

-- Optional FK if both tables already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payments_subscription_id_fkey'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT payments_subscription_id_fkey
            FOREIGN KEY (subscription_id)
            REFERENCES subscriptions(id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
    WHEN duplicate_object THEN
        NULL;
END $$;
