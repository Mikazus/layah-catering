-- ============================================================================
-- Layah Catering — Live Driver Position Tracking Migration (004_driver_tracking.sql)
-- Run in Neon SQL Editor
-- ============================================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_name VARCHAR(120) DEFAULT '',
  ADD COLUMN IF NOT EXISTS driver_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS driver_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS driver_location_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- Optional: Seed initial driver position near Tidar Atas for already-dispatched order ORD-000
UPDATE orders
SET
  driver_name = 'Bagas Santoso',
  driver_lat = -7.9685,
  driver_lng = 112.6240,
  driver_location_updated_at = NOW()
WHERE status = 'dispatched' AND driver_lat IS NULL;
