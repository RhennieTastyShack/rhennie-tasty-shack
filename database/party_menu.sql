-- Appetizers for Event Concierge.
-- Every appetizer has a minimum order of 10.
-- Tapioca with fish is ₦5,500 a serving.

INSERT INTO public.menu
  (name, collection, description, price, image_url, available)
SELECT
  dish.name,
  'Appetizers',
  dish.description,
  dish.price,
  dish.image_url,
  true
FROM (
  VALUES
    ('Waffles', 'Waffles, grilled chicken, sausage and sauce, packed as a box.', 8000, '/images/waffle.jpeg'),
    ('Fruit & Cream Dessert', 'Fruit and cream, served as a party dessert.', 3000, '/images/fruit-and-cream.jpg'),
    ('RTS Ocean Royale', 'Rice with prawn, shellfish and grilled meat, served in a cup.', 6500, '/images/ocean-royale.jpg'),
    ('RTS Suya Jollof Bowl', 'Suya skewer with peppers and onions over jollof, served in a bowl.', 6000, '/images/suya-jollof-bowl.jpg'),
    ('Seafood Platter', 'Crabs, prawns, glazed corn, fish and sauce.', 45000, '/images/seafood-platter.jpg'),
    ('Tapioca, Fish, Fries & Coleslaw', 'Tapioca with fish, fries and coleslaw.', 5500, '/images/fish-fries-coleslaw.jpg'),
    ('Tapioca, Shrimps & Eja Yoyo', 'Tapioca with shrimps and eja yoyo.', 2000, '/images/tapioca-shrimps-eja-yoyo.jpg'),
    ('Grilled Fish', 'Grilled fish, finished for the table.', 15000, '/images/grilled-fish-platter.jpg'),
    ('Peppered Snail Platter', 'Snail, fries and sauce.', 10000, '/images/snail.jpeg'),
    ('Asun Party Bowl', 'Peppered goat, prepared as a bowl for guests.', 3500, '/images/asun.jpeg'),
    ('Small Chops', 'Spring rolls, samosa and bites for a reception.', 3500, '/images/small-chops.jpg'),
    ('Pepper Soup & Bread Rolls', 'Pepper soup served with bread rolls.', 5500, '/images/pepper-soup-bread-rolls.jpg'),
    ('Prawn Kebab', 'A prawn kebab for a standing reception.', 10000, '/images/prawn kebab.jpeg'),
    ('Pasta Cups', 'Choose any cups. Every cup in this list is the same price.', 3500, '/images/pasta-cups.jpg'),
    ('Premium Pasta Cups', 'Choose any cups. Every cup in this list is the same price.', 4500, '/images/pasta-cups.jpg')
) AS dish(name, description, price, image_url)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.menu existing
  WHERE existing.name = dish.name
    AND existing.collection = 'Appetizers'
);

UPDATE public.menu
SET available = false
WHERE name IN (
  'Celebration Cake Platter',
  'Chocolate Brownie Bites',
  'Puff-Puff Dessert Tower'
);
