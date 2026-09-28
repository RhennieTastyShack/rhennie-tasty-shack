-- =====================================================
-- RIDERS
-- Rhennie Tasty Shack
-- =====================================================

CREATE TABLE IF NOT EXISTS riders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    full_name text NOT NULL,

    phone text NOT NULL,

    email text,

    address text,

    city text,

    id_type text,

    id_number text,

    id_document_path text,

    vehicle_type text DEFAULT 'bike',

    status text NOT NULL DEFAULT 'PENDING',
    -- PENDING | APPROVED | SUSPENDED

    is_available boolean NOT NULL DEFAULT false,

    notes text,

    created_at timestamptz DEFAULT now(),

    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riders_auth_user
ON riders(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_riders_status
ON riders(status);

CREATE INDEX IF NOT EXISTS idx_riders_available
ON riders(is_available)
WHERE status = 'APPROVED';
