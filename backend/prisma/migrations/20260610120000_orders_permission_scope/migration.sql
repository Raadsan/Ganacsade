-- AlterTable
ALTER TABLE "role_menu_access" ADD COLUMN "can_assign" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "role_menu_access" ADD COLUMN "can_view_all_orders" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "role_menu_access" ADD COLUMN "can_view_by_role" BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing Orders menu permissions from legacy can_add-based scope
UPDATE "role_menu_access" AS rma
SET
  "can_assign" = rma."can_add",
  "can_view_all_orders" = rma."can_add",
  "can_view_by_role" = rma."can_view" AND NOT rma."can_add"
FROM "menus" AS m
WHERE rma."menu_id" = m."id" AND m."url" = '/orders';
