-- Checkout columns on payments. No customers table required.

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS customer_id uuid;

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
    ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS provider_metadata jsonb;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

NOTIFY pgrst, 'reload schema';
