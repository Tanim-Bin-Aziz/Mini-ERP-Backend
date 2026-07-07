# Mini ERP — Inventory & Sales Management System

Full-stack MERN technical assessment project. A small ERP for tracking products, customers, and sales with role-based access control.

- **Backend**: `backend/` — Node.js, Express, TypeScript, MongoDB/Mongoose, JWT auth, Socket.IO
- **Frontend**: `frontend/` — React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, TanStack Query

See `backend/README.md` and `frontend/README.md` for setup instructions specific to each, and `API_DOCUMENTATION.md` for the full API reference.

## Quick start (local development)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env     # fill in MongoDB URI, JWT secrets, Cloudinary credentials
npx ts-node src/seed.ts  # creates default roles + the first Admin account
npm run dev              # http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env     # point VITE_API_BASE_URL at the backend above
npm run dev               # http://localhost:5173
```

Log in with the Admin credentials printed by the seed script (default: `admin@miniERP.com` / `Admin@12345`, unless overridden via `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `backend/.env`).

## Roles

| Role | Can do |
|---|---|
| Admin | Everything — products, customers, sales, dashboard, and user management (create/update/deactivate Manager & Employee accounts) |
| Manager | Manage products & customers, create sales, view dashboard |
| Employee | View products & customers, create sales, view dashboard |

Admin can create/manage Manager and Employee accounts from the **Users** page in the sidebar (visible only to Admin).

## Feature highlights

- JWT auth with silent refresh-token retry on the frontend
- Dynamic, database-driven roles & permissions (not hardcoded)
- Product CRUD with required image upload (Cloudinary), search, pagination
- Sale creation with transactional stock deduction, automatic total calculation, and real-time Socket.IO events
- Dashboard with live stats, low-stock alerts, revenue trend chart, and top-selling products
- CSV and PDF export (including a printable per-sale invoice PDF)
- Dark mode
- Admin user management (bonus)

## Live deployment

| | URL |
|---|---|
| Frontend | _fill in after deploying_ |
| Backend API | _fill in after deploying_ |

## Admin credentials (for evaluation)

```
Email: admin@miniERP.com
Password: Admin@12345
```
(or whatever `ADMIN_EMAIL` / `ADMIN_PASSWORD` were set to in the deployed backend's environment variables)
