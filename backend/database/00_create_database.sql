-- =====================================================
-- GANACSADE E-Commerce Platform
-- Database Creation Script
-- PostgreSQL 14+
-- =====================================================

-- Drop database if exists (CAUTION: This will delete all data)
-- DROP DATABASE IF EXISTS ganacsade_db;

-- Create database
CREATE DATABASE ganacsade_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c ganacsade_db;

-- =====================================================
-- Install Required Extensions
-- =====================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search (for product search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Case-insensitive text (for emails, etc.)
CREATE EXTENSION IF NOT EXISTS "citext";

-- =====================================================
-- Create Custom Types (Enums)
-- =====================================================

-- User related enums
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'delivery_person');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'not_specified');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE language_code AS ENUM ('en', 'so', 'ar');

-- Product related enums
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'draft', 'archived');

-- Order related enums
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);

CREATE TYPE payment_method_type AS ENUM (
    'waafi_pay',
    'edahab',
    'premier_wallet',
    'cash_on_delivery',
    'credit_card',
    'debit_card'
);

-- Address related enums
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');

-- Transaction related enums
CREATE TYPE transaction_type AS ENUM (
    'order_payment',
    'refund',
    'wallet_topup',
    'wallet_withdrawal'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);

-- Advertisement related enums
CREATE TYPE advertisement_placement AS ENUM (
    'home_slider',
    'home_banner',
    'category_page',
    'product_page',
    'checkout'
);

-- Flash sale related enums
CREATE TYPE flash_sale_status AS ENUM ('scheduled', 'active', 'expired');

-- Delivery related enums
CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'car', 'bicycle', 'on_foot');

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database "ganacsade_db" created successfully!';
    RAISE NOTICE '✅ Extensions installed: uuid-ossp, pg_trgm, citext';
    RAISE NOTICE '✅ Custom types created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 01_core_tables.sql';
END $$;
