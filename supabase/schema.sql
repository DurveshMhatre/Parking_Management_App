-- ==========================================
-- 🅿️ PARKSPACE — Database Schema (Patch V3)
-- ==========================================
-- Run this SQL in your Supabase Dashboard:
-- https://supabase.com/dashboard → SQL Editor → New Query → Paste & Run
-- ==========================================

-- 1. Vehicle Types Table
CREATE TABLE IF NOT EXISTS vehicle_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🚗',
  total_slots INTEGER NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed vehicle types
INSERT INTO vehicle_types (name, icon, total_slots, hourly_rate) VALUES
  ('Car', '🚗', 2, 20.00),
  ('Bike', '🏍️', 5, 20.00),
  ('Rickshaw', '🛺', 2, 20.00)
ON CONFLICT DO NOTHING;

-- 2. Parking Config Table
CREATE TABLE IF NOT EXISTS parking_config (
  id SERIAL PRIMARY KEY,
  lot_name TEXT DEFAULT 'Durvesh Parking',
  hourly_rate DECIMAL(10,2) DEFAULT 20.00,
  open_time TEXT DEFAULT '10:00',
  close_time TEXT DEFAULT '20:00',
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true
);

INSERT INTO parking_config (lot_name) VALUES ('Durvesh Parking')
ON CONFLICT DO NOTHING;

-- 3. Parking Sessions Table
CREATE TABLE IF NOT EXISTS parking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_no TEXT NOT NULL,
  vehicle_type_id INTEGER REFERENCES vehicle_types(id),
  phone TEXT,
  user_id UUID REFERENCES auth.users(id),
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  duration_mins INTEGER,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_id TEXT,
  ticket_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'overstay')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 🆕 PATCH V3 — New Tables
-- ==========================================

-- ─────────────────────────────────────────
-- PARTNERS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  phone            TEXT NOT NULL UNIQUE,
  email            TEXT NOT NULL UNIQUE,
  referral_code    TEXT NOT NULL UNIQUE,
  bank_name        TEXT,
  bank_account_no  TEXT,
  bank_ifsc        TEXT,
  upi_id           TEXT,
  status           TEXT DEFAULT 'pending',   -- pending | active | suspended
  commission_rate  DECIMAL(5,2) DEFAULT 10.00,
  total_earned     DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn  DECIMAL(12,2) DEFAULT 0.00,
  pending_balance  DECIMAL(12,2) DEFAULT 0.00,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- COMMISSION TRANSACTIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commission_transactions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id         UUID REFERENCES partners(id) ON DELETE CASCADE,
  parking_session_id UUID REFERENCES parking_sessions(id),
  sale_amount        DECIMAL(10,2) NOT NULL,
  commission_rate    DECIMAL(5,2) NOT NULL,
  commission_amount  DECIMAL(10,2) NOT NULL,
  status             TEXT DEFAULT 'pending',  -- pending | approved | paid | rejected
  razorpay_payment_id TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  paid_at            TIMESTAMPTZ
);

-- ─────────────────────────────────────────
-- PAYOUT REQUESTS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id       UUID REFERENCES partners(id) ON DELETE CASCADE,
  amount           DECIMAL(10,2) NOT NULL,
  method           TEXT NOT NULL,           -- upi | bank_transfer
  upi_id           TEXT,
  bank_account_no  TEXT,
  bank_ifsc        TEXT,
  status           TEXT DEFAULT 'pending',  -- pending | processing | completed | rejected
  rejection_reason TEXT,
  requested_at     TIMESTAMPTZ DEFAULT NOW(),
  processed_at     TIMESTAMPTZ
);

-- ─────────────────────────────────────────
-- USER ROLES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role    TEXT NOT NULL DEFAULT 'customer'
  -- roles: 'customer' | 'partner' | 'owner'
);

-- ─────────────────────────────────────────
-- USER PUSH TOKENS TABLE (Expo push tokens)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_push_tokens (
  user_id    UUID REFERENCES auth.users(id) PRIMARY KEY,
  push_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PENALTY TRANSACTIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS penalty_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_session_id  UUID REFERENCES parking_sessions(id),
  vehicle_no          TEXT NOT NULL,
  vehicle_type        TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  overstay_minutes    INTEGER NOT NULL,
  penalty_hours       INTEGER NOT NULL,
  penalty_rate        INTEGER NOT NULL DEFAULT 20,
  penalty_amount      DECIMAL(10,2) NOT NULL,
  razorpay_payment_id TEXT,
  mandate_id          TEXT,
  -- deduction_status: initiated | success | failed | refunded
  deduction_status    TEXT DEFAULT 'initiated',
  failure_reason      TEXT,
  whatsapp_receipt_sent BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);


-- ==========================================
-- 🆕 PATCH V3 — ALTER parking_sessions
-- ==========================================

-- Fix status CHECK to include 'overstay'
ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS parking_sessions_status_check;
ALTER TABLE parking_sessions ADD CONSTRAINT parking_sessions_status_check
  CHECK (status IN ('active', 'completed', 'cancelled', 'overstay'));

-- Referral / Partner columns
ALTER TABLE parking_sessions
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS partner_id    UUID REFERENCES partners(id),
  ADD COLUMN IF NOT EXISTS commission_id UUID REFERENCES commission_transactions(id);

-- Overstay / Penalty columns
ALTER TABLE parking_sessions
  ADD COLUMN IF NOT EXISTS customer_phone         TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_mandate_id    TEXT,
  ADD COLUMN IF NOT EXISTS mandate_status         TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS expiry_time            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS overstay_start         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS overstay_minutes       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overstay_hours         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_amount         DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS penalty_deducted       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS penalty_payment_id     TEXT,
  ADD COLUMN IF NOT EXISTS penalty_deducted_at    TIMESTAMPTZ;

-- Push notification tracking columns
ALTER TABLE parking_sessions
  ADD COLUMN IF NOT EXISTS push_warning_count     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_push_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_warning_sent  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_receipt_sent  BOOLEAN DEFAULT false;

-- Duration tracking columns
ALTER TABLE parking_sessions
  ADD COLUMN IF NOT EXISTS duration_key           TEXT,
  ADD COLUMN IF NOT EXISTS custom_hours           INTEGER,
  ADD COLUMN IF NOT EXISTS expo_push_token        TEXT;


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Vehicle Types: Anyone can read
CREATE POLICY "vehicle_types_select" ON vehicle_types
  FOR SELECT USING (true);

-- Vehicle Types: Only authenticated users can update (admin will use service role key)
CREATE POLICY "vehicle_types_update" ON vehicle_types
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Parking Config: Anyone can read
CREATE POLICY "parking_config_select" ON parking_config
  FOR SELECT USING (true);

-- Parking Config: Only authenticated users can update
CREATE POLICY "parking_config_update" ON parking_config
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Parking Sessions: Anyone can read (for slot availability)
CREATE POLICY "parking_sessions_select" ON parking_sessions
  FOR SELECT USING (true);

-- Parking Sessions: Authenticated users can insert
CREATE POLICY "parking_sessions_insert" ON parking_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Parking Sessions: Authenticated users can update their own or any (for admin checkout)
CREATE POLICY "parking_sessions_update" ON parking_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- User Profiles: Users can read their own profile
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- User Profiles: Users can insert their own profile
CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Profiles: Users can update their own profile
CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- 🆕 PATCH V3 — RLS for new tables
-- ─────────────────────────────────────────

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_own_data" ON partners
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "partner_select_by_code" ON partners
  FOR SELECT USING (true);

ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_own_commissions" ON commission_transactions
  FOR ALL USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_own_payouts" ON payout_requests
  FOR ALL USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_insert_role" ON user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_token" ON user_push_tokens
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE penalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "penalty_select" ON penalty_transactions
  FOR SELECT USING (true);


-- ==========================================
-- 🆕 PATCH V3 — RPC Functions
-- ==========================================

CREATE OR REPLACE FUNCTION increment_partner_balance(p_partner_id UUID, p_amount DECIMAL)
RETURNS void AS $$
  UPDATE partners
  SET
    pending_balance = pending_balance + p_amount,
    total_earned    = total_earned + p_amount
  WHERE id = p_partner_id;
$$ LANGUAGE sql SECURITY DEFINER;


-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ticket ON parking_sessions(ticket_code);
CREATE INDEX IF NOT EXISTS idx_sessions_vehicle_type ON parking_sessions(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON parking_sessions(expiry_time);
CREATE INDEX IF NOT EXISTS idx_sessions_penalty ON parking_sessions(penalty_deducted);
CREATE INDEX IF NOT EXISTS idx_partners_referral ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_user ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_partner ON commission_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_penalty_session ON penalty_transactions(parking_session_id);

-- ==========================================
-- DONE! Your database is ready. 🎉
-- ==========================================
