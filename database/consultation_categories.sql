-- ==========================================
-- CONSULTATION CATEGORIES
-- ==========================================

create table if not exists consultation_categories (

    id uuid primary key default gen_random_uuid(),

    name text unique not null,

    description text,

    created_at timestamptz default now()

);

insert into consultation_categories (name, description)
values
('Wedding', 'Wedding catering'),
('Birthday', 'Birthday celebration'),
('Corporate', 'Corporate events'),
('Naming Ceremony', 'Naming ceremony'),
('House Warming', 'House warming'),
('Conference', 'Conference catering'),
('Private Dinner', 'Private dining'),
('Outdoor Catering', 'Outdoor catering'),
('Cocktail Party', 'Cocktail events'),
('Other', 'Other events')
on conflict (name) do nothing;