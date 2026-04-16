-- =====================================================
-- GANACSADE E-Commerce Platform
-- Core Tables Creation Script
-- Tables: users, products, categories, orders, cart
-- =====================================================

\c ganacsade_db;

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
    RAISE NOTICE '✅ Core tables created successfully!';
    RAISE NOTICE '   - users';
    RAISE NOTICE '   - categories, subcategories';
    RAISE NOTICE '   - brands';
    RAISE NOTICE '   - products, product_variants, product_images';
    RAISE NOTICE '   - orders, order_items, order_status_history';
    RAISE NOTICE '   - cart, cart_items';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 02_supporting_tables.sql';
END $$;
