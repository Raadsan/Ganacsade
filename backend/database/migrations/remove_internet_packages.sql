-- =====================================================
-- Migration: Remove Internet Packages Feature
-- Run this script on your existing database to remove
-- the internet_providers and internet_packages tables
-- =====================================================

-- Connect to the database
\c ganacsade_db;

-- =====================================================
-- Step 1: Drop Triggers (if they exist)
-- =====================================================

DROP TRIGGER IF EXISTS update_internet_packages_updated_at ON internet_packages;
DROP TRIGGER IF EXISTS update_internet_providers_updated_at ON internet_providers;

-- =====================================================
-- Step 2: Drop Indexes (if they exist)
-- =====================================================

DROP INDEX IF EXISTS idx_internet_packages_provider_id;
DROP INDEX IF EXISTS idx_internet_packages_status;
DROP INDEX IF EXISTS idx_internet_packages_api_package_id;
DROP INDEX IF EXISTS idx_internet_providers_is_active;

-- =====================================================
-- Step 3: Drop Tables (cascade will remove FK constraints)
-- =====================================================

DROP TABLE IF EXISTS internet_packages CASCADE;
DROP TABLE IF EXISTS internet_providers CASCADE;

-- =====================================================
-- Step 4: Remove "Internet Services" category (optional)
-- Uncomment if you want to remove this category
-- =====================================================

-- DELETE FROM categories WHERE name_en = 'Internet Services';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Internet Packages feature removed successfully!';
    RAISE NOTICE '   - Dropped table: internet_packages';
    RAISE NOTICE '   - Dropped table: internet_providers';
    RAISE NOTICE '   - Removed related indexes and triggers';
END $$;
