-- ==========================================
-- QUOTATION ITEMS
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists quotation_items (

    id uuid primary key default gen_random_uuid(),

    quotation_id uuid not null references quotations(id) on delete cascade,

    item_name text not null,

    category text,

    quantity integer default 1,

    unit_price numeric(12,2) default 0,

    total_price numeric(12,2) default 0,

    notes text,

    created_at timestamptz default now()

);

create index if not exists idx_quotation_items_quotation
on quotation_items(quotation_id);