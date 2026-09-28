-- =====================================================
-- PAYMENTS
-- Rhennie Tasty Shack
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_no text UNIQUE,

    customer_id uuid,

    order_id uuid REFERENCES orders(id),

    quotation_id uuid REFERENCES quotations(id),

    -- Used by meal-plan Paystack checkout
    subscription_id uuid,

    amount numeric(12,2) NOT NULL,

    currency text DEFAULT 'NGN',

    base_currency text,

    base_amount numeric(12,2),

    exchange_rate numeric(12,6) DEFAULT 1,

    payment_method text,

    payment_provider text,

    payment_status text DEFAULT 'pending',

    payment_reference text,

    transaction_reference text,

    provider_metadata jsonb,

    paid_at timestamptz,

    created_at timestamptz DEFAULT now(),

    updated_at timestamptz DEFAULT now()
);

-- Safe upgrades for existing databases
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS subscription_id uuid;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN';

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS base_currency text;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS base_amount numeric(12,2);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS exchange_rate numeric(12,6) DEFAULT 1;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_provider text;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_reference text;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS provider_metadata jsonb;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_payment_customer
ON payments(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_order
ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_payment_subscription
ON payments(subscription_id);
