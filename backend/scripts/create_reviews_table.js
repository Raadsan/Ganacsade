const { query } = require('../src/config/database');

async function createReviewsTable() {
  try {
    console.log('Creating product_reviews table...');
    
    // Create product_reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        
        -- References
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        
        -- Review content
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        
        -- Review metadata
        is_verified_purchase BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        
        -- Helpful votes
        helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
        not_helpful_count INTEGER DEFAULT 0 CHECK (not_helpful_count >= 0),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Unique constraint
        UNIQUE(product_id, user_id)
      )
    `);
    console.log('✅ product_reviews table created');

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC)`);
    console.log('✅ Indexes created');

    // Create review_helpful_votes table
    await query(`
      CREATE TABLE IF NOT EXISTS review_helpful_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_helpful BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(review_id, user_id)
      )
    `);
    console.log('✅ review_helpful_votes table created');

    // Create function to update product rating
    await query(`
      CREATE OR REPLACE FUNCTION update_product_rating()
      RETURNS TRIGGER AS $$
      BEGIN
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
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ update_product_rating function created');

    // Create trigger
    await query(`DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews`);
    await query(`
      CREATE TRIGGER trigger_update_product_rating
      AFTER INSERT OR UPDATE OR DELETE ON product_reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_product_rating()
    `);
    console.log('✅ Trigger created');

    console.log('\n✅ All reviews tables and functions created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating reviews table:', error.message);
    process.exit(1);
  }
}

createReviewsTable();
