-- =====================================================
-- PAYMENTS
-- Rhennie Tasty Shack
-- =====================================================

create table if not exists payments (

    id uuid primary key default gen_random_uuid(),

    payment_no text unique not null,

    customer_id uuid references customers(id),

    order_id uuid references orders(id),

    quotation_id uuid references quotations(id),

    amount numeric(12,2) not null,

    payment_method text,

    payment_status text default 'Pending',

    transaction_reference text,

    paid_at timestamptz,

    created_at timestamptz default now()

);
git add .
create index if not exists idx_payment_customer
on payments(customer_id);

create index if not exists idx_payment_order
on payments(order_id);