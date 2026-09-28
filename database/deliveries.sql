-- =====================================================
-- DELIVERIES
-- Rhennie Tasty Shack
-- =====================================================

CREATE TABLE IF NOT EXISTS deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    mode text NOT NULL DEFAULT 'PLATFORM',
    -- CUSTOMER_DISPATCH | PLATFORM

    rider_id uuid REFERENCES riders(id) ON DELETE SET NULL,

    external_rider_name text,

    external_rider_phone text,

    status text NOT NULL DEFAULT 'UNASSIGNED',
    -- UNASSIGNED | ASSIGNED | PICKED_UP | ON_THE_WAY | DELIVERED | CANCELLED

    tracking_token text UNIQUE NOT NULL,

    status_history jsonb NOT NULL DEFAULT '[]'::jsonb,

    pickup_notes text,

    created_at timestamptz DEFAULT now(),

    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order
ON deliveries(order_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_rider
ON deliveries(rider_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_status
ON deliveries(status);

CREATE INDEX IF NOT EXISTS idx_deliveries_token
ON deliveries(tracking_token);
