-- =====================================================
-- GANACSADE E-Commerce Platform
-- Reviews Table Creation Script
-- =====================================================

-- =====================================================
-- TABLE: product_reviews
-- Customer reviews for products
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Optional: link to purchase
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Review metadata
    is_verified_purchase BOOLEAN DEFAULT FALSE, -- True if user actually bought the product
    is_approved BOOLEAN DEFAULT TRUE, -- Admin can moderate reviews
    is_featured BOOLEAN DEFAULT FALSE, -- Featured reviews shown first
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    not_helpful_count INTEGER DEFAULT 0 CHECK (not_helpful_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one review per user per product
    UNIQUE(product_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON product_reviews(is_approved) WHERE is_approved = TRUE;

-- Comments
COMMENT ON TABLE product_reviews IS 'Customer reviews and ratings for products';
COMMENT ON COLUMN product_reviews.is_verified_purchase IS 'True if reviewer purchased the product';
COMMENT ON COLUMN product_reviews.helpful_count IS 'Number of users who found this review helpful';

-- =====================================================
-- TABLE: review_helpful_votes
-- Track which users voted on reviews
-- =====================================================

CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one vote per user per review
    UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_helpful_votes_review_id ON review_helpful_votes(review_id);

-- =====================================================
-- FUNCTION: Update product rating when review changes
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's average rating and review count
    UPDATE products
    SET 
        rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = TRUE
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = TRUE
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update product rating
DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews;
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- =====================================================
-- Sample data (optional - for testing)
-- =====================================================

-- You can insert sample reviews after running this script
-- Example:
-- INSERT INTO product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
-- VALUES ('product-uuid', 'user-uuid', 5, 'Great product!', 'Exactly as described.', true);
