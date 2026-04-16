# 🚀 GANACSADE Database - Quick Start

## One-Step Setup for pgAdmin

### 1. Open pgAdmin
- Launch pgAdmin 4
- Connect to PostgreSQL server

### 2. Open Query Tool
- Right-click "PostgreSQL" in sidebar
- Select **Query Tool**

### 3. Load & Run
- Click **Open File** icon (📁)
- Select: `COMPLETE_DATABASE.sql`
- Click **Execute** (▶) or press **F5**

### 4. Done! ✅
- Database `ganacsade_db` created
- 24 tables with data
- Ready to use!

---

## 🔐 Login Credentials

**Admin:**
- Email: `admin@ganacsade.com`
- Password: `admin123`

**Delivery:**
- Email: `ahmed.delivery@ganacsade.com`
- Password: `delivery123`

⚠️ Change passwords in production!

---

## ✅ Verify Setup

Run this query:
```sql
SELECT COUNT(*) FROM users;
-- Should return: 1

SELECT COUNT(*) FROM categories;
-- Should return: 8
```

---

## 📁 File Location

```
d:\Combination Ganacsade\backend\database\COMPLETE_DATABASE.sql
```

**File Size:** ~67 KB  
**Execution Time:** 10-30 seconds

---

## 🆘 Need Help?

See: `PGADMIN_SETUP_GUIDE.md` for detailed instructions

---

**That's it! Your database is ready! 🎉**
