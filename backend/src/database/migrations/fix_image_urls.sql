-- Fix hardcoded IP addresses in image URLs
-- This script updates all image URLs to use relative paths instead of absolute URLs

-- Update order_items table
UPDATE order_items
SET product_image_url = REGEXP_REPLACE(
    product_image_url,
    'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+',
    '',
    'g'
)
WHERE product_image_url LIKE 'http://%';

-- Update flash_sale_products table (if exists)
UPDATE flash_sale_products
SET product_image_url = REGEXP_REPLACE(
    product_image_url,
    'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+',
    '',
    'g'
)
WHERE product_image_url LIKE 'http://%';

-- Verify the changes
SELECT 'Order Items Updated:' as message, COUNT(*) as count
FROM order_items
WHERE product_image_url LIKE '/uploads/%';

SELECT 'Flash Sale Products Updated:' as message, COUNT(*) as count
FROM flash_sale_products
WHERE product_image_url LIKE '/uploads/%';

-- Show sample of updated URLs
SELECT id, product_name, product_image_url
FROM order_items
WHERE product_image_url IS NOT NULL
LIMIT 5;
