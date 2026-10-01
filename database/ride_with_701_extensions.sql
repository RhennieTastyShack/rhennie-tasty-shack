-- Ride with 701 capacity, pickup codes, multi-assignment accounting.
-- Extends existing orders/deliveries/riders. Run after ride_with_701.sql.

ALTER TABLE delivery_vehicle_pricing
  ADD COLUMN IF NOT EXISTS max_bags INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS max_items INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_weight_kg NUMERIC NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS max_volume_litres NUMERIC NOT NULL DEFAULT 25;

UPDATE delivery_vehicle_pricing SET
  max_bags = CASE category
    WHEN 'bicycle' THEN 1
    WHEN 'electric_bicycle' THEN 2
    WHEN 'motorcycle' THEN 4
    WHEN 'tricycle' THEN 8
    WHEN 'car' THEN 12
    WHEN 'mini_van' THEN 20
    WHEN 'van' THEN 40
    ELSE 4
  END,
  max_items = CASE category
    WHEN 'bicycle' THEN 3
    WHEN 'electric_bicycle' THEN 5
    WHEN 'motorcycle' THEN 10
    WHEN 'tricycle' THEN 20
    WHEN 'car' THEN 30
    WHEN 'mini_van' THEN 50
    WHEN 'van' THEN 100
    ELSE 10
  END,
  max_weight_kg = CASE category
    WHEN 'bicycle' THEN 5
    WHEN 'electric_bicycle' THEN 8
    WHEN 'motorcycle' THEN 15
    WHEN 'tricycle' THEN 40
    WHEN 'car' THEN 60
    WHEN 'mini_van' THEN 120
    WHEN 'van' THEN 250
    ELSE 15
  END,
  max_volume_litres = CASE category
    WHEN 'bicycle' THEN 8
    WHEN 'electric_bicycle' THEN 12
    WHEN 'motorcycle' THEN 25
    WHEN 'tricycle' THEN 60
    WHEN 'car' THEN 100
    WHEN 'mini_van' THEN 220
    WHEN 'van' THEN 500
    ELSE 25
  END;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfilment_method TEXT,
  ADD COLUMN IF NOT EXISTS recommended_vehicle TEXT,
  ADD COLUMN IF NOT EXISTS pickup_code TEXT,
  ADD COLUMN IF NOT EXISTS pickup_status TEXT,
  ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(12,2) DEFAULT 0;

ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS recommended_vehicle TEXT,
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC,
  ADD COLUMN IF NOT EXISTS customer_delivery_charge NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_delivery_earning NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_commission_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS platform_commission_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS partner_net_earning NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS external_rider_company TEXT,
  ADD COLUMN IF NOT EXISTS external_rider_plate TEXT,
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collected_by_staff TEXT,
  ADD COLUMN IF NOT EXISTS collector_name TEXT;

-- Multiple partner assignments per food delivery (large catering / multi-bike).
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  vehicle_type TEXT,
  gross_earning NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_commission_percent NUMERIC(5,2) NOT NULL DEFAULT 6.6,
  platform_commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  partner_net_earning NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'UNASSIGNED',
  settlement_status TEXT NOT NULL DEFAULT 'pending',
  payout_status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_delivery
  ON delivery_assignments(delivery_id);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_rider
  ON delivery_assignments(rider_id);

ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
