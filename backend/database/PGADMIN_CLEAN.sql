-- =====================================================
-- GANACSADE E-Commerce Platform
-- pgAdmin Compatible Version
-- PostgreSQL 14+
-- =====================================================
--
-- INSTRUCTIONS FOR pgAdmin:
-- 1. Create database 'ganacsade_db' manually first:
--    Right-click Databases → Create → Database
--    Name: ganacsade_db, Owner: postgres, Encoding: UTF8
--
-- 2. Connect to the database:
--    Right-click ganacsade_db → Query Tool
--
-- 3. Load this file and execute (F5)
--
-- =====================================================




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
    RAISE NOTICE 'âœ… Database "ganacsade_db" created successfully!';
    RAISE NOTICE 'âœ… Extensions installed: uuid-ossp, pg_trgm, citext';
    RAISE NOTICE 'âœ… Custom types created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 01_core_tables.sql';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Core Tables Creation Script
-- Tables: users, products, categories, orders, cart
-- =====================================================


-- =====================================================
-- TABLE: users
-- Stores all user types (customers, admins, delivery persons)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- User role
    role user_role NOT NULL DEFAULT 'customer',
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    profile_image_url TEXT,
    gender user_gender DEFAULT 'not_specified',
    date_of_birth DATE,
    
    -- Preferences
    preferred_language language_code DEFAULT 'en',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Verification status
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    phone_verification_code VARCHAR(10),
    
    -- Account status
    status user_status DEFAULT 'active',
    
    -- User preferences (JSON)
    preferences JSONB DEFAULT '{
        "pushNotifications": true,
        "emailNotifications": true,
        "smsNotifications": true,
        "marketingEmails": false,
        "darkMode": false,
        "biometricAuth": false,
        "themeMode": "light"
    }'::jsonb,
    
    -- Password reset
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    
    -- Timestamps
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

COMMENT ON TABLE users IS 'All user accounts (customers, admins, delivery persons)';
COMMENT ON COLUMN users.role IS 'User role: customer, admin, or delivery_person';
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSON';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';

-- =====================================================
-- TABLE: categories
-- Main product categories with multi-language support
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-language names
    name_en VARCHAR(100) NOT NULL,
    name_so VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    
    -- Multi-language descriptions
    description_en TEXT,
    description_so TEXT,
    description_ar TEXT,
    
    -- Category metadata
    icon_path VARCHAR(255),
    color VARCHAR(7), -- Hex color code
    image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Product count (denormalized for performance)
    product_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'Main product categories with multi-language support';
COMMENT ON COLUMN categories.color IS 'Hex color code for category (e.g., #2E7D32)';
COMMENT ON COLUMN categories.product_count IS 'Denormalized count for performance';

-- =====================================================
-- TABLE: subcategories
-- Category subdivisions
-- =====================================================

CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL,
    
    -- Multi-language names
    name_en VARCHAR(100) NOT NULL,
    name_so VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    
    -- Multi-language descriptions
    description_en TEXT,
    description_so TEXT,
    description_ar TEXT,
    
    -- Metadata
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Product count
    product_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE subcategories IS 'Category subdivisions';

-- =====================================================
-- TABLE: brands
-- Product brands
-- =====================================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Product count
    product_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE brands IS 'Product brands';

-- =====================================================
-- TABLE: products
-- Main product catalog with multi-language support
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-language names
    name_en VARCHAR(255) NOT NULL,
    name_so VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    
    -- Multi-language descriptions
    description_en TEXT,
    description_so TEXT,
    description_ar TEXT,
    
    -- Categorization
    category_id UUID NOT NULL,
    subcategory_id UUID,
    brand_id UUID,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) CHECK (discount_price IS NULL OR discount_price < price),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    in_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity > 0) STORED,
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- Product identifiers
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    
    -- Product attributes
    tags TEXT[], -- Array of tags
    
    -- Ratings
    rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Status and flags
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_halal BOOLEAN DEFAULT FALSE,
    
    -- Metadata (JSON for flexible attributes)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

COMMENT ON TABLE products IS 'Product catalog with multi-language support';
COMMENT ON COLUMN products.in_stock IS 'Auto-calculated based on stock_quantity';
COMMENT ON COLUMN products.metadata IS 'Flexible JSON field for additional attributes';
COMMENT ON COLUMN products.tags IS 'Array of product tags for search/filtering';

-- =====================================================
-- TABLE: product_variants
-- Product variations (size, color, etc.)
-- =====================================================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    
    -- Multi-language variant names
    name_en VARCHAR(100) NOT NULL,
    name_so VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    
    -- Pricing (can override product price)
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) CHECK (discount_price IS NULL OR discount_price < price),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    in_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity > 0) STORED,
    
    -- Variant identifiers
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    
    -- Variant attributes (e.g., {"color": "Red", "size": "L"})
    attributes JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_variants IS 'Product variations (size, color, etc.)';
COMMENT ON COLUMN product_variants.attributes IS 'JSON object with variant attributes';

-- =====================================================
-- TABLE: product_images
-- Product image URLs
-- =====================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_images IS 'Product images with display order';
COMMENT ON COLUMN product_images.is_primary IS 'Primary image shown in listings';

-- =====================================================
-- TABLE: orders
-- Customer orders
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Status
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    
    -- Shipping information (stored as JSON from addresses table)
    shipping_address JSONB NOT NULL,
    
    -- Payment information (stored as JSON)
    payment_method JSONB NOT NULL,
    
    -- Delivery information
    delivery_person_id UUID,
    delivery_person_name VARCHAR(200),
    delivery_assigned_at TIMESTAMP,
    delivery_picked_up_at TIMESTAMP,
    delivery_delivered_at TIMESTAMP,
    
    -- Tracking
    tracking_number VARCHAR(100),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    
    -- Notes
    notes TEXT,
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Coupon
    coupon_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON COLUMN orders.shipping_address IS 'Snapshot of shipping address as JSON';
COMMENT ON COLUMN orders.payment_method IS 'Snapshot of payment method as JSON';

-- =====================================================
-- TABLE: order_items
-- Products in each order
-- =====================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    
    -- Product snapshot (at time of order)
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    
    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total DECIMAL(10, 2) NOT NULL,
    
    -- Variant info (if applicable)
    variant_name VARCHAR(100),
    variant_attributes JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_items IS 'Products in each order with snapshot data';

-- =====================================================
-- TABLE: order_status_history
-- Order status change tracking
-- =====================================================

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    status order_status NOT NULL,
    notes TEXT,
    updated_by UUID, -- User ID who made the change
    updated_by_name VARCHAR(200),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';

-- =====================================================
-- TABLE: cart
-- Shopping cart (one per user)
-- =====================================================

CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Pricing calculations
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    shipping DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    
    -- Coupon
    coupon_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cart IS 'Shopping cart (one per user)';

-- =====================================================
-- TABLE: cart_items
-- Items in shopping cart
-- =====================================================

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one product/variant per cart
    UNIQUE(cart_id, product_id, variant_id)
);

COMMENT ON TABLE cart_items IS 'Items in shopping cart';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'âœ… Core tables created successfully!';
    RAISE NOTICE '   - users';
    RAISE NOTICE '   - categories, subcategories';
    RAISE NOTICE '   - brands';
    RAISE NOTICE '   - products, product_variants, product_images';
    RAISE NOTICE '   - orders, order_items, order_status_history';
    RAISE NOTICE '   - cart, cart_items';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 02_supporting_tables.sql';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Supporting Tables Creation Script
-- Tables: addresses, payment_methods, transactions
-- =====================================================


-- =====================================================
-- TABLE: addresses
-- User shipping/billing addresses
-- =====================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Address label
    label VARCHAR(100) NOT NULL, -- e.g., "Home", "Office"
    
    -- Contact information
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    
    -- Address details
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Somalia',
    postal_code VARCHAR(20),
    
    -- Address type
    type address_type DEFAULT 'home',
    
    -- Default address flag
    is_default BOOLEAN DEFAULT FALSE,
    
    -- GPS coordinates (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE addresses IS 'User shipping and billing addresses';
COMMENT ON COLUMN addresses.is_default IS 'Default shipping address for user';

-- =====================================================
-- TABLE: payment_methods
-- User saved payment methods
-- =====================================================

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Payment method type
    type payment_method_type NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Payment details (encrypted/tokenized)
    -- Store minimal info, use payment gateway tokens
    details JSONB DEFAULT '{}'::jsonb,
    
    -- For card payments (last 4 digits only)
    last_four VARCHAR(4),
    card_brand VARCHAR(50), -- Visa, Mastercard, etc.
    expiry_month INTEGER,
    expiry_year INTEGER,
    
    -- For mobile money (phone number)
    phone_number VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payment_methods IS 'User saved payment methods';
COMMENT ON COLUMN payment_methods.details IS 'Encrypted payment details (tokens, etc.)';
COMMENT ON COLUMN payment_methods.last_four IS 'Last 4 digits of card (for display only)';

-- =====================================================
-- TABLE: transactions
-- Payment transaction records
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- External transaction ID
    
    -- Transaction details
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment method
    payment_method payment_method_type NOT NULL,
    
    -- User information
    user_id UUID NOT NULL,
    user_name VARCHAR(200),
    user_email VARCHAR(255),
    
    -- Related order (if applicable)
    order_id UUID,
    
    -- Description
    description TEXT,
    
    -- Payment gateway response
    gateway_response JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Failure information
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP
);

COMMENT ON TABLE transactions IS 'Payment transaction records';
COMMENT ON COLUMN transactions.transaction_id IS 'External payment gateway transaction ID';
COMMENT ON COLUMN transactions.gateway_response IS 'Raw response from payment gateway';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'âœ… Supporting tables created successfully!';
    RAISE NOTICE '   - addresses';
    RAISE NOTICE '   - payment_methods';
    RAISE NOTICE '   - transactions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 03_feature_tables.sql';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Feature Tables Creation Script
-- Tables: flash_sales, advertisements, delivery, etc.
-- =====================================================


-- =====================================================
-- TABLE: flash_sales
-- Flash sale events
-- =====================================================

CREATE TABLE flash_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Sale information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    
    -- Status
    status flash_sale_status DEFAULT 'scheduled',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (end_time > start_time)
);

COMMENT ON TABLE flash_sales IS 'Flash sale events with time-based activation';

-- =====================================================
-- TABLE: flash_sale_products
-- Products in flash sales
-- =====================================================

CREATE TABLE flash_sale_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flash_sale_id UUID NOT NULL,
    product_id UUID NOT NULL,
    
    -- Product snapshot
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    
    -- Pricing
    original_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    discount_percentage INTEGER GENERATED ALWAYS AS (
        ROUND(((original_price - sale_price) / original_price * 100)::numeric, 0)::integer
    ) STORED,
    
    -- Stock limits
    stock_limit INTEGER NOT NULL CHECK (stock_limit > 0),
    sold_count INTEGER DEFAULT 0 CHECK (sold_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(flash_sale_id, product_id),
    
    -- Constraints
    CHECK (sale_price < original_price),
    CHECK (sold_count <= stock_limit)
);

COMMENT ON TABLE flash_sale_products IS 'Products included in flash sales';
COMMENT ON COLUMN flash_sale_products.discount_percentage IS 'Auto-calculated discount percentage';

-- =====================================================
-- TABLE: featured_products
-- Homepage featured products
-- =====================================================

CREATE TABLE featured_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE,
    
    -- Display order (for drag-and-drop)
    display_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE featured_products IS 'Products featured on homepage';

-- =====================================================
-- TABLE: advertisements
-- Marketing banners and ads
-- =====================================================

CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ad content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    target_url TEXT, -- Where the ad links to
    
    -- Placement
    placement advertisement_placement NOT NULL,
    display_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Scheduling
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (end_date IS NULL OR end_date > start_date)
);

COMMENT ON TABLE advertisements IS 'Marketing banners with placement and analytics';
COMMENT ON COLUMN advertisements.placement IS 'Where the ad appears: home_slider, home_banner, etc.';

-- =====================================================
-- TABLE: delivery_persons
-- Delivery personnel management
-- =====================================================

CREATE TABLE delivery_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal information
    name VARCHAR(200) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Vehicle information
    vehicle_type vehicle_type,
    vehicle_number VARCHAR(50),
    license_number VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    current_assignments INTEGER DEFAULT 0 CHECK (current_assignments >= 0),
    total_deliveries INTEGER DEFAULT 0 CHECK (total_deliveries >= 0),
    rating DECIMAL(2, 1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE delivery_persons IS 'Delivery personnel with credentials and stats';
COMMENT ON COLUMN delivery_persons.is_available IS 'Currently available for assignments';
COMMENT ON COLUMN delivery_persons.current_assignments IS 'Number of active deliveries';

-- =====================================================
-- TABLE: settings
-- System configuration and settings
-- =====================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting key (unique identifier)
    key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Setting value (JSON for flexibility)
    value JSONB NOT NULL,
    
    -- Metadata
    category VARCHAR(50), -- e.g., 'general', 'payment', 'shipping', 'email'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE settings IS 'System configuration and settings';
COMMENT ON COLUMN settings.is_public IS 'Whether setting can be accessed by frontend';

-- Example settings structure:
COMMENT ON TABLE settings IS 'Example settings:
- app_name: {"value": "GANACSADE"}
- app_logo: {"url": "https://..."}
- tax_rate: {"percentage": 5}
- shipping_flat_rate: {"amount": 5.00}
- payment_gateways: {"waafipay": {...}, "edahab": {...}}
- email_templates: {"order_confirmation": {...}}
';

-- =====================================================
-- TABLE: activity_logs
-- Audit trail for admin actions
-- =====================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User who performed the action
    user_id UUID NOT NULL,
    user_name VARCHAR(200),
    user_role user_role,
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- e.g., 'create_product', 'update_order'
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'product', 'order', 'user'
    entity_id UUID,
    
    -- Description
    description TEXT,
    
    -- Changes (before/after)
    changes JSONB,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE activity_logs IS 'Audit trail for admin and system actions';
COMMENT ON COLUMN activity_logs.changes IS 'JSON object with before/after values';

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'âœ… Feature tables created successfully!';
    RAISE NOTICE '   - flash_sales, flash_sale_products';
    RAISE NOTICE '   - featured_products';
    RAISE NOTICE '   - advertisements';
    RAISE NOTICE '   - delivery_persons';
    RAISE NOTICE '   - settings';
    RAISE NOTICE '   - activity_logs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 04_indexes.sql';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Database Indexes for Performance Optimization
-- =====================================================


-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- PRODUCTS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search indexes for product search
CREATE INDEX idx_products_name_en_trgm ON products USING gin(name_en gin_trgm_ops);
CREATE INDEX idx_products_name_so_trgm ON products USING gin(name_so gin_trgm_ops);
CREATE INDEX idx_products_name_ar_trgm ON products USING gin(name_ar gin_trgm_ops);
CREATE INDEX idx_products_tags ON products USING gin(tags);

-- Composite index for common queries
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_products_status_featured ON products(status, is_featured);

-- =====================================================
-- PRODUCT VARIANTS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- =====================================================
-- PRODUCT IMAGES TABLE INDEXES
-- =====================================================

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;

-- =====================================================
-- CATEGORIES TABLE INDEXES
-- =====================================================

CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Full-text search for categories
CREATE INDEX idx_categories_name_en_trgm ON categories USING gin(name_en gin_trgm_ops);
CREATE INDEX idx_categories_name_so_trgm ON categories USING gin(name_so gin_trgm_ops);
CREATE INDEX idx_categories_name_ar_trgm ON categories USING gin(name_ar gin_trgm_ops);

-- =====================================================
-- SUBCATEGORIES TABLE INDEXES
-- =====================================================

CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_is_active ON subcategories(is_active);
CREATE INDEX idx_subcategories_display_order ON subcategories(display_order);

-- =====================================================
-- BRANDS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- =====================================================
-- ORDERS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_person_id ON orders(delivery_person_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);

-- Composite indexes for common queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_person_id, status);

-- =====================================================
-- ORDER ITEMS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- =====================================================
-- ORDER STATUS HISTORY TABLE INDEXES
-- =====================================================

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- =====================================================
-- CART TABLE INDEXES
-- =====================================================

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_updated_at ON cart(updated_at DESC);

-- =====================================================
-- CART ITEMS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_variant_id ON cart_items(variant_id);

-- =====================================================
-- ADDRESSES TABLE INDEXES
-- =====================================================

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_addresses_type ON addresses(type);

-- =====================================================
-- PAYMENT METHODS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_payment_methods_type ON payment_methods(type);

-- =====================================================
-- TRANSACTIONS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Composite indexes
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_type_status ON transactions(type, status);

-- =====================================================
-- FLASH SALES TABLE INDEXES
-- =====================================================

CREATE INDEX idx_flash_sales_status ON flash_sales(status);
CREATE INDEX idx_flash_sales_is_active ON flash_sales(is_active);
CREATE INDEX idx_flash_sales_start_time ON flash_sales(start_time);
CREATE INDEX idx_flash_sales_end_time ON flash_sales(end_time);

-- Index for finding active sales
CREATE INDEX idx_flash_sales_active ON flash_sales(start_time, end_time, is_active) 
    WHERE is_active = TRUE;

-- =====================================================
-- FLASH SALE PRODUCTS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_flash_sale_products_flash_sale_id ON flash_sale_products(flash_sale_id);
CREATE INDEX idx_flash_sale_products_product_id ON flash_sale_products(product_id);

-- =====================================================
-- FEATURED PRODUCTS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX idx_featured_products_is_active ON featured_products(is_active);
CREATE INDEX idx_featured_products_display_order ON featured_products(display_order);

-- =====================================================
-- ADVERTISEMENTS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_advertisements_placement ON advertisements(placement);
CREATE INDEX idx_advertisements_is_active ON advertisements(is_active);
CREATE INDEX idx_advertisements_display_order ON advertisements(display_order);
CREATE INDEX idx_advertisements_start_date ON advertisements(start_date);
CREATE INDEX idx_advertisements_end_date ON advertisements(end_date);

-- Index for finding active ads by placement
CREATE INDEX idx_advertisements_active_placement ON advertisements(placement, is_active, display_order)
    WHERE is_active = TRUE;

-- =====================================================
-- DELIVERY PERSONS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_delivery_persons_email ON delivery_persons(email);
CREATE INDEX idx_delivery_persons_phone ON delivery_persons(phone);
CREATE INDEX idx_delivery_persons_is_active ON delivery_persons(is_active);
CREATE INDEX idx_delivery_persons_is_available ON delivery_persons(is_available);

-- Index for finding available delivery persons
CREATE INDEX idx_delivery_persons_available ON delivery_persons(is_active, is_available)
    WHERE is_active = TRUE AND is_available = TRUE;

-- =====================================================
-- SETTINGS TABLE INDEXES
-- =====================================================

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_is_public ON settings(is_public) WHERE is_public = TRUE;

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'âœ… Database indexes created successfully!';
    RAISE NOTICE '   - User indexes (email, phone, role, status)';
    RAISE NOTICE '   - Product indexes (category, brand, SKU, full-text search)';
    RAISE NOTICE '   - Order indexes (user, status, tracking)';
    RAISE NOTICE '   - Cart and payment indexes';
    RAISE NOTICE '   - Feature table indexes (flash sales, ads, delivery)';
    RAISE NOTICE '   - Performance optimized for common queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 05_constraints.sql';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Foreign Key Constraints and Relationships
-- =====================================================


-- =====================================================
-- SUBCATEGORIES CONSTRAINTS
-- =====================================================

ALTER TABLE subcategories
    ADD CONSTRAINT fk_subcategories_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE CASCADE;

-- =====================================================
-- PRODUCTS CONSTRAINTS
-- =====================================================

ALTER TABLE products
    ADD CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT;

ALTER TABLE products
    ADD CONSTRAINT fk_products_subcategory
    FOREIGN KEY (subcategory_id)
    REFERENCES subcategories(id)
    ON DELETE SET NULL;

ALTER TABLE products
    ADD CONSTRAINT fk_products_brand
    FOREIGN KEY (brand_id)
    REFERENCES brands(id)
    ON DELETE SET NULL;

-- =====================================================
-- PRODUCT VARIANTS CONSTRAINTS
-- =====================================================

ALTER TABLE product_variants
    ADD CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- =====================================================
-- PRODUCT IMAGES CONSTRAINTS
-- =====================================================

ALTER TABLE product_images
    ADD CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- =====================================================
-- ORDERS CONSTRAINTS
-- =====================================================

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_delivery_person
    FOREIGN KEY (delivery_person_id)
    REFERENCES delivery_persons(id)
    ON DELETE SET NULL;

-- =====================================================
-- ORDER ITEMS CONSTRAINTS
-- =====================================================

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE;

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT;

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_variant
    FOREIGN KEY (variant_id)
    REFERENCES product_variants(id)
    ON DELETE SET NULL;

-- =====================================================
-- ORDER STATUS HISTORY CONSTRAINTS
-- =====================================================

ALTER TABLE order_status_history
    ADD CONSTRAINT fk_order_status_history_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE;

ALTER TABLE order_status_history
    ADD CONSTRAINT fk_order_status_history_user
    FOREIGN KEY (updated_by)
    REFERENCES users(id)
    ON DELETE SET NULL;

-- =====================================================
-- CART CONSTRAINTS
-- =====================================================

ALTER TABLE cart
    ADD CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- =====================================================
-- CART ITEMS CONSTRAINTS
-- =====================================================

ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES cart(id)
    ON DELETE CASCADE;

ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_variant
    FOREIGN KEY (variant_id)
    REFERENCES product_variants(id)
    ON DELETE CASCADE;

-- =====================================================
-- ADDRESSES CONSTRAINTS
-- =====================================================

ALTER TABLE addresses
    ADD CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- =====================================================
-- PAYMENT METHODS CONSTRAINTS
-- =====================================================

ALTER TABLE payment_methods
    ADD CONSTRAINT fk_payment_methods_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- =====================================================
-- TRANSACTIONS CONSTRAINTS
-- =====================================================

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE SET NULL;

-- =====================================================
-- FLASH SALE PRODUCTS CONSTRAINTS
-- =====================================================

ALTER TABLE flash_sale_products
    ADD CONSTRAINT fk_flash_sale_products_flash_sale
    FOREIGN KEY (flash_sale_id)
    REFERENCES flash_sales(id)
    ON DELETE CASCADE;

ALTER TABLE flash_sale_products
    ADD CONSTRAINT fk_flash_sale_products_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- =====================================================
-- FEATURED PRODUCTS CONSTRAINTS
-- =====================================================

ALTER TABLE featured_products
    ADD CONSTRAINT fk_featured_products_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- =====================================================
-- ACTIVITY LOGS CONSTRAINTS
-- =====================================================

ALTER TABLE activity_logs
    ADD CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMP
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at BEFORE UPDATE ON flash_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_products_updated_at BEFORE UPDATE ON featured_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_persons_updated_at BEFORE UPDATE ON delivery_persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS FOR PRODUCT COUNT DENORMALIZATION
-- =====================================================

-- Function to update category product count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
        IF NEW.subcategory_id IS NOT NULL THEN
            UPDATE subcategories SET product_count = product_count + 1 WHERE id = NEW.subcategory_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.category_id != NEW.category_id THEN
            UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
            UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
        END IF;
        IF OLD.subcategory_id IS DISTINCT FROM NEW.subcategory_id THEN
            IF OLD.subcategory_id IS NOT NULL THEN
                UPDATE subcategories SET product_count = product_count - 1 WHERE id = OLD.subcategory_id;
            END IF;
            IF NEW.subcategory_id IS NOT NULL THEN
                UPDATE subcategories SET product_count = product_count + 1 WHERE id = NEW.subcategory_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
        IF OLD.subcategory_id IS NOT NULL THEN
            UPDATE subcategories SET product_count = product_count - 1 WHERE id = OLD.subcategory_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_product_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- Function to update brand product count
CREATE OR REPLACE FUNCTION update_brand_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.brand_id IS NOT NULL THEN
        UPDATE brands SET product_count = product_count + 1 WHERE id = NEW.brand_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.brand_id IS DISTINCT FROM NEW.brand_id THEN
            IF OLD.brand_id IS NOT NULL THEN
                UPDATE brands SET product_count = product_count - 1 WHERE id = OLD.brand_id;
            END IF;
            IF NEW.brand_id IS NOT NULL THEN
                UPDATE brands SET product_count = product_count + 1 WHERE id = NEW.brand_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.brand_id IS NOT NULL THEN
        UPDATE brands SET product_count = product_count - 1 WHERE id = OLD.brand_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brand_product_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_brand_product_count();

-- =====================================================
-- TRIGGERS FOR ORDER STATUS HISTORY
-- =====================================================

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
        VALUES (NEW.id, NEW.status, 'Order created', 'System');
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
        VALUES (NEW.id, NEW.status, 'Status updated', 'System');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_change_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- TRIGGERS FOR CART CALCULATIONS
-- =====================================================

-- Function to update cart totals
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
DECLARE
    cart_subtotal DECIMAL(10, 2);
BEGIN
    -- Calculate subtotal from cart items
    SELECT COALESCE(SUM((unit_price - discount_amount) * quantity), 0)
    INTO cart_subtotal
    FROM cart_items
    WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    -- Update cart totals
    UPDATE cart
    SET subtotal = cart_subtotal,
        total = cart_subtotal + tax + shipping - discount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_cart_totals();

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'âœ… Foreign key constraints created successfully!';
    RAISE NOTICE 'âœ… Triggers created:';
    RAISE NOTICE '   - Auto-update updated_at timestamps';
    RAISE NOTICE '   - Auto-update product counts (categories, brands)';
    RAISE NOTICE '   - Auto-log order status changes';
    RAISE NOTICE '   - Auto-calculate cart totals';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 06_seed_data.sql (optional)';
END $$;
-- =====================================================
-- GANACSADE E-Commerce Platform
-- Seed Data for Initial Setup
-- =====================================================


-- =====================================================
-- SEED ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- =====================================================

INSERT INTO users (
    email, phone_number, password_hash, role,
    first_name, last_name, display_name,
    status, is_email_verified, is_phone_verified
) VALUES (
    'admin@ganacsade.com',
    '+252612345678',
    '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x', -- admin123
    'admin',
    'Admin',
    'User',
    'GANACSADE Admin',
    'active',
    TRUE,
    TRUE
);

-- =====================================================
-- SEED CATEGORIES (8 Main Categories)
-- =====================================================

INSERT INTO categories (name_en, name_so, name_ar, description_en, description_so, description_ar, icon_path, color, is_active, display_order) VALUES
('Internet Services', 'Adeegyada Internetka', 'Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª', 'Mobile data packages and internet services', 'Xirmooyinka xogta gacanta iyo adeegyada internetka', 'Ø¨Ø§Ù‚Ø§Øª Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø­Ù…ÙˆÙ„ ÙˆØ®Ø¯Ù…Ø§Øª Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª', 'wifi', '#3F51B5', TRUE, 1),
('Gifts Market', 'Suuqa Hadiyadaha', 'Ø³ÙˆÙ‚ Ø§Ù„Ù‡Ø¯Ø§ÙŠØ§', 'Perfect gifts for every occasion', 'Hadiyadaha ku habboon xaalad kasta', 'Ù‡Ø¯Ø§ÙŠØ§ Ù…Ø«Ø§Ù„ÙŠØ© Ù„ÙƒÙ„ Ù…Ù†Ø§Ø³Ø¨Ø©', 'gift', '#E91E63', TRUE, 2),
('Electronics', 'Elektaroonigada', 'Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª', 'Latest electronics and gadgets', 'Elektaroonigada iyo qalabka ugu dambeeyay', 'Ø£Ø­Ø¯Ø« Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø©', 'smartphone', '#2196F3', TRUE, 3),
('Men''s Market', 'Suuqa Ragga', 'Ø³ÙˆÙ‚ Ø§Ù„Ø±Ø¬Ø§Ù„', 'Fashion and accessories for men', 'Moodada iyo agabka ragga', 'Ø§Ù„Ø£Ø²ÙŠØ§Ø¡ ÙˆØ§Ù„Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª Ù„Ù„Ø±Ø¬Ø§Ù„', 'user', '#795548', TRUE, 4),
('Women''s Market', 'Suuqa Haweenka', 'Ø³ÙˆÙ‚ Ø§Ù„Ù†Ø³Ø§Ø¡', 'Fashion and accessories for women', 'Moodada iyo agabka haweenka', 'Ø§Ù„Ø£Ø²ÙŠØ§Ø¡ ÙˆØ§Ù„Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª Ù„Ù„Ù†Ø³Ø§Ø¡', 'user', '#9C27B0', TRUE, 5),
('Kids Market', 'Suuqa Carruurta', 'Ø³ÙˆÙ‚ Ø§Ù„Ø£Ø·ÙØ§Ù„', 'Everything for children', 'Wax walba oo carruurta ah', 'ÙƒÙ„ Ø´ÙŠØ¡ Ù„Ù„Ø£Ø·ÙØ§Ù„', 'baby', '#FF9800', TRUE, 6),
('Cosmetics', 'Quruxda', 'Ù…Ø³ØªØ­Ø¶Ø±Ø§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„', 'Beauty and personal care products', 'Alaabta quruxda iyo daryeelka shaqsiga', 'Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ØªØ¬Ù…ÙŠÙ„ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø´Ø®ØµÙŠØ©', 'sparkles', '#E91E63', TRUE, 7),
('General Goods', 'Alaabta Guud', 'Ø§Ù„Ø³Ù„Ø¹ Ø§Ù„Ø¹Ø§Ù…Ø©', 'Everyday essentials and more', 'Waxyaabaha lagama maarmaanka ah ee maalinlaha ah iyo wax ka badan', 'Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙˆØ§Ù„Ù…Ø²ÙŠØ¯', 'shopping-bag', '#4CAF50', TRUE, 8);

-- =====================================================
-- SEED BRANDS
-- =====================================================

INSERT INTO brands (name, description, is_active) VALUES
('Samsung', 'Leading electronics manufacturer', TRUE),
('Apple', 'Premium technology products', TRUE),
('Nike', 'Sports apparel and footwear', TRUE),
('Adidas', 'Athletic wear and accessories', TRUE),
('Generic', 'Various unbranded products', TRUE);

-- =====================================================
-- SEED DELIVERY PERSONS
-- Password: delivery123 (hashed with bcrypt)
-- =====================================================

INSERT INTO delivery_persons (
    name, email, phone, password_hash,
    vehicle_type, vehicle_number, license_number,
    is_active, is_available, rating
) VALUES
('Ahmed Mohamed', 'ahmed.delivery@ganacsade.com', '+252612345671', '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x', 'motorcycle', 'MG-1234', 'DL-001', TRUE, TRUE, 4.8),
('Fatima Hassan', 'fatima.delivery@ganacsade.com', '+252612345672', '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x', 'car', 'MG-5678', 'DL-002', TRUE, TRUE, 4.9),
('Omar Ali', 'omar.delivery@ganacsade.com', '+252612345673', '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x', 'motorcycle', 'MG-9012', 'DL-003', TRUE, FALSE, 4.7);

-- =====================================================
-- SEED SYSTEM SETTINGS
-- =====================================================

INSERT INTO settings (key, value, category, description, is_public) VALUES
('app_name', '{"value": "GANACSADE"}', 'general', 'Application name', TRUE),
('app_logo', '{"url": "/logo.png"}', 'general', 'Application logo URL', TRUE),
('default_currency', '{"code": "USD", "symbol": "$"}', 'general', 'Default currency', TRUE),
('tax_rate', '{"percentage": 5}', 'pricing', 'Tax rate percentage', FALSE),
('shipping_flat_rate', '{"amount": 5.00}', 'shipping', 'Flat shipping rate', FALSE),
('low_stock_threshold', '{"quantity": 10}', 'inventory', 'Low stock alert threshold', FALSE),
('order_number_prefix', '{"prefix": "ORD-"}', 'orders', 'Order number prefix', FALSE),
('enable_cash_on_delivery', '{"enabled": true}', 'payment', 'Enable cash on delivery', FALSE),
('enable_waafipay', '{"enabled": true, "api_key": ""}', 'payment', 'Enable WaafiPay', FALSE),
('enable_edahab', '{"enabled": true, "api_key": ""}', 'payment', 'Enable E-dahab', FALSE),
('enable_premier_wallet', '{"enabled": true, "api_key": ""}', 'payment', 'Enable Premier Wallet', FALSE),
('supported_languages', '{"languages": ["en", "so", "ar"]}', 'general', 'Supported languages', TRUE),
('default_language', '{"code": "en"}', 'general', 'Default language', TRUE),
('email_from_address', '{"email": "noreply@ganacsade.com"}', 'email', 'Email from address', FALSE),
('email_from_name', '{"name": "GANACSADE"}', 'email', 'Email from name', FALSE),
('enable_email_notifications', '{"enabled": true}', 'notifications', 'Enable email notifications', FALSE),
('enable_sms_notifications', '{"enabled": true}', 'notifications', 'Enable SMS notifications', FALSE),
('enable_push_notifications', '{"enabled": true}', 'notifications', 'Enable push notifications', FALSE);

-- =====================================================
-- Success Message & Statistics
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    category_count INTEGER;
    brand_count INTEGER;
    delivery_count INTEGER;
    setting_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO brand_count FROM brands;
    SELECT COUNT(*) INTO delivery_count FROM delivery_persons;
    SELECT COUNT(*) INTO setting_count FROM settings;
    
    RAISE NOTICE 'âœ… Seed data inserted successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'ðŸ“Š Database Statistics:';
    RAISE NOTICE '   - Users: %', user_count;
    RAISE NOTICE '   - Categories: %', category_count;
    RAISE NOTICE '   - Brands: %', brand_count;
    RAISE NOTICE '   - Delivery Persons: %', delivery_count;
    RAISE NOTICE '   - Settings: %', setting_count;
    RAISE NOTICE '';
    RAISE NOTICE 'ðŸ” Default Admin Credentials:';
    RAISE NOTICE '   Email: admin@ganacsade.com';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '   âš ï¸  CHANGE THIS PASSWORD IMMEDIATELY!';
    RAISE NOTICE '';
    RAISE NOTICE 'ðŸšš Default Delivery Person Credentials:';
    RAISE NOTICE '   Email: ahmed.delivery@ganacsade.com';
    RAISE NOTICE '   Password: delivery123';
    RAISE NOTICE '';
    RAISE NOTICE 'âœ… Database setup complete!';
    RAISE NOTICE '   Ready for Node.js API integration';
END $$;
