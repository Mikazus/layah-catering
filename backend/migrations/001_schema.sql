-- ============================================================================
-- Layah Catering — Neon PostgreSQL Database Schema (001_schema.sql)
-- Compatible with PostgreSQL 15+ / Neon Serverless Postgres
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects in dependency order for clean re-runs (optional in dev)
-- Uncomment if resetting database from scratch:
-- DROP TABLE IF EXISTS delivery_verifications, order_items, orders, menus, memberships, monthly_sales_snapshots, users CASCADE;

-- 1. USERS (Unified Auth across 4 Roles)
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(64) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    phone         VARCHAR(32) DEFAULT '',
    role          VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'kitchen', 'driver', 'management')),
    initials      VARCHAR(4) NOT NULL,
    title         VARCHAR(80) DEFAULT '',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. MENUS (Customer Catalog & Management Menu CRUD)
CREATE TABLE IF NOT EXISTS menus (
    id            VARCHAR(64) PRIMARY KEY,
    name          VARCHAR(140) NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    category      VARCHAR(40) NOT NULL CHECK (category IN ('Paket Nasi', 'Lauk Pilihan', 'Sayuran', 'Minuman')),
    price         BIGINT NOT NULL CHECK (price >= 0),
    image_url     TEXT DEFAULT '',
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    allergens     TEXT[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(category);
CREATE INDEX IF NOT EXISTS idx_menus_available ON menus(is_available);

-- 3. ORDERS (Customer Checkout -> Kitchen KDS -> Driver QR -> Management)
CREATE TABLE IF NOT EXISTS orders (
    id                  VARCHAR(32) PRIMARY KEY,              -- e.g. ORD-001
    order_code          VARCHAR(32) NOT NULL UNIQUE,          -- e.g. #ORD-001
    receipt_code        VARCHAR(32) NOT NULL UNIQUE,          -- e.g. KTG-0248
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name       VARCHAR(120) NOT NULL,
    customer_phone      VARCHAR(40) NOT NULL,
    delivery_address    TEXT NOT NULL,
    delivery_route      VARCHAR(100) NOT NULL DEFAULT 'Malang · Tidar Atas',
    scheduled_time      VARCHAR(16) NOT NULL DEFAULT '12:00',
    scheduled_label     VARCHAR(64) NOT NULL DEFAULT 'Today, 12:00 WIB',
    service_type        VARCHAR(80) NOT NULL DEFAULT 'Lunch service · Home delivery',
    status              VARCHAR(20) NOT NULL DEFAULT 'incoming'
                        CHECK (status IN ('incoming', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled')),
    total_amount        BIGINT NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    allergy_alert       TEXT DEFAULT '',
    allergy_instruction TEXT DEFAULT '',
    dispatched_at       TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_receipt_code ON orders(receipt_code);

-- 4. ORDER ITEMS (Line items with per-item allergen preferences)
CREATE TABLE IF NOT EXISTS order_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id       VARCHAR(64) REFERENCES menus(id) ON DELETE SET NULL,
    menu_name     VARCHAR(140) NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    category      VARCHAR(40) NOT NULL DEFAULT 'Main',
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    BIGINT NOT NULL CHECK (unit_price >= 0),
    allergen_note TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. DELIVERY VERIFICATIONS (Driver Dual-QR Audit Log)
CREATE TABLE IF NOT EXISTS delivery_verifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      VARCHAR(32) REFERENCES orders(id) ON DELETE SET NULL,
    driver_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    kitchen_qr    VARCHAR(128) NOT NULL,
    receipt_qr    VARCHAR(128) NOT NULL,
    matched       BOOLEAN NOT NULL,
    scanned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_verif_order_id ON delivery_verifications(order_id);

-- 6. MEMBERSHIPS (Management Data Membership)
CREATE TABLE IF NOT EXISTS memberships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    member_code         VARCHAR(32) NOT NULL UNIQUE,          -- e.g. LRS-001
    full_name           VARCHAR(120) NOT NULL,
    email               VARCHAR(160) NOT NULL UNIQUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    joined_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    total_transactions  BIGINT NOT NULL DEFAULT 0 CHECK (total_transactions >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- 7. MONTHLY SALES SNAPSHOTS (Management Laporan Penjualan & Monthly Trend)
CREATE TABLE IF NOT EXISTS monthly_sales_snapshots (
    id                SERIAL PRIMARY KEY,
    year              INT NOT NULL,
    month_num         INT NOT NULL CHECK (month_num BETWEEN 1 AND 12),
    month_short       VARCHAR(8) NOT NULL,                    -- Jan, Feb, ..., Okt
    period_label      VARCHAR(32) NOT NULL UNIQUE,            -- e.g. Oktober 2026
    period_range      VARCHAR(80) NOT NULL,                   -- e.g. 01–31 Oktober 2026 · Seluruh pesanan selesai
    total_orders      INT NOT NULL DEFAULT 0,
    total_revenue     BIGINT NOT NULL DEFAULT 0,
    active_customers  INT NOT NULL DEFAULT 0,
    highlight_note    TEXT NOT NULL DEFAULT '',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shared trigger to auto-maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_menus_updated_at ON menus;
CREATE TRIGGER trg_menus_updated_at BEFORE UPDATE ON menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_memberships_updated_at ON memberships;
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON memberships
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
