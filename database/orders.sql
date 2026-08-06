-- =====================================================
-- ORDERS
-- Rhennie Tasty Shack
-- =====================================================

create table if not exists orders (

    id uuid primary key default gen_random_uuid(),

    order_no text unique not null,

    customer_id uuid references customers(id) on delete cascade,

    quotation_id uuid references quotations(id) on delete set null,

    consultation_id uuid references consultations(id) on delete set null,

    order_status text default 'Pending',

    payment_status text default 'Pending',

    subtotal numeric(12,2) default 0,

    delivery_fee numeric(12,2) default 0,

    total numeric(12,2) default 0,

    event_date date,

    delivery_address text,

    notes text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index if not exists idx_orders_customer
on orders(customer_id);

create index if not exists idx_orders_status
on orders(order_status);