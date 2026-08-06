-- ==========================================
-- NOTIFICATIONS
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists notifications (

    id uuid primary key default gen_random_uuid(),

    customer_id uuid references customers(id) on delete cascade,

    title text not null,

    message text not null,

    type text default 'info',

    is_read boolean default false,

    created_at timestamptz default now()

);

create index if not exists idx_notifications_customer
on notifications(customer_id);

create index if not exists idx_notifications_read
on notifications(is_read);