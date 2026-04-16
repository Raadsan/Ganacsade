-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    UNIQUE(user_id, product_id, deleted_at)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist(user_id, product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist(created_at DESC);

-- Add comment
COMMENT ON TABLE wishlist IS 'Stores user wishlist items';
