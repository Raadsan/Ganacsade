-- =====================================================
-- Migration 008: Staff role + token invalidation
-- =====================================================

-- Add 'staff' to the user_role enum (safe if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'staff'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'staff';
  END IF;
END $$;

-- Add token_invalidated_at to users so logout truly invalidates JWTs
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS token_invalidated_at TIMESTAMP;

-- Index to speed up the auth middleware check
CREATE INDEX IF NOT EXISTS idx_users_token_invalidated_at
  ON users (id, token_invalidated_at)
  WHERE token_invalidated_at IS NOT NULL;
