# pgAdmin Setup Guide - GANACSADE Database

This guide will help you set up the complete GANACSADE database using pgAdmin.

## 📋 Prerequisites

- PostgreSQL 14+ installed
- pgAdmin 4 installed and running
- PostgreSQL server running

---

## 🚀 Quick Setup (Single File Method)

### Option 1: Using the Combined SQL File

1. **Open pgAdmin**
   - Launch pgAdmin 4
   - Connect to your PostgreSQL server

2. **Open Query Tool**
   - Right-click on "PostgreSQL 14" (or your version) in the left sidebar
   - Select **Query Tool**

3. **Load the Complete SQL File**
   - Click the **Open File** icon (folder icon) in the Query Tool toolbar
   - Navigate to: `d:\Combination Ganacsade\backend\database\`
   - Select **`COMPLETE_DATABASE.sql`**

4. **Execute the Script**
   - Click the **Execute/Run** button (▶ play icon) or press **F5**
   - Wait for the script to complete (should take 10-30 seconds)

5. **Verify Success**
   - You should see success messages in the Messages tab
   - Look for: "✅ Database setup complete!"

6. **Refresh Database List**
   - Right-click on "Databases" in the left sidebar
   - Select **Refresh**
   - You should now see **`ganacsade_db`**

---

## 📊 Verify Installation

### Check Tables
1. Expand **ganacsade_db** → **Schemas** → **public** → **Tables**
2. You should see **24 tables**:
   - users
   - categories, subcategories
   - brands
   - products, product_variants, product_images
   - orders, order_items, order_status_history
   - cart, cart_items
   - addresses
   - payment_methods
   - transactions
   - flash_sales, flash_sale_products
   - featured_products
   - advertisements
   - delivery_persons
   - settings
   - activity_logs

### Check Seed Data
Run these queries in Query Tool:

```sql
-- Check admin user
SELECT * FROM users WHERE role = 'admin';

-- Check categories
SELECT name_en, name_so, name_ar FROM categories ORDER BY display_order;

-- Check brands
SELECT * FROM brands;

-- Check delivery persons
SELECT name, email, is_active FROM delivery_persons;

-- Check settings
SELECT key, category FROM settings ORDER BY category;
```

---

## 🔐 Default Credentials

### Admin Account
- **Email:** `admin@ganacsade.com`
- **Password:** `admin123`
- **Role:** admin

### Delivery Persons
- **Ahmed:** `ahmed.delivery@ganacsade.com` / `delivery123`
- **Fatima:** `fatima.delivery@ganacsade.com` / `delivery123`
- **Omar:** `omar.delivery@ganacsade.com` / `delivery123`

⚠️ **IMPORTANT:** Change these passwords immediately in production!

---

## 🔧 Alternative: Step-by-Step Method

If you prefer to run files individually:

### Step 1: Create Database
```sql
-- File: 00_create_database.sql
-- Creates database, extensions, and enums
```

### Step 2: Create Core Tables
```sql
-- File: 01_core_tables.sql
-- Creates users, products, categories, orders, cart
```

### Step 3: Create Supporting Tables
```sql
-- File: 02_supporting_tables.sql
-- Creates addresses, payment_methods, transactions
```

### Step 4: Create Feature Tables
```sql
-- File: 03_feature_tables.sql
-- Creates flash_sales, advertisements, delivery, settings
```

### Step 5: Create Indexes
```sql
-- File: 04_indexes.sql
-- Creates performance indexes
```

### Step 6: Create Constraints
```sql
-- File: 05_constraints.sql
-- Creates foreign keys and triggers
```

### Step 7: Insert Seed Data
```sql
-- File: 06_seed_data.sql
-- Inserts initial data
```

---

## 📝 Common Queries for Testing

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Count Records in All Tables
```sql
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'brands', COUNT(*) FROM brands
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'delivery_persons', COUNT(*) FROM delivery_persons
UNION ALL SELECT 'settings', COUNT(*) FROM settings
;
```

### Check Database Size
```sql
SELECT 
    pg_size_pretty(pg_database_size('ganacsade_db')) as database_size;
```

### List All Indexes
```sql
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### List All Foreign Keys
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## 🗑️ Reset Database (If Needed)

⚠️ **WARNING:** This will delete ALL data!

```sql
-- Drop database (disconnect all connections first)
DROP DATABASE IF EXISTS ganacsade_db;

-- Then run COMPLETE_DATABASE.sql again
```

---

## 🔍 Troubleshooting

### Error: "database already exists"
**Solution:** Either drop the existing database or comment out the CREATE DATABASE line in the SQL file.

### Error: "extension already exists"
**Solution:** This is normal and can be ignored. Extensions are created with IF NOT EXISTS.

### Error: "relation already exists"
**Solution:** The database was partially created. Drop it and start fresh.

### Connection Issues
**Solution:** 
- Ensure PostgreSQL service is running
- Check your connection settings in pgAdmin
- Verify username/password

### Permission Denied
**Solution:**
- Make sure you're connected as a superuser (postgres)
- Or grant necessary permissions to your user

---

## 📊 Database Statistics

After successful setup, you should have:

- **22 Tables** with complete relationships
- **50+ Indexes** for performance
- **25+ Foreign Keys** for data integrity
- **15 Custom Enums** for type safety
- **4 Trigger Types** for automation
- **1 Admin User** (seed data)
- **8 Categories** (seed data)
- **5 Brands** (seed data)
- **3 Delivery Persons** (seed data)
- **18 System Settings** (seed data)

---

## 🎯 Next Steps

1. ✅ Database is ready!
2. Update `.env` file in backend with database credentials
3. Start Node.js API server: `npm run dev`
4. Test API endpoints
5. Connect admin dashboard
6. Connect mobile app

---

## 📚 Additional Resources

- **Full Documentation:** `backend/database/README.md`
- **ER Diagram:** `backend/database/ER_DIAGRAM.md`
- **API Documentation:** `backend/README.md`
- **Phase 1 Analysis:** `backend/PHASE_1_ANALYSIS.md`
- **Phase 2 Summary:** `backend/PHASE_2_SUMMARY.md`

---

**Database Ready! 🎉**

*Last Updated: November 20, 2025*
