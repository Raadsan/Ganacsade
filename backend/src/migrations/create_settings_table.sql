-- Create settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  data_type VARCHAR(20) NOT NULL DEFAULT 'string', -- string, number, boolean, json
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Insert default shipping and tax settings
INSERT INTO settings (key, value, description, category, data_type) VALUES
  ('shipping_flat_rate', '5.99', 'Flat rate shipping cost', 'shipping', 'number'),
  ('shipping_free_threshold', '50.00', 'Minimum order amount for free shipping', 'shipping', 'number'),
  ('tax_rate', '0.08', 'Tax rate (as decimal, e.g., 0.08 for 8%)', 'tax', 'number'),
  ('tax_enabled', 'true', 'Enable or disable tax calculation', 'tax', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();
