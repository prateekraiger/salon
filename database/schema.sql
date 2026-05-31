-- ============================================================
-- LUXE SALON BOOKING PLATFORM - SUPABASE DATABASE SCHEMA
-- ============================================================
-- Instructions:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. All tables, indexes, and RLS policies will be created
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

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_category     ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active    ON services(is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_service_id   ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status       ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at   ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment  ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone        ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id   ON payments(booking_id);

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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Services: public read, service_role write
CREATE POLICY "Services are publicly readable"
  ON services FOR SELECT
  USING (is_active = TRUE);

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

-- ============================================================
-- SEED DATA: Sample Services
-- ============================================================
INSERT INTO services (name, description, price, duration_minutes, category, is_active)
VALUES
  ('Classic Haircut', 'Expert haircut tailored to your face shape and style. Includes wash and blow-dry.', 399, 45, 'Hair', true),
  ('Hair Coloring', 'Full hair coloring using premium, long-lasting colors. Includes toning and conditioning.', 1499, 120, 'Hair', true),
  ('Highlights & Balayage', 'Natural-looking highlights or balayage technique for a sun-kissed effect.', 2499, 150, 'Hair', true),
  ('Keratin Treatment', 'Smooth, frizz-free hair with our professional keratin straightening treatment.', 2999, 180, 'Hair', true),

  ('Deep Cleansing Facial', 'Thorough skin cleansing, extraction, and hydration for a fresh, glowing complexion.', 799, 60, 'Skin', true),
  ('Anti-Aging Facial', 'Advanced facial treatment targeting fine lines and wrinkles for youthful skin.', 1299, 75, 'Skin', true),
  ('Gold Facial', 'Luxury gold-infused facial for brightening and revitalizing tired skin.', 1499, 75, 'Skin', true),

  ('Classic Manicure', 'Complete nail shaping, cuticle care, buff, and polish for beautiful hands.', 399, 45, 'Nails', true),
  ('Gel Manicure', 'Long-lasting gel polish manicure that stays chip-free for weeks.', 699, 60, 'Nails', true),
  ('Manicure & Pedicure Combo', 'Complete hand and foot care with nail shaping, massage, and polish.', 999, 90, 'Nails', true),

  ('Swedish Massage', 'Relaxing full-body Swedish massage to relieve stress and muscle tension.', 1299, 60, 'Spa', true),
  ('Aromatherapy Massage', 'Therapeutic massage with essential oils for deep relaxation and rejuvenation.', 1599, 90, 'Spa', true),

  ('HD Makeup', 'High definition makeup application using professional products for a flawless finish.', 1999, 90, 'Makeup', true),
  ('Party Makeup', 'Glamorous makeup for parties, events, and special occasions.', 1499, 75, 'Makeup', true),

  ('Bridal Makeup', 'Stunning bridal makeup using premium international products. Includes trial session.', 4999, 180, 'Bridal', true),
  ('Complete Bridal Package', 'Full bridal package including makeup, hair styling, saree draping, and accessories.', 9999, 300, 'Bridal', true)

ON CONFLICT DO NOTHING;
