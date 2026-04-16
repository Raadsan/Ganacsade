-- Add order_type column to orders table to distinguish between product and data package orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'product';

-- Add data package specific columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS package_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS provider_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS package_duration VARCHAR(50),
ADD COLUMN IF NOT EXISTS package_data VARCHAR(100);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_user_type ON orders(user_id, order_type);

-- Add comment
COMMENT ON COLUMN orders.order_type IS 'Type of order: product or data_package';
