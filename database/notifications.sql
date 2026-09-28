-- ==========================================
-- NOTIFICATIONS
-- Rhennie Tasty Shack
-- Auth-user keyed (client_profiles / portal)
-- ==========================================

create table if not exists notifications (

    id uuid primary key default gen_random_uuid(),

    auth_user_id uuid references auth.users(id) on delete cascade,

    title text not null,

    message text not null,

    type text default 'info',

    event text,

    is_read boolean default false,

    created_at timestamptz default now()

);

create index if not exists idx_notifications_auth_user
on notifications(auth_user_id);

create index if not exists idx_notifications_read
on notifications(is_read);
