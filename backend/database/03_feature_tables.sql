-- =====================================================
-- GANACSADE E-Commerce Platform
-- Feature Tables Creation Script
-- Tables: flash_sales, advertisements, delivery, etc.
-- =====================================================

\c ganacsade_db;

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
    RAISE NOTICE '✅ Feature tables created successfully!';
    RAISE NOTICE '   - flash_sales, flash_sale_products';
    RAISE NOTICE '   - featured_products';
    RAISE NOTICE '   - advertisements';
    RAISE NOTICE '   - delivery_persons';
    RAISE NOTICE '   - settings';
    RAISE NOTICE '   - activity_logs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 04_indexes.sql';
END $$;
