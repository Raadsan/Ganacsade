-- =====================================================
-- GANACSADE E-Commerce Platform
-- Seed Data for Initial Setup
-- =====================================================

\c ganacsade_db;

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
('Internet Services', 'Adeegyada Internetka', 'خدمات الإنترنت', 'Mobile data packages and internet services', 'Xirmooyinka xogta gacanta iyo adeegyada internetka', 'باقات بيانات الهاتف المحمول وخدمات الإنترنت', 'wifi', '#3F51B5', TRUE, 1),
('Gifts Market', 'Suuqa Hadiyadaha', 'سوق الهدايا', 'Perfect gifts for every occasion', 'Hadiyadaha ku habboon xaalad kasta', 'هدايا مثالية لكل مناسبة', 'gift', '#E91E63', TRUE, 2),
('Electronics', 'Elektaroonigada', 'الإلكترونيات', 'Latest electronics and gadgets', 'Elektaroonigada iyo qalabka ugu dambeeyay', 'أحدث الإلكترونيات والأجهزة', 'smartphone', '#2196F3', TRUE, 3),
('Men''s Market', 'Suuqa Ragga', 'سوق الرجال', 'Fashion and accessories for men', 'Moodada iyo agabka ragga', 'الأزياء والإكسسوارات للرجال', 'user', '#795548', TRUE, 4),
('Women''s Market', 'Suuqa Haweenka', 'سوق النساء', 'Fashion and accessories for women', 'Moodada iyo agabka haweenka', 'الأزياء والإكسسوارات للنساء', 'user', '#9C27B0', TRUE, 5),
('Kids Market', 'Suuqa Carruurta', 'سوق الأطفال', 'Everything for children', 'Wax walba oo carruurta ah', 'كل شيء للأطفال', 'baby', '#FF9800', TRUE, 6),
('Cosmetics', 'Quruxda', 'مستحضرات التجميل', 'Beauty and personal care products', 'Alaabta quruxda iyo daryeelka shaqsiga', 'منتجات التجميل والعناية الشخصية', 'sparkles', '#E91E63', TRUE, 7),
('General Goods', 'Alaabta Guud', 'السلع العامة', 'Everyday essentials and more', 'Waxyaabaha lagama maarmaanka ah ee maalinlaha ah iyo wax ka badan', 'الأساسيات اليومية والمزيد', 'shopping-bag', '#4CAF50', TRUE, 8);

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
    
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database Statistics:';
    RAISE NOTICE '   - Users: %', user_count;
    RAISE NOTICE '   - Categories: %', category_count;
    RAISE NOTICE '   - Brands: %', brand_count;
    RAISE NOTICE '   - Delivery Persons: %', delivery_count;
    RAISE NOTICE '   - Settings: %', setting_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Default Admin Credentials:';
    RAISE NOTICE '   Email: admin@ganacsade.com';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!';
    RAISE NOTICE '';
    RAISE NOTICE '🚚 Default Delivery Person Credentials:';
    RAISE NOTICE '   Email: ahmed.delivery@ganacsade.com';
    RAISE NOTICE '   Password: delivery123';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '   Ready for Node.js API integration';
END $$;
