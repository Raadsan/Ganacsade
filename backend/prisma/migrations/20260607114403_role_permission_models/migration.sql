-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_id" INTEGER;

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "url" TEXT,
    "is_collapsible" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_menus" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menu_access" (
    "id" SERIAL NOT NULL,
    "role_permissions_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_add" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_menu_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_sub_menu_access" (
    "id" SERIAL NOT NULL,
    "role_menu_access_id" INTEGER NOT NULL,
    "sub_menu_id" INTEGER NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_add" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_sub_menu_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "menus_title_key" ON "menus"("title");

-- CreateIndex
CREATE INDEX "idx_sub_menus_menu_id" ON "sub_menus"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_key" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "idx_role_menu_access_menu_id" ON "role_menu_access"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_role_menu_access_role_permissions_menu" ON "role_menu_access"("role_permissions_id", "menu_id");

-- CreateIndex
CREATE INDEX "idx_role_sub_menu_access_sub_menu_id" ON "role_sub_menu_access"("sub_menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_role_sub_menu_access_role_menu_sub_menu" ON "role_sub_menu_access"("role_menu_access_id", "sub_menu_id");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_role_model" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_menus" ADD CONSTRAINT "sub_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_access" ADD CONSTRAINT "role_menu_access_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_access" ADD CONSTRAINT "role_menu_access_role_permissions_id_fkey" FOREIGN KEY ("role_permissions_id") REFERENCES "role_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_sub_menu_access" ADD CONSTRAINT "role_sub_menu_access_role_menu_access_id_fkey" FOREIGN KEY ("role_menu_access_id") REFERENCES "role_menu_access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_sub_menu_access" ADD CONSTRAINT "role_sub_menu_access_sub_menu_id_fkey" FOREIGN KEY ("sub_menu_id") REFERENCES "sub_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
