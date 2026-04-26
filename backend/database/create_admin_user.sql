-- =====================================================
-- GANACSADE E-Commerce Platform
-- Create New Admin User
-- =====================================================

\c ganacsade_db;

-- =====================================================
-- CREATE NEW ADMIN USER
-- Email: newadmin@ganacsade.com
-- Password: admin123
-- =====================================================

-- The password hash below is for: admin123
-- Generated with bcrypt, salt rounds: 10

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
    'newadmin@ganacsade.com',
    '+252612345680',
    '$2b$10$YourHashedPasswordHere',  -- Replace this with actual bcrypt hash
    'admin',
    'New',
    'Admin',
    'New Admin User',
    'active',
    TRUE,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFY THE USER WAS CREATED
-- =====================================================

SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    created_at
FROM users 
WHERE email = 'newadmin@ganacsade.com';

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- To generate a proper bcrypt hash for a password, use one of these methods:
--
-- Method 1: Use the Node.js script (RECOMMENDED)
-- Run: node scripts/create_admin.js
--
-- Method 2: Use the password reset script
-- Run: node scripts/reset_user_password.js newadmin@ganacsade.com yourpassword
--
-- Method 3: Generate hash manually in Node.js
-- Run: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 10).then(console.log);"
--
-- Then replace the password_hash value above with the generated hash.
--
-- =====================================================
