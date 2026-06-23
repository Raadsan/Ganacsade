# GANACSADE E-Commerce API

Complete Node.js REST API for the GANACSADE e-commerce platform with PostgreSQL database.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the API](#running-the-api)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Testing](#testing)

---

## ✨ Features

### Core Features
- ✅ RESTful API architecture
- ✅ JWT authentication & authorization
- ✅ Role-based access control (Customer, Admin, Delivery Person)
- ✅ PostgreSQL database with connection pooling
- ✅ Multi-language support (EN/SO/AR)
- ✅ File upload (images)
- ✅ Payment gateway integration (WaafiPay, E-dahab, Premier Wallet, Stripe)
- ✅ Email & SMS notifications
- ✅ Rate limiting & security headers
- ✅ Error handling & logging
- ✅ Input validation
- ✅ CORS configuration

### API Endpoints (~90 endpoints)
- **Authentication:** Login, Register, Logout, Profile
- **Admin:** Products, Orders, Users, Categories, Flash Sales, etc.
- **Customer:** Products, Cart, Orders, Profile, etc.
- **Delivery:** Assignments, Status Updates

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Morgan
- **Environment:** dotenv

---

## 📁 Project Structure

```
backend/
├── database/                    # Database migrations and seeds
│   ├── 00_create_database.sql
│   ├── 01_core_tables.sql
│   ├── 02_supporting_tables.sql
│   ├── 03_feature_tables.sql
│   ├── 04_indexes.sql
│   ├── 05_constraints.sql
│   ├── 06_seed_data.sql
│   ├── ER_DIAGRAM.md
│   └── README.md
│
├── src/
│   ├── config/                  # Configuration files
│   │   ├── database.js          # PostgreSQL connection
│   │   └── index.js             # App configuration
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # Authentication middleware
│   │   ├── validate.js          # Validation middleware
│   │   ├── errorHandler.js      # Error handling
│   │   └── notFound.js          # 404 handler
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js       # Authentication routes
│   │   ├── admin/               # Admin routes
│   │   └── customer/            # Customer routes
│   │
│   ├── controllers/             # Route controllers
│   │   ├── auth.controller.js
│   │   ├── admin/
│   │   └── customer/
│   │
│   ├── models/                  # Database models/queries
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── ...
│   │
│   ├── services/                # Business logic
│   │   ├── auth.service.js
│   │   ├── emailService.js
│   │   ├── sms.service.js
│   │   ├── payment.service.js
│   │   └── upload.service.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── jwt.js               # JWT helpers
│   │   ├── password.js          # Password helpers
│   │   └── validators.js        # Custom validators
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
│
├── uploads/                     # File uploads directory
├── logs/                        # Application logs
├── tests/                       # Test files
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

### Steps

1. **Clone the repository**
```bash
cd "d:/Combination Ganacsade/backend"
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Edit .env file with your configuration**
```bash
# Use your preferred text editor
notepad .env
```

---

## ⚙️ Configuration

### Environment Variables

Edit the `.env` file with your settings:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ganacsade_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Payment Gateways (add your API keys)
WAAFIPAY_API_KEY=your_key
EDAHAB_API_KEY=your_key
PREMIER_WALLET_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
```

See `.env.example` for all available options.

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
# Navigate to database folder
cd database

# Run migrations in order
psql -U postgres -f 00_create_database.sql
psql -U postgres -d ganacsade_db -f 01_core_tables.sql
psql -U postgres -d ganacsade_db -f 02_supporting_tables.sql
psql -U postgres -d ganacsade_db -f 03_feature_tables.sql
psql -U postgres -d ganacsade_db -f 04_indexes.sql
psql -U postgres -d ganacsade_db -f 05_constraints.sql
psql -U postgres -d ganacsade_db -f 06_seed_data.sql
```

### 2. Verify Database

```sql
-- Connect to database
\c ganacsade_db

-- List tables
\dt

-- Check seed data
SELECT * FROM users;
SELECT * FROM categories;
```

### Default Credentials (from seed data)

**Admin:**
- Email: admin@ganacsade.com
- Password: admin123

**Delivery Person:**
- Email: ahmed.delivery@ganacsade.com
- Password: delivery123

⚠️ **Change these passwords immediately in production!**

---

## 🏃 Running the API

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Migrations
```bash
npm run migrate
```

### Run Seed Data
```bash
npm run seed
```

The API will be available at:
- **Base URL:** http://localhost:3000
- **API URL:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phoneNumber": "+252612345678",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Admin Endpoints

All admin endpoints require authentication and admin role:
```http
Authorization: Bearer {admin_token}
```

#### Products
- `GET /api/admin/products` - List all products
- `GET /api/admin/products/:id` - Get product details
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

#### Orders
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/:id` - Get order details
- `PATCH /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/orders/:id/assign` - Assign delivery person
- `POST /api/admin/orders/:id/refund` - Refund order

#### Users
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/status` - Update user status

#### Categories
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Customer Endpoints

#### Products (Public)
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products

#### Cart (Protected)
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

#### Orders (Protected)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order

---

## 🔐 Authentication

### JWT Token Authentication

All protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer {your_jwt_token}
```

### Token Expiration
- **Access Token:** 7 days (configurable)
- **Refresh Token:** 30 days (configurable)

### Role-Based Access

- **customer** - Can access customer endpoints
- **admin** - Can access all admin endpoints
- **delivery_person** - Can access delivery endpoints

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm run test:watch
```

---

## 📦 Dependencies

### Production Dependencies
- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **multer** - File upload
- **morgan** - HTTP logging
- **compression** - Response compression
- **dotenv** - Environment variables

### Development Dependencies
- **nodemon** - Auto-reload server
- **jest** - Testing framework
- **supertest** - HTTP testing
- **eslint** - Code linting

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ Environment variable protection

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Support

For support, email support@ganacsade.com

---

**Built with ❤️ for the Somali community**

*Last Updated: November 20, 2025*
