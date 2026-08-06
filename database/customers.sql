-- ==========================================
-- CUSTOMERS
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists customers (

    id uuid primary key default gen_random_uuid(),

    auth_user_id uuid unique references auth.users(id) on delete cascade,

    full_name text not null,

    email text unique not null,

    phone text,

    address text,

    city text,

    state text,

    profile_image text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index if not exists idx_customers_email
on customers(email);

create index if not exists idx_customers_name
on customers(full_name);