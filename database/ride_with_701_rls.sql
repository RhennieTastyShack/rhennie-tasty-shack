-- Ride with 701 RLS for delivery_assignments + settings tables.
-- Run after ride_with_701_extensions.sql. Safe to re-run.

ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_vehicle_pricing ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS. Deny anon/authenticated direct table access;
-- the Next.js API uses the service role for kitchen and partner operations.

DROP POLICY IF EXISTS delivery_assignments_no_direct ON delivery_assignments;
CREATE POLICY delivery_assignments_no_direct
  ON delivery_assignments
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS platform_settings_no_direct ON platform_settings;
CREATE POLICY platform_settings_no_direct
  ON platform_settings
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS delivery_vehicle_pricing_no_direct ON delivery_vehicle_pricing;
CREATE POLICY delivery_vehicle_pricing_no_direct
  ON delivery_vehicle_pricing
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
