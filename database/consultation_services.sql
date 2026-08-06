-- ==========================================
-- CONSULTATION SERVICES
-- ==========================================

create table if not exists consultation_services (

    id uuid primary key default gen_random_uuid(),

    name text unique not null,

    description text,

    created_at timestamptz default now()

);

insert into consultation_services (name, description)
values
('Buffet Service', 'Buffet-style catering'),
('Plated Service', 'Table service'),
('Small Chops', 'Cocktail snacks'),
('Cocktails & Mocktails', 'Beverage service'),
('Cake', 'Celebration cakes'),
('Desserts', 'Dessert station'),
('Grills & BBQ', 'Grill station'),
('Live Cooking Station', 'Chef live cooking'),
('Decoration', 'Event decoration'),
('Waiters & Servers', 'Professional serving staff'),
('Canopy & Chairs', 'Event rentals'),
('Photography', 'Photography services'),
('Videography', 'Videography services'),
('DJ & Entertainment', 'Music and entertainment'),
('Cleaning Service', 'Post-event cleanup')
on conflict (name) do nothing;