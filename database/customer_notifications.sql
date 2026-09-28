-- =====================================================
-- CUSTOMER NOTIFICATIONS / OTP
-- Rhennie Tasty Shack
-- Uses client_profiles (no customers table)
-- =====================================================

-- Phone verification on client profiles (portal accounts)
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

-- In-app notifications inbox (auth-user keyed; no customers FK)
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

    title text NOT NULL,

    message text NOT NULL,

    type text DEFAULT 'info',

    event text,

    is_read boolean DEFAULT false,

    created_at timestamptz DEFAULT now()
);

-- If notifications already existed without these columns:
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS event text;

CREATE INDEX IF NOT EXISTS idx_notifications_auth_user
ON notifications(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
ON notifications(is_read);

-- OTP challenges (store hash only)
CREATE TABLE IF NOT EXISTS otp_challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    phone text NOT NULL,

    purpose text NOT NULL DEFAULT 'SIGNUP',
    -- SIGNUP | LOGIN

    code_hash text NOT NULL,

    expires_at timestamptz NOT NULL,

    attempts integer NOT NULL DEFAULT 0,

    consumed_at timestamptz,

    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_user
ON otp_challenges(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_phone
ON otp_challenges(phone);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_active
ON otp_challenges(phone, purpose)
WHERE consumed_at IS NULL;

-- Provider send audit log
CREATE TABLE IF NOT EXISTS notification_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

    client_profile_id uuid,

    channel text NOT NULL,
    -- email | sms | whatsapp

    event text NOT NULL,

    payload jsonb NOT NULL DEFAULT '{}'::jsonb,

    status text NOT NULL DEFAULT 'pending',
    -- pending | sent | failed | skipped

    provider_id text,

    error text,

    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user
ON notification_log(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_event
ON notification_log(event);

CREATE INDEX IF NOT EXISTS idx_notification_log_created
ON notification_log(created_at DESC);
