-- =====================================================
-- GANACSADE E-Commerce Platform
-- Database Indexes for Performance Optimization
-- =====================================================

\c ganacsade_db;

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
    RAISE NOTICE '✅ Database indexes created successfully!';
    RAISE NOTICE '   - User indexes (email, phone, role, status)';
    RAISE NOTICE '   - Product indexes (category, brand, SKU, full-text search)';
    RAISE NOTICE '   - Order indexes (user, status, tracking)';
    RAISE NOTICE '   - Cart and payment indexes';
    RAISE NOTICE '   - Feature table indexes (flash sales, ads, delivery)';
    RAISE NOTICE '   - Performance optimized for common queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 05_constraints.sql';
END $$;
