-- Rider photo, bike details, live location, and order code.
-- Run this in the Supabase SQL editor.

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS photo_path text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS plate_number text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS vehicle_color text;

ALTER TABLE riders
    ADD COLUMN IF NOT EXISTS vehicle_model text;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS order_code text;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS rider_latitude double precision;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS rider_longitude double precision;

ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS location_updated_at timestamptz;

UPDATE deliveries
SET order_code = lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
WHERE order_code IS NULL OR btrim(order_code) = '';

NOTIFY pgrst, 'reload schema';
