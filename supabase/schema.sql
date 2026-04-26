-- NeoGallery Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor', 'artist', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url TEXT
);

-- ============================================
-- ARTISTS
-- ============================================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  payout_account TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  UNIQUE(user_id)
);

-- ============================================
-- EXHIBITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  start_date DATE NOT NULL,
  end_date DATE,
  cover_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ARTWORKS
-- ============================================
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', '3d', 'audio')),
  file_url TEXT NOT NULL,
  thumb_url TEXT,
  price DECIMAL(10, 2),
  license_type TEXT CHECK (license_type IN ('personal', 'commercial')),
  polygon_count INTEGER,
  lod_levels INTEGER,
  description TEXT,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  position_z FLOAT NOT NULL DEFAULT 0
);

-- ============================================
-- TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('single', 'season')),
  price DECIMAL(10, 2) NOT NULL,
  max_qty INTEGER NOT NULL DEFAULT 1000,
  sold_qty INTEGER NOT NULL DEFAULT 0,
  perks_json JSONB
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'refunded', 'expired', 'canceled', 'failed')),
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ticket', 'merch', 'license', 'subscription')),
  ref_id UUID NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

-- ============================================
-- ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PAYMENTS AUDIT (for 54-FZ reporting)
-- ============================================
CREATE TABLE IF NOT EXISTS payments_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status_before TEXT,
  status_after TEXT,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_artworks_exhibition ON artworks(exhibition_id);
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_analytics_exhibition ON analytics(exhibition_id);
CREATE INDEX idx_analytics_session ON analytics(session_id);
CREATE INDEX idx_payments_audit_payment ON payments_audit(payment_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_audit ENABLE ROW LEVEL SECURITY;

-- Public read for exhibitions and artworks
CREATE POLICY "Exhibitions are publicly readable" ON exhibitions FOR SELECT USING (true);
CREATE POLICY "Artworks are publicly readable" ON artworks FOR SELECT USING (true);
CREATE POLICY "Tickets are publicly readable" ON tickets FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Artists can manage their own profile
CREATE POLICY "Artists can read own profile" ON artists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Artists can update own profile" ON artists FOR UPDATE USING (auth.uid() = user_id);

-- Orders: users see only their own
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (simplified for diploma)
CREATE POLICY "Admins can insert exhibitions" ON exhibitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update exhibitions" ON exhibitions FOR UPDATE USING (true);
CREATE POLICY "Admins can insert artworks" ON artworks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update artworks" ON artworks FOR UPDATE USING (true);

-- Analytics: insert only, no public read
CREATE POLICY "Analytics insert only" ON analytics FOR INSERT WITH CHECK (true);
