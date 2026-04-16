-- =====================================================
-- Add Sample User and Transaction
-- =====================================================

\c ganacsade_db;

-- Insert a sample user (customer)
INSERT INTO users (
    name,
    email,
    phone,
    password,
    role,
    status,
    is_verified,
    email_verified_at
) VALUES (
    'Ahmed Mohamed',
    'ahmed.mohamed@example.com',
    '+252 61 234 5678',
    '$2a$10$YourHashedPasswordHere123456789012345678901234567890123',  -- Password: password123
    'customer',
    'active',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING
RETURNING id, name, email;

-- Get the user ID (you'll need to replace this with the actual UUID from above)
-- For now, let's use a variable approach

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get or create the user
    SELECT id INTO user_uuid FROM users WHERE email = 'ahmed.mohamed@example.com';
    
    IF user_uuid IS NULL THEN
        INSERT INTO users (
            name, email, phone, password, role, status, is_verified, email_verified_at
        ) VALUES (
            'Ahmed Mohamed',
            'ahmed.mohamed@example.com',
            '+252 61 234 5678',
            '$2a$10$YourHashedPasswordHere123456789012345678901234567890123',
            'customer',
            'active',
            true,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO user_uuid;
    END IF;

    -- Insert a sample transaction
    INSERT INTO transactions (
        transaction_id,
        type,
        status,
        amount,
        currency,
        payment_method,
        user_id,
        user_name,
        user_email,
        description
    ) VALUES (
        'TXN-2025-0000001',
        'order_payment',
        'completed',
        299.99,
        'USD',
        'evc_plus',
        user_uuid,
        'Ahmed Mohamed',
        'ahmed.mohamed@example.com',
        'Payment for Order #ORD-2025-001'
    ) ON CONFLICT (transaction_id) DO NOTHING;

    -- Insert another transaction
    INSERT INTO transactions (
        transaction_id,
        type,
        status,
        amount,
        currency,
        payment_method,
        user_id,
        user_name,
        user_email,
        description,
        completed_at
    ) VALUES (
        'TXN-2025-0000002',
        'order_payment',
        'completed',
        599.98,
        'USD',
        'waafi_pay',
        user_uuid,
        'Ahmed Mohamed',
        'ahmed.mohamed@example.com',
        'Payment for Order #ORD-2025-002',
        CURRENT_TIMESTAMP
    ) ON CONFLICT (transaction_id) DO NOTHING;

    -- Insert a refund transaction
    INSERT INTO transactions (
        transaction_id,
        type,
        status,
        amount,
        currency,
        payment_method,
        user_id,
        user_name,
        user_email,
        description,
        completed_at
    ) VALUES (
        'TXN-2025-0000003',
        'refund',
        'completed',
        89.99,
        'USD',
        'evc_plus',
        user_uuid,
        'Ahmed Mohamed',
        'ahmed.mohamed@example.com',
        'Refund for Order #ORD-2025-001',
        CURRENT_TIMESTAMP
    ) ON CONFLICT (transaction_id) DO NOTHING;

    RAISE NOTICE '✅ Sample user and transactions added successfully!';
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Email: ahmed.mohamed@example.com';
    RAISE NOTICE 'Password: password123';
END $$;

-- Display the results
SELECT 
    id,
    name,
    email,
    phone,
    role,
    status,
    is_verified,
    created_at
FROM users 
WHERE email = 'ahmed.mohamed@example.com';

SELECT 
    transaction_id,
    type,
    status,
    amount,
    currency,
    payment_method,
    user_name,
    description,
    created_at
FROM transactions
WHERE user_email = 'ahmed.mohamed@example.com'
ORDER BY created_at DESC;
