-- ==========================================
-- 🅿️ DURVESH PARKING — Database Schema
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
  ('Rickshaw', '🛺', 2, 20.00);

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

INSERT INTO parking_config (lot_name) VALUES ('Durvesh Parking');

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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
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

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ticket ON parking_sessions(ticket_code);
CREATE INDEX IF NOT EXISTS idx_sessions_vehicle_type ON parking_sessions(vehicle_type_id);

-- ==========================================
-- DONE! Your database is ready. 🎉
-- ==========================================
