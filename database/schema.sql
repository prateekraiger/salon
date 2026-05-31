-- ============================================================
-- LUXE SALON BOOKING PLATFORM - SUPABASE DATABASE SCHEMA v2.0
-- ============================================================
-- Instructions:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. All tables, indexes, triggers, and RLS policies will be created
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  category        TEXT NOT NULL,
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number      TEXT UNIQUE NOT NULL,

  -- Customer Info
  customer_name       TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  customer_email      TEXT,

  -- Service
  service_id          UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Appointment
  appointment_date    DATE NOT NULL,
  appointment_time    TEXT NOT NULL,

  -- Location
  address             TEXT NOT NULL,
  city                TEXT,
  pincode             TEXT,
  notes               TEXT,

  -- Payment
  payment_method      TEXT NOT NULL CHECK (payment_method IN ('online', 'cod')),
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  total_amount        NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),

  -- Razorpay
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,

  -- Status
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: payments
-- (Stores payment transaction records)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,

  amount              NUMERIC(10, 2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_method      TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique payment records per Razorpay payment ID
  UNIQUE(razorpay_payment_id)
);

-- ============================================================
-- TABLE: processed_webhooks
-- (For idempotent webhook handling)
-- ============================================================
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id   TEXT,
  event_type          TEXT NOT NULL,
  processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure we don't process the same webhook event twice
  UNIQUE(razorpay_payment_id, event_type)
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
-- Service indexes
CREATE INDEX IF NOT EXISTS idx_services_category     ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active    ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_is_deleted   ON services(is_deleted);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_service_id       ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status           ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method   ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status   ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at       ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment      ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone            ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number   ON bookings(booking_number);

-- COMPOSITE INDEX: Prevent double-booking - unique appointment slots
-- This ensures no two confirmed/pending bookings can exist for same date+time
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_slot
  ON bookings (appointment_date, appointment_time)
  WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Razorpay indexes
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_order   ON bookings(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id       ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment ON payments(razorpay_payment_id);

-- Webhook indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_payment_event ON processed_webhooks(razorpay_payment_id, event_type);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Cleanup abandoned bookings
-- (Run periodically or via cron/job scheduler)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_abandoned_bookings()
RETURNS INTEGER AS $$
DECLARE
  cancelled_count INTEGER;
BEGIN
  UPDATE bookings
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE payment_method = 'online'
    AND payment_status = 'pending'
    AND status = 'pending'
    AND created_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  
  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Get available time slots for a date
-- ============================================================
CREATE OR REPLACE FUNCTION get_available_slots(p_date DATE)
RETURNS TABLE (time_slot TEXT, is_available BOOLEAN) AS $$
DECLARE
  all_slots TEXT[] := ARRAY[
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM'
  ];
  booked_slots TEXT[];
BEGIN
  -- Get booked slots for the date
  SELECT ARRAY_AGG(appointment_time)
  INTO booked_slots
  FROM bookings
  WHERE appointment_date = p_date
    AND status IN ('pending', 'confirmed', 'in_progress');

  -- Return all slots with availability
  RETURN QUERY
  SELECT 
    slot as time_slot,
    NOT (slot = ANY(COALESCE(booked_slots, ARRAY[]::TEXT[]))) as is_available
  FROM UNNEST(all_slots) as slot;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Services: public read (only active, not deleted), service_role write
CREATE POLICY "Services are publicly readable"
  ON services FOR SELECT
  USING (is_active = TRUE AND is_deleted = FALSE);

CREATE POLICY "Service role can manage services"
  ON services FOR ALL
  USING (auth.role() = 'service_role');

-- Bookings: service_role full access
CREATE POLICY "Service role can manage bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');

-- Payments: service_role full access
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');

-- Webhooks: service_role full access
CREATE POLICY "Service role can manage webhooks"
  ON processed_webhooks FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA: Sample Services
-- ============================================================
INSERT INTO services (name, description, price, duration_minutes, category, is_active, is_deleted)
VALUES
  ('Classic Haircut', 'Expert haircut tailored to your face shape and style. Includes wash and blow-dry.', 399, 45, 'Hair', true, false),
  ('Hair Coloring', 'Full hair coloring using premium, long-lasting colors. Includes toning and conditioning.', 1499, 120, 'Hair', true, false),
  ('Highlights & Balayage', 'Natural-looking highlights or balayage technique for a sun-kissed effect.', 2499, 150, 'Hair', true, false),
  ('Keratin Treatment', 'Smooth, frizz-free hair with our professional keratin straightening treatment.', 2999, 180, 'Hair', true, false),
  
  ('Deep Cleansing Facial', 'Thorough skin cleansing, extraction, and hydration for a fresh, glowing complexion.', 799, 60, 'Skin', true, false),
  ('Anti-Aging Facial', 'Advanced facial treatment targeting fine lines and wrinkles for youthful skin.', 1299, 75, 'Skin', true, false),
  ('Gold Facial', 'Luxury gold-infused facial for brightening and revitalizing tired skin.', 1499, 75, 'Skin', true, false),
  
  ('Classic Manicure', 'Complete nail shaping, cuticle care, buff, and polish for beautiful hands.', 399, 45, 'Nails', true, false),
  ('Gel Manicure', 'Long-lasting gel polish manicure that stays chip-free for weeks.', 699, 60, 'Nails', true, false),
  ('Manicure & Pedicure Combo', 'Complete hand and foot care with nail shaping, massage, and polish.', 999, 90, 'Nails', true, false),
  
  ('Swedish Massage', 'Relaxing full-body Swedish massage to relieve stress and muscle tension.', 1299, 60, 'Spa', true, false),
  ('Aromatherapy Massage', 'Therapeutic massage with essential oils for deep relaxation and rejuvenation.', 1599, 90, 'Spa', true, false),
  
  ('HD Makeup', 'High definition makeup application using professional products for a flawless finish.', 1999, 90, 'Makeup', true, false),
  ('Party Makeup', 'Glamorous makeup for parties, events, and special occasions.', 1499, 75, 'Makeup', true, false),
  
  ('Bridal Makeup', 'Stunning bridal makeup using premium international products. Includes trial session.', 4999, 180, 'Bridal', true, false),
  ('Complete Bridal Package', 'Full bridal package including makeup, hair styling, saree draping, and accessories.', 9999, 300, 'Bridal', true, false)

ON CONFLICT DO NOTHING;
