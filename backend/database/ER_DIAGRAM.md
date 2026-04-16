# GANACSADE E-Commerce Database - Entity Relationship Diagram

## Database Overview

**Total Tables:** 22  
**Total Relationships:** 25+ Foreign Keys  
**Database Type:** PostgreSQL 14+

---

## Core Entities

### 1. Users System
```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK: id (UUID)   │
│ email           │
│ phone_number    │
│ password_hash   │
│ role            │ ← customer | admin | delivery_person
│ first_name      │
│ last_name       │
│ status          │
│ preferences     │ (JSONB)
└─────────────────┘
        │
        │ 1:N
        ├──────────────────┐
        │                  │
        ▼                  ▼
┌─────────────┐    ┌──────────────────┐
│  ADDRESSES  │    │ PAYMENT_METHODS  │
├─────────────┤    ├──────────────────┤
│ PK: id      │    │ PK: id           │
│ FK: user_id │    │ FK: user_id      │
│ label       │    │ type             │
│ full_name   │    │ display_name     │
│ address_*   │    │ is_default       │
│ is_default  │    │ details (JSONB)  │
└─────────────┘    └──────────────────┘
```

---

### 2. Product Catalog System
```
┌──────────────┐
│  CATEGORIES  │
├──────────────┤
│ PK: id       │
│ name_en/so/ar│
│ description  │
│ icon_path    │
│ color        │
└──────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│  SUBCATEGORIES   │
├──────────────────┤
│ PK: id           │
│ FK: category_id  │
│ name_en/so/ar    │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────┐       ┌─────────────┐
│   PRODUCTS   │◄──────│   BRANDS    │
├──────────────┤  N:1  ├─────────────┤
│ PK: id       │       │ PK: id      │
│ FK: cat_id   │       │ name        │
│ FK: subcat_id│       │ logo_url    │
│ FK: brand_id │       └─────────────┘
│ name_en/so/ar│
│ description  │
│ price        │
│ discount_price│
│ stock_qty    │
│ sku          │
│ status       │
│ is_featured  │
│ is_halal     │
└──────────────┘
        │
        │ 1:N
        ├────────────────────┬─────────────────┐
        │                    │                 │
        ▼                    ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│PROD_VARIANTS │   │ PROD_IMAGES  │   │   FEATURED   │
├──────────────┤   ├──────────────┤   │   PRODUCTS   │
│ PK: id       │   │ PK: id       │   ├──────────────┤
│ FK: prod_id  │   │ FK: prod_id  │   │ PK: id       │
│ name_en/so/ar│   │ image_url    │   │ FK: prod_id  │
│ price        │   │ display_order│   │ display_order│
│ stock_qty    │   │ is_primary   │   └──────────────┘
│ sku          │   └──────────────┘
│ attributes   │ (JSONB)
└──────────────┘
```

---

### 3. Shopping Cart System
```
┌─────────────┐
│    USERS    │
└─────────────┘
        │
        │ 1:1
        ▼
┌─────────────┐
│    CART     │
├─────────────┤
│ PK: id      │
│ FK: user_id │ (UNIQUE)
│ subtotal    │
│ tax         │
│ shipping    │
│ discount    │
│ total       │
│ coupon_code │
└─────────────┘
        │
        │ 1:N
        ▼
┌──────────────┐       ┌──────────────┐
│  CART_ITEMS  │──────►│   PRODUCTS   │
├──────────────┤  N:1  └──────────────┘
│ PK: id       │
│ FK: cart_id  │       ┌──────────────┐
│ FK: prod_id  │──────►│PROD_VARIANTS │
│ FK: variant_id│ N:1  └──────────────┘
│ quantity     │
│ unit_price   │
│ discount_amt │
└──────────────┘
```

---

### 4. Order Management System
```
┌─────────────┐
│    USERS    │
└─────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│     ORDERS       │
├──────────────────┤
│ PK: id           │
│ FK: user_id      │
│ FK: delivery_id  │
│ order_number     │
│ subtotal         │
│ tax              │
│ shipping         │
│ discount         │
│ total            │
│ status           │
│ payment_status   │
│ shipping_address │ (JSONB snapshot)
│ payment_method   │ (JSONB snapshot)
│ tracking_number  │
└──────────────────┘
        │
        ├─────────────────┬──────────────────┐
        │ 1:N             │ 1:N              │
        ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ORDER_ITEMS  │  │ORDER_STATUS  │  │TRANSACTIONS  │
├──────────────┤  │   HISTORY    │  ├──────────────┤
│ PK: id       │  ├──────────────┤  │ PK: id       │
│ FK: order_id │  │ PK: id       │  │ FK: order_id │
│ FK: prod_id  │  │ FK: order_id │  │ FK: user_id  │
│ FK: variant_id│  │ status       │  │ trans_id     │
│ product_name │  │ notes        │  │ type         │
│ quantity     │  │ updated_by   │  │ status       │
│ unit_price   │  │ created_at   │  │ amount       │
│ total        │  └──────────────┘  │ payment_method│
└──────────────┘                    └──────────────┘
```

---

### 5. Delivery Management System
```
┌──────────────────┐
│ DELIVERY_PERSONS │
├──────────────────┤
│ PK: id           │
│ name             │
│ email            │
│ phone            │
│ password_hash    │
│ vehicle_type     │
│ vehicle_number   │
│ license_number   │
│ is_active        │
│ is_available     │
│ current_assigns  │
│ total_deliveries │
│ rating           │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────┐
│   ORDERS     │
├──────────────┤
│ FK: delivery_│
│    person_id │
│ delivery_*   │
└──────────────┘
```

---

### 6. Flash Sales System
```
┌──────────────┐
│ FLASH_SALES  │
├──────────────┤
│ PK: id       │
│ title        │
│ description  │
│ start_time   │
│ end_time     │
│ status       │
│ is_active    │
└──────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐       ┌──────────────┐
│ FLASH_SALE_PRODS │──────►│   PRODUCTS   │
├──────────────────┤  N:1  └──────────────┘
│ PK: id           │
│ FK: flash_sale_id│
│ FK: product_id   │
│ product_name     │
│ original_price   │
│ sale_price       │
│ discount_%       │ (calculated)
│ stock_limit      │
│ sold_count       │
└──────────────────┘
```

---

### 7. Advertisement System
```
┌──────────────────┐
│  ADVERTISEMENTS  │
├──────────────────┤
│ PK: id           │
│ title            │
│ description      │
│ image_url        │
│ target_url       │
│ placement        │ ← home_slider | home_banner | etc.
│ display_order    │
│ is_active        │
│ start_date       │
│ end_date         │
│ view_count       │
│ click_count      │
└──────────────────┘
```

---

### 8. System Tables
```
┌──────────────┐
│   SETTINGS   │
├──────────────┤
│ PK: id       │
│ key (UNIQUE) │
│ value (JSONB)│
│ category     │
│ description  │
│ is_public    │
└──────────────┘

┌──────────────────┐
│  ACTIVITY_LOGS   │
├──────────────────┤
│ PK: id           │
│ FK: user_id      │
│ user_name        │
│ user_role        │
│ action           │
│ entity_type      │
│ entity_id        │
│ description      │
│ changes (JSONB)  │
│ ip_address       │
│ user_agent       │
│ created_at       │
└──────────────────┘
```

---

## Relationship Summary

### One-to-Many (1:N) Relationships
1. **users** → **addresses** (1:N)
2. **users** → **payment_methods** (1:N)
3. **users** → **orders** (1:N)
4. **categories** → **subcategories** (1:N)
5. **categories** → **products** (1:N)
6. **subcategories** → **products** (1:N)
7. **brands** → **products** (1:N)
8. **products** → **product_variants** (1:N)
9. **products** → **product_images** (1:N)
10. **orders** → **order_items** (1:N)
11. **orders** → **order_status_history** (1:N)
12. **cart** → **cart_items** (1:N)
13. **flash_sales** → **flash_sale_products** (1:N)
14. **delivery_persons** → **orders** (1:N)

### One-to-One (1:1) Relationships
1. **users** → **cart** (1:1)

### Many-to-One (N:1) Relationships
1. **products** → **categories** (N:1)
2. **products** → **subcategories** (N:1)
3. **products** → **brands** (N:1)
4. **order_items** → **products** (N:1)
5. **order_items** → **product_variants** (N:1)
6. **cart_items** → **products** (N:1)
7. **cart_items** → **product_variants** (N:1)
8. **flash_sale_products** → **products** (N:1)
9. **featured_products** → **products** (N:1)
10. **transactions** → **orders** (N:1)

---

## Key Features

### 🔐 Security
- Password hashing (bcrypt)
- JWT token authentication
- Role-based access control (customer, admin, delivery_person)
- Encrypted sensitive data (API keys, payment details)

### 🌍 Multi-Language Support
- Products: name_en, name_so, name_ar
- Categories: name_en, name_so, name_ar
- Descriptions in 3 languages

### 📊 Denormalization for Performance
- `product_count` in categories, subcategories, brands
- Auto-updated via triggers

### 🗑️ Soft Deletes
- Users: `deleted_at` timestamp
- Products: `deleted_at` timestamp

### ⏰ Automatic Timestamps
- All tables: `created_at`, `updated_at`
- Auto-updated via triggers

### 🔄 Audit Trail
- `order_status_history` - tracks all order status changes
- `activity_logs` - tracks all admin actions

### 💰 Price Calculations
- Cart totals auto-calculated via triggers
- Support for discounts, tax, shipping

### 📦 Inventory Management
- Stock tracking at product and variant level
- `in_stock` auto-calculated field
- Low stock threshold alerts

---

## Database Constraints

### Primary Keys
- All tables use UUID primary keys
- Generated via `uuid_generate_v4()`

### Foreign Keys
- 25+ foreign key constraints
- Cascade deletes where appropriate
- Restrict deletes for critical data

### Check Constraints
- Price >= 0
- Discount price < regular price
- Stock quantity >= 0
- Rating between 0 and 5
- Date ranges (start < end)

### Unique Constraints
- User email, phone
- Product SKU
- Order number
- Transaction ID
- One cart per user

---

## Indexes

### Performance Indexes
- Email, phone lookups
- Product search (full-text with pg_trgm)
- Category, brand filtering
- Order status queries
- Date range queries

### Composite Indexes
- (category_id, status)
- (user_id, status)
- (placement, is_active, display_order)

---

## Triggers

### Auto-Update Triggers
1. **updated_at** - Auto-update on all tables
2. **product_count** - Auto-update category/brand counts
3. **order_status_history** - Auto-log status changes
4. **cart_totals** - Auto-calculate cart totals

---

## Data Types

### Custom Enums
- user_role
- user_gender
- user_status
- product_status
- order_status
- payment_status
- payment_method_type
- address_type
- transaction_type
- transaction_status
- advertisement_placement
- flash_sale_status
- vehicle_type
- language_code

### JSONB Fields
- user.preferences
- product.metadata
- order.shipping_address
- order.payment_method
- payment_method.details
- transaction.gateway_response
- settings.value
- activity_logs.changes

---

## Total Database Size Estimate

**Empty Database:** ~10 MB  
**With 10,000 products:** ~500 MB  
**With 100,000 orders:** ~2 GB  
**With images (external storage):** Minimal impact

---

*ER Diagram Documentation - November 20, 2025*
