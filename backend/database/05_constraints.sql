-- =====================================================
-- GANACSADE E-Commerce Platform
-- Foreign Key Constraints and Relationships
-- =====================================================

\c ganacsade_db;

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
    RAISE NOTICE '✅ Foreign key constraints created successfully!';
    RAISE NOTICE '✅ Triggers created:';
    RAISE NOTICE '   - Auto-update updated_at timestamps';
    RAISE NOTICE '   - Auto-update product counts (categories, brands)';
    RAISE NOTICE '   - Auto-log order status changes';
    RAISE NOTICE '   - Auto-calculate cart totals';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run 06_seed_data.sql (optional)';
END $$;
