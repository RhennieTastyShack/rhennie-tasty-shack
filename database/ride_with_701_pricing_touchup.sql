-- Ride With 701 pricing & location touch-up:
-- ₦800 starting fee, bus vehicle, multiple operating locations,
-- surge/waiting settings, waiting charge records.
-- Safe to re-run. Extends existing Ride With 701 tables only.

INSERT INTO platform_settings (key, value)
VALUES
  (
    'ride_base_location',
    '12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria'
  ),
  (
    'ride_service_locations',
    '[
      "12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria",
      "16B Unity Street, Off Kekerejesu, Ikola, Alagbado, Lagos"
    ]'
  ),
  ('ride_starting_fee_ngn', '800'),
  ('ride_platform_commission', '6.6'),
  (
    'ride_surge_config',
    '{"enabled":false,"multiplier":1,"reason":"","startsAt":null,"endsAt":null,"areas":"","vehicleCategories":""}'
  ),
  (
    'ride_waiting_config',
    '{"enabled":true,"freeWaitingMinutes":10,"feePerMinuteNgn":40,"maxFeeNgn":2000}'
  )
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;


-- Motorcycle / Bike: minimum ₦800, ₦200/km (₦800 is a floor, not an add-on).

UPDATE delivery_vehicle_pricing
SET
  base_fee_ngn = 800,
  per_km_ngn = 200,
  minimum_fee_ngn = 800,
  updated_at = NOW()
WHERE category = 'motorcycle';


-- Ensure eligible lower-cost vehicle categories start from at least ₦800.

UPDATE delivery_vehicle_pricing
SET
  base_fee_ngn = 800,
  minimum_fee_ngn = 800,
  minimum_partner_earning_ngn = LEAST(minimum_partner_earning_ngn, 750),
  updated_at = NOW()
WHERE category IN (
  'motorcycle',
  'bicycle',
  'electric_bicycle',
  'other'
)
AND base_fee_ngn < 800;


-- Add Bus as an available Ride With 701 vehicle category.

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
)
VALUES (
  'bus',
  'Bus',
  5000,
  650,
  7000,
  6000,
  100,
  'Large group catering and bulk logistics',
  2500,
  500,
  1
)
ON CONFLICT (category) DO NOTHING;


-- Remove Truck / Pickup Truck pricing rows if they were added previously.

DELETE FROM delivery_vehicle_pricing
WHERE lower(category) IN (
  'truck',
  'pickup',
  'pickup_truck',
  'lorry'
);


-- Record customer/sender/receiver-caused waiting charges.

CREATE TABLE IF NOT EXISTS delivery_waiting_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_id UUID NOT NULL
    REFERENCES deliveries(id)
    ON DELETE CASCADE,

  order_id UUID
    REFERENCES orders(id)
    ON DELETE SET NULL,

  rider_id UUID
    REFERENCES riders(id)
    ON DELETE SET NULL,

  arrived_at TIMESTAMPTZ,

  waiting_started_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  free_waiting_minutes INTEGER
    NOT NULL DEFAULT 10,

  chargeable_minutes INTEGER
    NOT NULL DEFAULT 0,

  fee_per_minute_ngn INTEGER
    NOT NULL DEFAULT 0,

  waiting_fee_ngn NUMERIC(12,2)
    NOT NULL DEFAULT 0,

  -- Waiting fee can only be attributed to:
  -- customer | sender | receiver
  cause TEXT
    NOT NULL DEFAULT 'customer',

  reason TEXT NOT NULL,

  evidence_note TEXT,

  -- pending | applied | waived | disputed
  status TEXT
    NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CONSTRAINT delivery_waiting_cause_check
    CHECK (
      cause IN (
        'customer',
        'sender',
        'receiver'
      )
    ),

  CONSTRAINT delivery_waiting_status_check
    CHECK (
      status IN (
        'pending',
        'applied',
        'waived',
        'disputed'
      )
    )
);


CREATE INDEX IF NOT EXISTS idx_delivery_waiting_delivery
  ON delivery_waiting_charges(delivery_id);

CREATE INDEX IF NOT EXISTS idx_delivery_waiting_order
  ON delivery_waiting_charges(order_id);


ALTER TABLE delivery_waiting_charges
ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS
  delivery_waiting_charges_no_direct
ON delivery_waiting_charges;


CREATE POLICY delivery_waiting_charges_no_direct
  ON delivery_waiting_charges
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
