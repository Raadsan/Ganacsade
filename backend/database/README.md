# GANACSADE E-Commerce Database Schema

## Overview
Complete PostgreSQL database schema for the GANACSADE e-commerce platform.

## Database Information
- **Database Name:** ganacsade_db
- **PostgreSQL Version:** 14+
- **Character Set:** UTF8
- **Collation:** en_US.UTF-8

## Migration Files Order

Execute the SQL files in the following order:

1. **00_create_database.sql** - Database creation and extensions
2. **01_core_tables.sql** - Core tables (users, products, categories, orders)
3. **02_supporting_tables.sql** - Supporting tables (addresses, payment_methods, brands, etc.)
4. **03_feature_tables.sql** - Feature tables (flash_sales, advertisements, delivery, etc.)
5. **04_indexes.sql** - Performance indexes
6. **05_constraints.sql** - Foreign key constraints
7. **06_seed_data.sql** - Initial seed data (optional)

## Tables Overview

### Core Tables (15 tables)
1. **users** - Customer, admin, and delivery person accounts
2. **products** - Product catalog with multi-language support
3. **product_variants** - Product variations (size, color, etc.)
4. **product_images** - Product image URLs
5. **categories** - Main product categories
6. **subcategories** - Category subdivisions
7. **orders** - Customer orders
8. **order_items** - Products in each order
9. **order_status_history** - Order status tracking
10. **cart** - Shopping cart
11. **cart_items** - Items in shopping cart
12. **addresses** - User shipping addresses
13. **payment_methods** - User payment methods
14. **brands** - Product brands
15. **transactions** - Payment transactions

### Feature Tables (4 tables)
16. **flash_sales** - Flash sale events
17. **flash_sale_products** - Products in flash sales
18. **featured_products** - Homepage featured products
19. **advertisements** - Marketing banners

### System Tables (3 tables)
22. **delivery_persons** - Delivery personnel
23. **settings** - System configuration
24. **activity_logs** - Audit trail

**Total: 22 Tables**

## Key Features

- **Multi-language Support:** Products and categories support EN/SO/AR
- **Soft Deletes:** Users and products use deleted_at timestamp
- **Audit Trails:** created_at, updated_at on all tables
- **UUID Primary Keys:** For better scalability
- **Indexes:** Optimized for common queries
- **Constraints:** Data integrity enforced at database level

## Running Migrations

### Using psql:
```bash
# Create database
psql -U postgres -f 00_create_database.sql

# Run migrations
psql -U postgres -d ganacsade_db -f 01_core_tables.sql
psql -U postgres -d ganacsade_db -f 02_supporting_tables.sql
psql -U postgres -d ganacsade_db -f 03_feature_tables.sql
psql -U postgres -d ganacsade_db -f 04_indexes.sql
psql -U postgres -d ganacsade_db -f 05_constraints.sql
psql -U postgres -d ganacsade_db -f 06_seed_data.sql
```

### Using Node.js migration tool:
```bash
npm run migrate
```

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ganacsade_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ganacsade_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false
```

## Backup & Restore

### Backup:
```bash
pg_dump -U postgres ganacsade_db > backup.sql
```

### Restore:
```bash
psql -U postgres ganacsade_db < backup.sql
```

## ER Diagram

See `ER_DIAGRAM.md` for visual representation of table relationships.

---

*Last Updated: November 20, 2025*
