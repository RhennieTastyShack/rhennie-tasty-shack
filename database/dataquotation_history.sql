-- ==========================================
-- QUOTATION HISTORY
-- Rhennie Tasty Shack
-- ==========================================

create table if not exists quotation_history (

    id uuid primary key default gen_random_uuid(),

    quotation_id uuid not null references quotations(id) on delete cascade,

    action text not null,

    performed_by uuid references auth.users(id),

    notes text,

    created_at timestamptz default now()

);

create index if not exists idx_quotation_history_quotation
on quotation_history(quotation_id);