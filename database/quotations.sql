-- ==========================================
-- QUOTATIONS
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists quotations (

    id uuid primary key default gen_random_uuid(),

    quotation_no text unique not null,

    consultation_id uuid references consultations(id) on delete cascade,

    customer_id uuid references customers(id) on delete cascade,

    subtotal numeric(12,2) default 0,

    discount numeric(12,2) default 0,

    tax numeric(12,2) default 0,

    total numeric(12,2) default 0,

    notes text,

    status text default 'Draft',

    valid_until date,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index if not exists idx_quotation_customer
on quotations(customer_id);

create index if not exists idx_quotation_consultation
on quotations(consultation_id);

create index if not exists idx_quotation_status
on quotations(status);