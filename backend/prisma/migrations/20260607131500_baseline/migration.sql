-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."address_type" AS ENUM ('home', 'work', 'other');

-- CreateEnum
CREATE TYPE "public"."advertisement_placement" AS ENUM ('home_slider', 'home_banner', 'category_page', 'product_page', 'checkout');

-- CreateEnum
CREATE TYPE "public"."flash_sale_status" AS ENUM ('scheduled', 'active', 'expired');

-- CreateEnum
CREATE TYPE "public"."language_code" AS ENUM ('en', 'so', 'ar');

-- CreateEnum
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded');

-- CreateEnum
CREATE TYPE "public"."payment_method_type" AS ENUM ('waafi_pay', 'edahab', 'premier_wallet', 'cash_on_delivery', 'credit_card', 'debit_card');

-- CreateEnum
CREATE TYPE "public"."payment_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."product_status" AS ENUM ('active', 'inactive', 'draft', 'archived');

-- CreateEnum
CREATE TYPE "public"."transaction_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."transaction_type" AS ENUM ('order_payment', 'refund', 'wallet_topup', 'wallet_withdrawal');

-- CreateEnum
CREATE TYPE "public"."user_gender" AS ENUM ('male', 'female', 'not_specified');

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('customer', 'admin', 'delivery_person', 'staff');

-- CreateEnum
CREATE TYPE "public"."user_status" AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "public"."vehicle_type" AS ENUM ('motorcycle', 'car', 'bicycle', 'on_foot');

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "user_name" VARCHAR(200),
    "user_role" "public"."user_role",
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID,
    "description" TEXT,
    "changes" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "address_line1" VARCHAR(255) NOT NULL,
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'Somalia',
    "postal_code" VARCHAR(20),
    "type" "public"."address_type" DEFAULT 'home',
    "is_default" BOOLEAN DEFAULT false,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."advertisements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "target_url" TEXT,
    "placement" "public"."advertisement_placement" NOT NULL,
    "display_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "view_count" INTEGER DEFAULT 0,
    "click_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website_url" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "product_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0,
    "tax" DECIMAL(10,2) DEFAULT 0,
    "shipping" DECIMAL(10,2) DEFAULT 0,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "total" DECIMAL(10,2) DEFAULT 0,
    "coupon_code" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cart_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) DEFAULT 0,
    "added_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name_en" VARCHAR(100) NOT NULL,
    "name_so" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "description_en" TEXT,
    "description_so" TEXT,
    "description_ar" TEXT,
    "icon_path" VARCHAR(255),
    "color" VARCHAR(7),
    "image_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "product_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."delivery_persons" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "email" CITEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "vehicle_type" "public"."vehicle_type",
    "vehicle_number" VARCHAR(50),
    "license_number" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "is_available" BOOLEAN DEFAULT true,
    "current_assignments" INTEGER DEFAULT 0,
    "total_deliveries" INTEGER DEFAULT 0,
    "rating" DECIMAL(2,1) DEFAULT 5.0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."featured_products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "display_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flash_sale_products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "flash_sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_image_url" TEXT,
    "original_price" DECIMAL(10,2) NOT NULL,
    "sale_price" DECIMAL(10,2) NOT NULL,
    "discount_percentage" INTEGER GENERATED ALWAYS AS ((round((((original_price - sale_price) / original_price) * (100)::numeric), 0))::integer) STORED,
    "stock_limit" INTEGER NOT NULL,
    "sold_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flash_sale_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flash_sales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "status" "public"."flash_sale_status" DEFAULT 'scheduled',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "product_name" VARCHAR(255) NOT NULL,
    "product_image_url" TEXT,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) DEFAULT 0,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "variant_name" VARCHAR(100),
    "variant_attributes" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "package_name" VARCHAR(255),
    "provider_name" VARCHAR(255),
    "recipient_phone" VARCHAR(20),
    "package_duration" VARCHAR(50),
    "package_data" VARCHAR(100),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_status_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "status" "public"."order_status" NOT NULL,
    "notes" TEXT,
    "updated_by" UUID,
    "updated_by_name" VARCHAR(200),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "public"."order_status" DEFAULT 'pending',
    "payment_status" "public"."payment_status" DEFAULT 'pending',
    "shipping_address" JSONB NOT NULL,
    "payment_method" JSONB NOT NULL,
    "delivery_person_id" UUID,
    "delivery_person_name" VARCHAR(200),
    "delivery_assigned_at" TIMESTAMP(6),
    "delivery_picked_up_at" TIMESTAMP(6),
    "delivery_delivered_at" TIMESTAMP(6),
    "tracking_number" VARCHAR(100),
    "estimated_delivery" TIMESTAMP(6),
    "actual_delivery" TIMESTAMP(6),
    "notes" TEXT,
    "customer_notes" TEXT,
    "admin_notes" TEXT,
    "coupon_code" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "order_type" VARCHAR(50) DEFAULT 'product',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."passwordresets" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "expiresat" TIMESTAMP(6) NOT NULL,
    "isused" BOOLEAN DEFAULT false,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordresets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "type" "public"."payment_method_type" NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "details" JSONB DEFAULT '{}',
    "last_four" VARCHAR(4),
    "card_brand" VARCHAR(50),
    "expiry_month" INTEGER,
    "expiry_year" INTEGER,
    "phone_number" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "display_order" INTEGER DEFAULT 0,
    "is_primary" BOOLEAN DEFAULT false,
    "alt_text" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_reviews" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "comment" TEXT,
    "is_verified_purchase" BOOLEAN DEFAULT false,
    "is_approved" BOOLEAN DEFAULT true,
    "is_featured" BOOLEAN DEFAULT false,
    "helpful_count" INTEGER DEFAULT 0,
    "not_helpful_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_so" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2),
    "stock_quantity" INTEGER DEFAULT 0,
    "in_stock" BOOLEAN GENERATED ALWAYS AS ((stock_quantity > 0)) STORED,
    "sku" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100),
    "attributes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name_en" VARCHAR(255) NOT NULL,
    "name_so" VARCHAR(255) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "description_en" TEXT,
    "description_so" TEXT,
    "description_ar" TEXT,
    "category_id" UUID NOT NULL,
    "subcategory_id" UUID,
    "brand_id" UUID,
    "price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2),
    "stock_quantity" INTEGER DEFAULT 0,
    "in_stock" BOOLEAN GENERATED ALWAYS AS ((stock_quantity > 0)) STORED,
    "low_stock_threshold" INTEGER DEFAULT 10,
    "sku" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100),
    "tags" TEXT[],
    "rating" DECIMAL(2,1) DEFAULT 0.0,
    "review_count" INTEGER DEFAULT 0,
    "status" "public"."product_status" DEFAULT 'draft',
    "is_featured" BOOLEAN DEFAULT false,
    "is_halal" BOOLEAN DEFAULT false,
    "metadata" JSONB DEFAULT '{}',
    "slug" VARCHAR(255),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_helpful_votes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "review_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "category" VARCHAR(50),
    "description" TEXT,
    "is_public" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subcategories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "category_id" UUID NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_so" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "description_en" TEXT,
    "description_so" TEXT,
    "description_ar" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "product_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "transaction_id" VARCHAR(100) NOT NULL,
    "type" "public"."transaction_type" NOT NULL,
    "status" "public"."transaction_status" DEFAULT 'pending',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "payment_method" "public"."payment_method_type" NOT NULL,
    "user_id" UUID NOT NULL,
    "user_name" VARCHAR(200),
    "user_email" VARCHAR(255),
    "order_id" UUID,
    "description" TEXT,
    "gateway_response" JSONB,
    "metadata" JSONB DEFAULT '{}',
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),
    "failed_at" TIMESTAMP(6),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_addresses" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "street" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL DEFAULT 'Somalia',
    "postal_code" VARCHAR(20),
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" CITEXT,
    "phone_number" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'customer',
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "display_name" VARCHAR(200),
    "profile_image_url" TEXT,
    "gender" "public"."user_gender" DEFAULT 'not_specified',
    "date_of_birth" DATE,
    "preferred_language" "public"."language_code" DEFAULT 'en',
    "preferred_currency" VARCHAR(3) DEFAULT 'USD',
    "is_email_verified" BOOLEAN DEFAULT false,
    "is_phone_verified" BOOLEAN DEFAULT false,
    "email_verification_token" VARCHAR(255),
    "phone_verification_code" VARCHAR(10),
    "status" "public"."user_status" DEFAULT 'active',
    "preferences" JSONB DEFAULT '{"darkMode": false, "themeMode": "light", "biometricAuth": false, "marketingEmails": false, "smsNotifications": true, "pushNotifications": true, "emailNotifications": true}',
    "reset_password_token" VARCHAR(255),
    "reset_password_expires" TIMESTAMP(6),
    "last_login_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "token_invalidated_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_activity_logs_entity" ON "public"."activity_logs"("entity_type" ASC, "entity_id" ASC);

-- CreateIndex
CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_addresses_is_default" ON "public"."addresses"("user_id" ASC, "is_default" ASC) WHERE (is_default = true);

-- CreateIndex
CREATE INDEX "idx_addresses_type" ON "public"."addresses"("type" ASC);

-- CreateIndex
CREATE INDEX "idx_addresses_user_id" ON "public"."addresses"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_advertisements_active_placement" ON "public"."advertisements"("placement" ASC, "is_active" ASC, "display_order" ASC) WHERE (is_active = true);

-- CreateIndex
CREATE INDEX "idx_advertisements_display_order" ON "public"."advertisements"("display_order" ASC);

-- CreateIndex
CREATE INDEX "idx_advertisements_end_date" ON "public"."advertisements"("end_date" ASC);

-- CreateIndex
CREATE INDEX "idx_advertisements_is_active" ON "public"."advertisements"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_advertisements_placement" ON "public"."advertisements"("placement" ASC);

-- CreateIndex
CREATE INDEX "idx_advertisements_start_date" ON "public"."advertisements"("start_date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "public"."brands"("name" ASC);

-- CreateIndex
CREATE INDEX "idx_brands_is_active" ON "public"."brands"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_brands_name" ON "public"."brands"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_key" ON "public"."cart"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_cart_updated_at" ON "public"."cart"("updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_cart_user_id" ON "public"."cart"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key" ON "public"."cart_items"("cart_id" ASC, "product_id" ASC, "variant_id" ASC);

-- CreateIndex
CREATE INDEX "idx_cart_items_cart_id" ON "public"."cart_items"("cart_id" ASC);

-- CreateIndex
CREATE INDEX "idx_cart_items_product_id" ON "public"."cart_items"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_cart_items_variant_id" ON "public"."cart_items"("variant_id" ASC);

-- CreateIndex
CREATE INDEX "idx_categories_display_order" ON "public"."categories"("display_order" ASC);

-- CreateIndex
CREATE INDEX "idx_categories_is_active" ON "public"."categories"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_categories_name_ar_trgm" ON "public"."categories" USING GIN ("name_ar" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_categories_name_en_trgm" ON "public"."categories" USING GIN ("name_en" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_categories_name_so_trgm" ON "public"."categories" USING GIN ("name_so" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_persons_email_key" ON "public"."delivery_persons"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_delivery_persons_available" ON "public"."delivery_persons"("is_active" ASC, "is_available" ASC) WHERE ((is_active = true) AND (is_available = true));

-- CreateIndex
CREATE INDEX "idx_delivery_persons_email" ON "public"."delivery_persons"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_delivery_persons_is_active" ON "public"."delivery_persons"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_delivery_persons_is_available" ON "public"."delivery_persons"("is_available" ASC);

-- CreateIndex
CREATE INDEX "idx_delivery_persons_phone" ON "public"."delivery_persons"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "featured_products_product_id_key" ON "public"."featured_products"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_featured_products_display_order" ON "public"."featured_products"("display_order" ASC);

-- CreateIndex
CREATE INDEX "idx_featured_products_is_active" ON "public"."featured_products"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_featured_products_product_id" ON "public"."featured_products"("product_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "flash_sale_products_flash_sale_id_product_id_key" ON "public"."flash_sale_products"("flash_sale_id" ASC, "product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sale_products_flash_sale_id" ON "public"."flash_sale_products"("flash_sale_id" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sale_products_product_id" ON "public"."flash_sale_products"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sales_active" ON "public"."flash_sales"("start_time" ASC, "end_time" ASC, "is_active" ASC) WHERE (is_active = true);

-- CreateIndex
CREATE INDEX "idx_flash_sales_end_time" ON "public"."flash_sales"("end_time" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sales_is_active" ON "public"."flash_sales"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sales_start_time" ON "public"."flash_sales"("start_time" ASC);

-- CreateIndex
CREATE INDEX "idx_flash_sales_status" ON "public"."flash_sales"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_order_items_order_id" ON "public"."order_items"("order_id" ASC);

-- CreateIndex
CREATE INDEX "idx_order_items_product_id" ON "public"."order_items"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_order_items_variant_id" ON "public"."order_items"("variant_id" ASC);

-- CreateIndex
CREATE INDEX "idx_order_status_history_created_at" ON "public"."order_status_history"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_order_status_history_order_id" ON "public"."order_status_history"("order_id" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "public"."orders"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_delivery_person_id" ON "public"."orders"("delivery_person_id" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_delivery_status" ON "public"."orders"("delivery_person_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_order_number" ON "public"."orders"("order_number" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_order_type" ON "public"."orders"("order_type" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_payment_status" ON "public"."orders"("payment_status" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "public"."orders"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_status_created" ON "public"."orders"("status" ASC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_tracking_number" ON "public"."orders"("tracking_number" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_user_id" ON "public"."orders"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_user_status" ON "public"."orders"("user_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_user_type" ON "public"."orders"("user_id" ASC, "order_type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number" ASC);

-- CreateIndex
CREATE INDEX "idx_password_resets_email" ON "public"."passwordresets"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_password_resets_otp" ON "public"."passwordresets"("otp" ASC);

-- CreateIndex
CREATE INDEX "idx_payment_methods_is_default" ON "public"."payment_methods"("user_id" ASC, "is_default" ASC) WHERE (is_default = true);

-- CreateIndex
CREATE INDEX "idx_payment_methods_type" ON "public"."payment_methods"("type" ASC);

-- CreateIndex
CREATE INDEX "idx_payment_methods_user_id" ON "public"."payment_methods"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_product_images_is_primary" ON "public"."product_images"("product_id" ASC, "is_primary" ASC) WHERE (is_primary = true);

-- CreateIndex
CREATE INDEX "idx_product_images_product_id" ON "public"."product_images"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_reviews_created_at" ON "public"."product_reviews"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_reviews_product_id" ON "public"."product_reviews"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_reviews_rating" ON "public"."product_reviews"("rating" ASC);

-- CreateIndex
CREATE INDEX "idx_reviews_user_id" ON "public"."product_reviews"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_product_id_user_id_key" ON "public"."product_reviews"("product_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_product_variants_sku" ON "public"."product_variants"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "public"."product_variants"("sku" ASC);

-- CreateIndex
CREATE INDEX "idx_products_brand_id" ON "public"."products"("brand_id" ASC);

-- CreateIndex
CREATE INDEX "idx_products_category_id" ON "public"."products"("category_id" ASC);

-- CreateIndex
CREATE INDEX "idx_products_category_status" ON "public"."products"("category_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "idx_products_created_at" ON "public"."products"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_products_deleted_at" ON "public"."products"("deleted_at" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_products_is_featured" ON "public"."products"("is_featured" ASC) WHERE (is_featured = true);

-- CreateIndex
CREATE INDEX "idx_products_name_ar_trgm" ON "public"."products" USING GIN ("name_ar" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_products_name_en_trgm" ON "public"."products" USING GIN ("name_en" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_products_name_so_trgm" ON "public"."products" USING GIN ("name_so" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_products_price" ON "public"."products"("price" ASC);

-- CreateIndex
CREATE INDEX "idx_products_rating" ON "public"."products"("rating" DESC);

-- CreateIndex
CREATE INDEX "idx_products_sku" ON "public"."products"("sku" ASC);

-- CreateIndex
CREATE INDEX "idx_products_status" ON "public"."products"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_products_status_featured" ON "public"."products"("status" ASC, "is_featured" ASC);

-- CreateIndex
CREATE INDEX "idx_products_subcategory_id" ON "public"."products"("subcategory_id" ASC);

-- CreateIndex
CREATE INDEX "idx_products_tags" ON "public"."products" USING GIN ("tags" array_ops);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_votes_review_id_user_id_key" ON "public"."review_helpful_votes"("review_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_settings_category" ON "public"."settings"("category" ASC);

-- CreateIndex
CREATE INDEX "idx_settings_is_public" ON "public"."settings"("is_public" ASC) WHERE (is_public = true);

-- CreateIndex
CREATE INDEX "idx_settings_key" ON "public"."settings"("key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "public"."settings"("key" ASC);

-- CreateIndex
CREATE INDEX "idx_subcategories_category_id" ON "public"."subcategories"("category_id" ASC);

-- CreateIndex
CREATE INDEX "idx_subcategories_display_order" ON "public"."subcategories"("display_order" ASC);

-- CreateIndex
CREATE INDEX "idx_subcategories_is_active" ON "public"."subcategories"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_created_at" ON "public"."transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_transactions_order_id" ON "public"."transactions"("order_id" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_status" ON "public"."transactions"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_transaction_id" ON "public"."transactions"("transaction_id" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_type" ON "public"."transactions"("type" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_type_status" ON "public"."transactions"("type" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_user_id" ON "public"."transactions"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_transactions_user_status" ON "public"."transactions"("user_id" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_id_key" ON "public"."transactions"("transaction_id" ASC);

-- CreateIndex
CREATE INDEX "idx_user_addresses_default" ON "public"."user_addresses"("user_id" ASC, "is_default" ASC);

-- CreateIndex
CREATE INDEX "idx_user_addresses_user_id" ON "public"."user_addresses"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "public"."users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "public"."users"("deleted_at" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_users_phone" ON "public"."users"("phone_number" ASC);

-- CreateIndex
CREATE INDEX "idx_users_role" ON "public"."users"("role" ASC);

-- CreateIndex
CREATE INDEX "idx_users_status" ON "public"."users"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_users_token_invalidated_at" ON "public"."users"("id" ASC, "token_invalidated_at" ASC) WHERE (token_invalidated_at IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users"("phone_number" ASC);

-- CreateIndex
CREATE INDEX "idx_wishlist_created_at" ON "public"."wishlist"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_wishlist_product_id" ON "public"."wishlist"("product_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_wishlist_user_id" ON "public"."wishlist"("user_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "idx_wishlist_user_product" ON "public"."wishlist"("user_id" ASC, "product_id" ASC) WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_user_id_product_id_deleted_at_key" ON "public"."wishlist"("user_id" ASC, "product_id" ASC, "deleted_at" ASC);

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "fk_activity_logs_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "fk_addresses_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cart" ADD CONSTRAINT "fk_cart_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "fk_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "fk_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "fk_cart_items_variant" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."featured_products" ADD CONSTRAINT "fk_featured_products_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."flash_sale_products" ADD CONSTRAINT "fk_flash_sale_products_flash_sale" FOREIGN KEY ("flash_sale_id") REFERENCES "public"."flash_sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."flash_sale_products" ADD CONSTRAINT "fk_flash_sale_products_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "fk_order_items_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "fk_order_items_variant" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "fk_order_status_history_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "fk_order_status_history_user" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "fk_orders_delivery_person" FOREIGN KEY ("delivery_person_id") REFERENCES "public"."delivery_persons"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "fk_payment_methods_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "fk_product_images_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "fk_product_variants_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_brand" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_category" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_subcategory" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."product_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subcategories" ADD CONSTRAINT "fk_subcategories_category" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "fk_transactions_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "fk_transactions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."wishlist" ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


