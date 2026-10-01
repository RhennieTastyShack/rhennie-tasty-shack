-- Ride with 701 platform settings and vehicle pricing profiles.
-- Extends the existing riders/deliveries system; does not replace it.

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (key, value)
VALUES ('ride_platform_commission', '6.6')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS delivery_vehicle_pricing (
  category TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  base_fee_ngn INTEGER NOT NULL,
  per_km_ngn INTEGER NOT NULL,
  minimum_fee_ngn INTEGER NOT NULL,
  minimum_partner_earning_ngn INTEGER NOT NULL,
  max_distance_km NUMERIC NOT NULL DEFAULT 40,
  max_capacity_note TEXT,
  large_order_adjustment_ngn INTEGER NOT NULL DEFAULT 0,
  waiting_fee_per_15_min_ngn INTEGER NOT NULL DEFAULT 0,
  surge_multiplier NUMERIC NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO delivery_vehicle_pricing (
  category,
  label,
  base_fee_ngn,
  per_km_ngn,
  minimum_fee_ngn,
  minimum_partner_earning_ngn,
  max_distance_km,
  max_capacity_note,
  large_order_adjustment_ngn,
  waiting_fee_per_15_min_ngn,
  surge_multiplier
) VALUES
  ('bicycle', 'Bicycle', 400, 150, 700, 600, 8, 'Light parcels only', 0, 100, 1),
  ('electric_bicycle', 'Electric Bicycle', 450, 170, 800, 700, 12, 'Light to medium parcels', 200, 100, 1),
  ('motorcycle', 'Motorcycle / Bike', 500, 200, 900, 800, 40, 'Standard food bags', 300, 150, 1),
  ('tricycle', 'Tricycle', 800, 280, 1400, 1200, 35, 'Bulk bags and trays', 500, 200, 1),
  ('car', 'Car', 1500, 350, 2500, 2200, 50, 'Large orders and catering trays', 800, 250, 1),
  ('mini_van', 'Mini Van', 2500, 450, 4000, 3500, 60, 'Event and multi-bag loads', 1200, 300, 1),
  ('van', 'Van', 3500, 550, 5500, 4800, 80, 'Full catering and bulk logistics', 2000, 400, 1),
  ('other', 'Other approved vehicle', 500, 200, 900, 800, 40, 'As approved by Rhennie Studio', 300, 150, 1)
ON CONFLICT (category) DO NOTHING;
