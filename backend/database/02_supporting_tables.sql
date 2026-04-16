-- =====================================================
-- GANACSADE E-Commerce Platform
-- Supporting Tables Creation Script
-- Tables: addresses, payment_methods, transactions
-- =====================================================

\c ganacsade_db;

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
    RAISE NOTICE '✅ Supporting tables created successfully!';
    RAISE NOTICE '   - addresses';
    RAISE NOTICE '   - payment_methods';
    RAISE NOTICE '   - transactions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 03_feature_tables.sql';
END $$;
