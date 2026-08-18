-- =====================================================
-- RHENNIE TASTY SHACK
-- MENU SEED DATA
-- =====================================================

INSERT INTO public.menu
  (name, collection, description, price, image_url, available)
VALUES

-- =========================
-- SIGNATURE MEALS
-- =========================

(
  'Jollof Rice + Turkey',
  'Signature Meals',
  'Premium jollof rice served with turkey.',
  8000,
  '',
  true
),

(
  'Jollof Rice + Chicken',
  'Signature Meals',
  'Premium jollof rice served with chicken.',
  5500,
  '',
  true
),

(
  'Royale Pasta Bowl + Turkey',
  'Signature Meals',
  'Creamy royale pasta bowl served with turkey.',
  8000,
  '',
  true
),

(
  'Golden Harvest Fried Rice',
  'Signature Meals',
  'Premium fried rice prepared with carefully selected ingredients.',
  8500,
  '',
  true
),

(
  'Seafood Rice',
  'Signature Meals',
  'Rich seafood rice prepared with premium seafood.',
  12500,
  '',
  true
),

(
  'Seafood Okra',
  'Signature Meals',
  'Premium seafood okra prepared for a rich dining experience.',
  10000,
  '',
  true
),

(
  'Amala & Assorted',
  'Signature Meals',
  'Traditional amala served with assorted meat.',
  6000,
  '',
  true
),

(
  'Small Chops',
  'Signature Meals',
  'A selection of freshly prepared small chops.',
  3000,
  '',
  true
),

-- =========================
-- FOOD BOXES
-- =========================

(
  'Luxury Brunch Box',
  'Food Boxes',
  'A premium brunch box curated by Rhennie Tasty Shack.',
  35000,
  '',
  true
),

(
  'Weekend Treat Box',
  'Food Boxes',
  'A premium food box perfect for weekend indulgence.',
  40000,
  '',
  true
),

-- =========================
-- FOOD BY LITRE
-- =========================

(
  'Party Jollof Rice - 1 Litre',
  'Food By Litre',
  'Party-style jollof rice supplied by the litre.',
  28000,
  '',
  true
),

(
  'Seafood Rice - 1 Litre',
  'Food By Litre',
  'Premium seafood rice supplied by the litre.',
  40000,
  '',
  true
),

(
  'Seafood Okra - 1 Litre',
  'Food By Litre',
  'Premium seafood okra supplied by the litre.',
  45000,
  '',
  true
);