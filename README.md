# Mini ERP — Inventory & Sales Management System API

Backend API for a full-stack MERN-based ERP system used to manage products, customers, sales, and users with dynamic role-based access control.

## Overview

Mini ERP is a modular Inventory & Sales Management System built with Node.js, Express, TypeScript, MongoDB, and JWT authentication. The system supports product management, customer management, transactional sales processing, dashboard analytics, real-time events, and database-driven role & permission management.

### Core Features

* JWT Authentication (Access + Refresh Tokens)
* Dynamic Role & Permission Management
* Product CRUD with Cloudinary Image Upload
* Customer Management
* Transactional Sales Processing
* Real-time Socket.IO Events
* Dashboard Analytics
* Search, Filter, Sort & Pagination
* Soft Delete & Restore Support
* User Management (Admin Only)
* Global Error Handling
* Modular Feature-Based Architecture

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* MongoDB + Mongoose
* JWT Authentication
* Zod Validation
* Cloudinary
* Socket.IO

---

## Architecture

```text
src/
├── config/          # db connection, env loader, cloudinary, socket.io setup
├── middlewares/     # auth, permission, validation, global error handler
├── modules/
│   ├── auth/        # login, refresh, logout, /me
│   ├── user/        # user + role management
│   ├── product/     # product CRUD, image upload, stock adjustment
│   ├── customer/    # customer CRUD
│   ├── sale/        # sale creation, refund
│   └── dashboard/   # analytics & reports
├── routes/          # central route mounting
├── types/           # shared types
├── utils/           # ApiError, ApiResponse, QueryBuilder
├── app.ts
├── server.ts
└── seed.ts
```

---

## Key Architectural Decisions

### Dynamic Role & Permission Management

Roles are stored in the database rather than hardcoded.

Example permissions:

```text
product:read
product:create
product:update
product:delete

customer:read
customer:create
customer:update
customer:delete

sale:read
sale:create

dashboard:read

role:manage
```

Permissions are validated through middleware, allowing role updates without code changes.

---

### Generic QueryBuilder

Reusable utility supporting:

* Search
* Filtering
* Sorting
* Pagination

Used across Product, Customer, and Sales modules.

---

### Consistent API Responses

Success:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed"
}
```

---

### Transactional Sales

Sales are processed using MongoDB transactions.

The system:

1. Validates stock
2. Deducts inventory
3. Creates sale record
4. Commits transaction

If any step fails, everything is rolled back automatically.

---

### Real-Time Updates

Socket.IO emits:

```text
newSale
lowStockAlert
```

Connected dashboards receive live updates instantly.

---

## Default Roles

| Role     | Permissions                                           |
| -------- | ----------------------------------------------------- |
| Admin    | Full system access including user & role management   |
| Manager  | Manage products, customers, sales, dashboard          |
| Employee | Read products/customers, create sales, view dashboard |

Roles are stored in MongoDB and can be modified without changing application code.

---

## User Management

Public registration is intentionally disabled.

Only Admin users can create:

* Manager Accounts
* Employee Accounts

Endpoint access is protected by:

```text
role:manage
```

permission.

---

## Prerequisites

* Node.js 18+
* MongoDB
* Cloudinary Account

---

## Installation

```bash
npm install
cp .env.example .env
```

---

## Environment Variables

```env
NODE_ENV=development
PORT=5000

MONGO_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=55m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=http://localhost:5173

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@miniERP.com
ADMIN_PASSWORD=Admin@12345
```

---

## Database Seeding

Create default roles and first Admin account:

```bash
npx ts-node src/seed.ts
```

This command safely:

* Creates Admin role
* Creates Manager role
* Creates Employee role
* Creates first Admin user (if not exists)

Default Admin Credentials:

```text
Email: admin@miniERP.com
Password: Admin@12345
```

Can be overridden using:

```env
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## Running the Application

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

API Base URL:

```text
http://localhost:5000/api/v1
```

---

## API Features

### Authentication

* Login
* Refresh Token
* Logout
* Current User Profile

### Users

* Create User
* Update User
* Deactivate User
* List Users

(Admin Only)

### Products

* Create Product
* Update Product
* Delete Product
* Restore Product
* Stock Adjustment
* Search & Pagination
* Cloudinary Image Upload

### Customers

* Create Customer
* Update Customer
* Delete Customer
* Restore Customer

### Sales

* Create Sale
* View Sales
* Refund Sale
* Invoice Generation

### Dashboard

* Overall Statistics
* Revenue Analytics
* Top Selling Products
* Low Stock Alerts

---

## Bonus Features Implemented

* Dynamic Database-Driven RBAC
* Modular Feature-Based Architecture
* Generic QueryBuilder
* Global Error Handling
* Socket.IO Real-Time Events
* Refund Workflow
* Soft Delete & Restore
* Cloudinary Integration

---

## Deployment

Supported Platforms:

* Render
* Railway
* Fly.io
* VPS
* Docker-Based Hosts

Deployment Checklist:

1. Configure environment variables
2. Connect MongoDB Atlas
3. Set correct CLIENT_URL
4. Deploy application
5. Run seed script once

```bash
npx ts-node src/seed.ts
```

after deployment.

---

## HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Validation Error      |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

## Project Highlights

* Enterprise-style architecture
* Type-safe TypeScript codebase
* Database-driven permissions
* Transaction-safe inventory operations
* Real-time dashboard updates
* Scalable module organization
* Production-ready backend foundation
