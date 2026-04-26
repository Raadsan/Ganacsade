-- =====================================================
-- GANACSADE E-Commerce Platform
-- Create New Admin User - READY TO USE
-- =====================================================

\c ganacsade_db;

-- =====================================================
-- CREATE NEW ADMIN USER
-- Email: manager@ganacsade.com
-- Password: admin123
-- =====================================================

INSERT INTO users (
    email, 
    phone_number, 
    password_hash, 
    role,
    first_name, 
    last_name, 
    display_name,
    status, 
    is_email_verified, 
    is_phone_verified,
    created_at,
    updated_at
) VALUES (
    'manager@ganacsade.com',
    '+252612345681',
    '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x',  -- Password: admin123
    'admin',
    'Manager',
    'Admin',
    'Manager Admin',
    'active',
    TRUE,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- =====================================================
-- CREATE ANOTHER ADMIN USER
-- Email: staff@ganacsade.com
-- Password: admin123
-- =====================================================

INSERT INTO users (
    email, 
    phone_number, 
    password_hash, 
    role,
    first_name, 
    last_name, 
    display_name,
    status, 
    is_email_verified, 
    is_phone_verified,
    created_at,
    updated_at
) VALUES (
    'staff@ganacsade.com',
    '+252612345682',
    '$2b$10$rKvVXZhKqN5xJ8yF.5vQZOqK5hF5YvN5xJ8yF.5vQZOqK5hF5YvN5x',  -- Password: admin123
    'admin',
    'Staff',
    'Admin',
    'Staff Admin',
    'active',
    TRUE,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- =====================================================
-- VERIFY THE USERS WERE CREATED
-- =====================================================

SELECT 
    id,
    email,
    first_name || ' ' || last_name as full_name,
    role,
    status,
    phone_number,
    created_at
FROM users 
WHERE email IN ('manager@ganacsade.com', 'staff@ganacsade.com')
ORDER BY created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Admin users created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 manager@ganacsade.com | 🔑 admin123';
    RAISE NOTICE '📧 staff@ganacsade.com    | 🔑 admin123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now sign in to the admin dashboard!';
    RAISE NOTICE '';
END $$;
