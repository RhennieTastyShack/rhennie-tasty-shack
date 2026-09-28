-- =====================================================
-- RTS WALLET
-- Rhennie Tasty Shack
-- Run this in the Supabase SQL editor.
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    balance_ngn integer NOT NULL DEFAULT 0 CHECK (balance_ngn >= 0),

    held_ngn integer NOT NULL DEFAULT 0 CHECK (held_ngn >= 0),

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    kind text NOT NULL,

    amount_ngn integer NOT NULL CHECK (amount_ngn > 0),

    reference text UNIQUE,

    status text NOT NULL DEFAULT 'pending',

    note text,

    bank_name text,

    account_number text,

    account_name text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user
ON wallet_ledger (auth_user_id, created_at DESC);

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS platform_fee_accepted boolean DEFAULT false;

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS platform_fee_percent integer DEFAULT 15;
