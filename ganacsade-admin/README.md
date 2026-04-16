# 🛍️ GANACSADE Admin Dashboard

**A comprehensive admin dashboard for the GANACSADE e-commerce platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Available Pages](#available-pages)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)

---

## 🌟 Overview

This admin dashboard is specifically designed to manage the GANACSADE e-commerce platform. It integrates directly with the existing Flutter mobile app's Node.js backend API and provides comprehensive tools for:

- Managing products, orders, and inventory
- Customer management
- Multi-language content (English, Somali, Arabic)
- Analytics and reporting
- Real-time order tracking
- Featured products and flash sales management

---

## ✨ Features

### Core Modules

- **Dashboard Overview** - Sales analytics, order statistics, and quick insights
- **Order Management** - View, update status, track, and process orders
- **Product Management** - CRUD operations with multi-language support
- **Category Management** - Hierarchical category structure
- **User Management** - Customer accounts and activity tracking
- **Brand Management** - Manage product brands
- **Featured Products** - Control homepage featured items
- **Flash Sales** - Time-limited deals and promotions
- **Advertisements** - Banner and promotional content management
- **Transactions** - Payment tracking and refunds

### Technical Features

- ✅ **Responsive Design** - Mobile, tablet, and desktop support
- ✅ **Dark Mode Ready** - Built-in theme switching capability
- ✅ **TypeScript** - Full type safety
- ✅ **Server Components** - Optimized performance with Next.js 14
- ✅ **API Integration** - Complete REST API client
- ✅ **Form Validation** - React Hook Form + Zod
- ✅ **Data Tables** - TanStack Table with sorting and filtering
- ✅ **Toast Notifications** - User feedback with Sonner
- ✅ **Modern UI** - shadcn/ui components

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 16.0.0 |
| **React** | UI library | 19.2.0 |
| **TypeScript** | Type safety | ^5 |
| **Tailwind CSS** | Styling | ^4 |
| **shadcn/ui** | UI components | Latest |
| **Radix UI** | Headless components | Latest |
| **React Hook Form** | Form handling | ^7.65.0 |
| **Zod** | Schema validation | ^4.1.12 |
| **Zustand** | State management | ^5.0.8 |
| **Axios** | HTTP client | ^1.12.2 |
| **Recharts** | Data visualization | ^3.3.0 |
| **Sonner** | Toast notifications | ^2.0.7 |
| **TanStack Table** | Data tables | ^8.21.3 |
| **date-fns** | Date utilities | ^4.1.0 |
| **Lucide React** | Icons | ^0.546.0 |

---

## 📁 Project Structure

```
ganacsade-admin/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (auth)/               # Authentication pages
│   │   │   └── login/            # Login page
│   │   ├── (dashboard)/          # Dashboard pages
│   │   │   ├── orders/           # Order management
│   │   │   ├── products/         # Product management
│   │   │   ├── categories/       # Category management
│   │   │   ├── users/            # User management
│   │   │   ├── brands/           # Brand management
│   │   │   ├── featured/         # Featured products
│   │   │   ├── flash-sales/      # Flash sales
│   │   │   ├── advertisements/   # Ad management
│   │   │   ├── transactions/     # Transaction tracking
│   │   │   ├── settings/         # Settings
│   │   │   └── layout.tsx        # Dashboard layout
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── forms/                # Form components
│   │   ├── tables/               # Table components
│   │   └── charts/               # Chart components
│   ├── lib/
│   │   ├── api/                  # API integration
│   │   │   ├── client.ts         # Axios client setup
│   │   │   ├── auth.ts           # Auth API
│   │   │   ├── products.ts       # Products API
│   │   │   ├── orders.ts         # Orders API
│   │   │   ├── categories.ts     # Categories API
│   │   │   ├── users.ts          # Users API
│   │   │   └── dashboard.ts      # Dashboard API
│   │   ├── utils/                # Utility functions
│   │   ├── validations/          # Zod schemas
│   │   └── hooks/                # Custom hooks
│   └── types/                    # TypeScript definitions
│       ├── product.ts
│       ├── order.ts
│       ├── category.ts
│       ├── user.ts
│       ├── common.ts
│       └── index.ts
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (default: `http://localhost:3000/api`)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd ganacsade-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_NAME=GANACSADE Admin
   ```
   
   See `ENV_SETUP.md` for detailed configuration.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=GANACSADE Admin

# Optional: Production API
# NEXT_PUBLIC_API_URL=https://api.ganacsade.com/api
```

**Important:** Never commit `.env.local` to version control!

---

## 📄 Available Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Dashboard overview with analytics | ✅ Ready |
| `/login` | Admin authentication | ✅ Ready |
| `/orders` | Order management and tracking | ✅ Ready |
| `/products` | Product catalog management | ✅ Ready |
| `/categories` | Category hierarchy management | ✅ Ready |
| `/users` | Customer account management | ✅ Ready |
| `/brands` | Brand management | 🔨 Template |
| `/featured` | Featured products control | 🔨 Template |
| `/flash-sales` | Flash sales management | 🔨 Template |
| `/advertisements` | Banner/ad management | 🔨 Template |
| `/transactions` | Payment and transaction tracking | 🔨 Template |
| `/settings` | Application settings | 🔨 Template |

---

## 🔌 API Integration

### Backend Requirements

The admin dashboard expects the following API endpoints:

#### Authentication
```
POST   /admin/auth/login       - Admin login
POST   /admin/auth/logout      - Admin logout
GET    /admin/auth/profile     - Get admin profile
```

#### Products
```
GET    /admin/products         - List products (with pagination)
GET    /admin/products/:id     - Get single product
POST   /admin/products         - Create product
PUT    /admin/products/:id     - Update product
DELETE /admin/products/:id     - Delete product
PATCH  /admin/products/bulk-update - Bulk update products
POST   /admin/products/upload-image - Upload product image
```

#### Orders
```
GET    /admin/orders           - List orders (with filters)
GET    /admin/orders/:id       - Get single order
PATCH  /admin/orders/:id/status - Update order status
POST   /admin/orders/:id/refund - Process refund
POST   /admin/orders/:id/cancel - Cancel order
```

#### Categories
```
GET    /admin/categories       - List categories
GET    /admin/categories/:id   - Get single category
POST   /admin/categories       - Create category
PUT    /admin/categories/:id   - Update category
DELETE /admin/categories/:id   - Delete category
PATCH  /admin/categories/reorder - Reorder categories
```

#### Users
```
GET    /admin/users            - List users
GET    /admin/users/:id        - Get single user
PATCH  /admin/users/:id        - Update user status
GET    /admin/users/:id/orders - Get user orders
GET    /admin/users/export     - Export users to CSV
```

#### Analytics
```
GET    /admin/analytics/dashboard    - Dashboard stats
GET    /admin/analytics/sales        - Sales data
GET    /admin/analytics/top-products - Top selling products
GET    /admin/analytics/recent-orders - Recent orders
```

### API Client Usage

```typescript
import { productsApi, ordersApi, usersApi } from '@/lib/api';

// Get products
const response = await productsApi.getProducts({ page: 1, limit: 20 });

// Update order status
await ordersApi.updateOrderStatus({
  orderId: "123",
  status: "processing",
  notes: "Order is being prepared"
});

// Get user details
const user = await usersApi.getUser("user-id");
```

---

## 💻 Development

### Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Adding New Pages

1. Create page in `src/app/(dashboard)/[page-name]/page.tsx`
2. Add route to sidebar in `src/components/dashboard/sidebar.tsx`
3. Implement API calls in `src/lib/api/[feature].ts`
4. Add types in `src/types/[feature].ts`

### Adding shadcn/ui Components

```bash
# Example: Add a new dialog component
npx shadcn@latest add dialog
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Environment Variables on Vercel**
   
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
   NEXT_PUBLIC_APP_NAME=GANACSADE Admin
   ```

### Manual Deployment

```bash
# Build the application
npm run build

# The output will be in .next folder
# Deploy .next folder to your hosting provider
```

---

## 📚 Additional Resources

- **Flutter App Analysis**: See `FLUTTER_APP_ANALYSIS_REPORT.md` for complete backend architecture
- **Environment Setup**: See `ENV_SETUP.md` for configuration details
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui Documentation**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

---

## 🤝 Support

For issues or questions:
- Check the Flutter app analysis report for API details
- Review the type definitions in `/src/types`
- Inspect the API client implementation in `/src/lib/api`

---

## 📝 License

This project is part of the GANACSADE e-commerce platform.

---

**Built with ❤️ for the Somali community**
