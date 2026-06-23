-- Role and permission RBAC models
-- Safe to run multiple times due to IF NOT EXISTS guards

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL UNIQUE,
  icon VARCHAR(255),
  url VARCHAR(255),
  is_collapsible BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sub_menus (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  url VARCHAR(255) NOT NULL,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_menus_menu_id ON sub_menus(menu_id);

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL UNIQUE REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_menu_access (
  id SERIAL PRIMARY KEY,
  role_permissions_id INTEGER NOT NULL REFERENCES role_permissions(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_role_menu_access_role_permissions_menu UNIQUE (role_permissions_id, menu_id)
);

CREATE INDEX IF NOT EXISTS idx_role_menu_access_menu_id ON role_menu_access(menu_id);

CREATE TABLE IF NOT EXISTS role_sub_menu_access (
  id SERIAL PRIMARY KEY,
  role_menu_access_id INTEGER NOT NULL REFERENCES role_menu_access(id) ON DELETE CASCADE,
  sub_menu_id INTEGER NOT NULL REFERENCES sub_menus(id) ON DELETE CASCADE,
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_add BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_role_sub_menu_access_role_menu_sub_menu UNIQUE (role_menu_access_id, sub_menu_id)
);

CREATE INDEX IF NOT EXISTS idx_role_sub_menu_access_sub_menu_id ON role_sub_menu_access(sub_menu_id);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_role_model'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_role_model
      FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE NO ACTION ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Keep updated_at fresh on UPDATE operations for new RBAC tables
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_set_updated_at ON roles;
CREATE TRIGGER trg_roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_menus_set_updated_at ON menus;
CREATE TRIGGER trg_menus_set_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_sub_menus_set_updated_at ON sub_menus;
CREATE TRIGGER trg_sub_menus_set_updated_at
BEFORE UPDATE ON sub_menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_role_permissions_set_updated_at ON role_permissions;
CREATE TRIGGER trg_role_permissions_set_updated_at
BEFORE UPDATE ON role_permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_role_menu_access_set_updated_at ON role_menu_access;
CREATE TRIGGER trg_role_menu_access_set_updated_at
BEFORE UPDATE ON role_menu_access
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_role_sub_menu_access_set_updated_at ON role_sub_menu_access;
CREATE TRIGGER trg_role_sub_menu_access_set_updated_at
BEFORE UPDATE ON role_sub_menu_access
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
