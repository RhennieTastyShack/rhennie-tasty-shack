-- ==========================================
-- CONSULTATIONS
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists consultations (

    id uuid primary key default gen_random_uuid(),

    consultation_no text unique not null,

    customer_id uuid references auth.users(id) on delete cascade,

    full_name text not null,

    email text not null,

    phone text,

    event_type text not null,

    event_date date,

    event_time time,

    guest_count integer,

    venue text,

    budget text,

    special_request text,

    status text not null default 'New',

    quotation_status text default 'Pending',

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index if not exists idx_consultation_customer
on consultations(customer_id);

create index if not exists idx_consultation_status
on consultations(status);

create index if not exists idx_consultation_date
on consultations(event_date);