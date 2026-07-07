# Mini ERP — API Documentation

Base URL: `http://localhost:5000/api/v1` (or your deployed backend URL + `/api/v1`)

## Conventions

**Every response** is wrapped in a consistent envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { "...": "..." },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
`meta` is only present on paginated list endpoints.

**Errors** follow the same envelope shape with `success: false`:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "path": "body.email", "message": "Invalid email address" }]
}
```

**Authentication**: send `Authorization: Bearer <accessToken>` on every protected route (all routes except `POST /auth/login` and `POST /auth/refresh`).

**Permissions**: routes are additionally gated by permission strings (e.g. `product:read`). A user without the required permission gets `403 Forbidden`. See the backend README for the default role → permission mapping.

---

## Auth

### `POST /auth/login`
Public.

**Body**
```json
{ "email": "admin@miniERP.com", "password": "Admin@12345" }
```

**Response `200`**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "665...",
      "name": "Super Admin",
      "email": "admin@miniERP.com",
      "role": "Admin",
      "permissions": ["product:read", "product:create", "...", "role:manage"]
    }
  }
}
```

### `POST /auth/refresh`
Public. Exchanges a valid refresh token for a new access/refresh token pair.

**Body**
```json
{ "refreshToken": "eyJ..." }
```

### `POST /auth/logout`
Protected. Invalidates the current session (bumps `tokenVersion`).

### `GET /auth/me`
Protected. Returns the current authenticated user's profile.

---

## Users (Admin only — `role:manage`)

Manager and Employee accounts are provisioned here since there is no public registration.

### `GET /users`
Returns all user accounts (password field excluded).

### `GET /users/:id`
Returns a single user by id.

### `POST /users`
**Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "role": "Manager"
}
```
`role` must match an existing `Role.name` (`Admin`, `Manager`, `Employee`, or any custom role created in the DB).

### `PATCH /users/:id`
**Body** (all fields optional)
```json
{ "name": "Jane D.", "role": "Employee", "isActive": true, "password": "NewPass123" }
```

### `DELETE /users/:id`
Soft-deactivates the account (`isActive: false`) and invalidates existing sessions. Does not hard-delete, to preserve audit history.

---

## Products

Permissions: `product:read` (GET), `product:create` (POST), `product:update` (PATCH), `product:delete` (DELETE).

### `GET /products`
Query params (all optional):

| Param | Example | Description |
|---|---|---|
| `search` | `search=onion` | matches name/SKU |
| `category` | `category=Food` | exact match |
| `page` | `page=2` | default `1` |
| `limit` | `limit=10` | default `10` |
| `sort` | `sort=-createdAt` | `-` prefix = descending |

**Response**: paginated array of products (see `meta`).

### `GET /products/:id`
Single product.

### `POST /products`
`Content-Type: multipart/form-data`. **Image is required on create.**

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `sku` | string | yes |
| `category` | string | yes |
| `price` | number | yes (selling price) |
| `costPrice` | number | no (purchase price) |
| `stock` | number | yes |
| `lowStockThreshold` | number | no |
| `unit` | string | no |
| `description` | string | no |
| `images` | file(s) | yes on create — field name `images`, up to 5 |

### `PATCH /products/:id`
Same fields as create, all optional. `multipart/form-data` if replacing images. `removeImages` (comma-separated public IDs or array) removes existing images.

### `PATCH /products/:id/stock`
Manually adjust stock (e.g. restock). 
```json
{ "quantity": 50 }
```

### `PATCH /products/:id/restore`
Restores a soft-deleted product.

### `DELETE /products/:id`
Soft delete (sets `isActive: false`).

---

## Customers

Permissions: `customer:read`, `customer:create`, `customer:update`, `customer:delete`.

### `GET /customers`
Query params: `search` (name/phone), `page`, `limit`, `sort`.

### `POST /customers`
```json
{ "name": "John Smith", "phone": "01700000000", "email": "john@example.com", "address": "Dhaka" }
```
`phone` and `name` required; `email`/`address` optional.

### `PATCH /customers/:id`
Same fields, all optional.

### `PATCH /customers/:id/restore`
Restores a soft-deleted customer.

### `DELETE /customers/:id`
Soft delete.

---

## Sales

Permissions: `sale:read` (GET), `sale:create` (POST + refund).

### `GET /sales`
Query params: `page`, `limit`, `sort`.

### `GET /sales/:id`
Single sale with populated customer and line items.

### `POST /sales`
Runs inside a MongoDB transaction: validates stock availability for every line item, decrements stock, computes totals, and persists the sale atomically. Emits a `newSale` socket event (and `lowStockAlert` if any affected product drops below its threshold).

```json
{
  "customer": "665f1...",
  "items": [
    { "product": "665f2...", "quantity": 3 },
    { "product": "665f3...", "quantity": 1 }
  ],
  "discount": 50,
  "tax": 20,
  "paymentMethod": "cash"
}
```
`paymentMethod` is one of `cash | card | mobile_banking | bank_transfer` (optional, defaults to `cash`). Returns `400` if any product has insufficient stock — no partial deduction occurs.

**Response** includes `invoiceNumber` (format `INV-YYYYMMDD-XXXX`), `subtotal`, `discount`, `tax`, `grandTotal`, and the line items.

### `PATCH /sales/:id/refund`
Reverses a sale: restores stock for each line item and reverses the customer's running total. Bonus feature, not in the original spec.

---

## Dashboard

Permission: `dashboard:read` (Admin, Manager, and Employee by default).

### `GET /dashboard/stats`
```json
{
  "totalProducts": 24,
  "totalCustomers": 12,
  "totalSales": 37,
  "totalRevenue": 360205,
  "lowStockCount": 3,
  "lowStockProducts": [
    { "_id": "...", "name": "Onion", "sku": "ONI-ON", "stock": 2, "category": "Food" }
  ],
  "topSellingProducts": [
    { "productId": "...", "name": "Onion", "sku": "ONI-ON", "unitsSold": 26, "revenue": 16900 }
  ],
  "salesOverview": {
    "totalSalesCount": 37,
    "totalGrandTotal": 360205,
    "totalDiscount": 1200,
    "totalTax": 800,
    "averageOrderValue": 9735.27
  }
}
```
`totalRevenue` is **all-time**. `lowStockProducts` uses a fixed threshold (stock < 5) per the spec, independent of a product's own `lowStockThreshold` field.

### `GET /dashboard/revenue-trend?days=7`
Bonus endpoint powering the frontend chart. `days` optional, default `7`.
```json
[
  { "date": "2026-07-01", "revenue": 22000, "orders": 3 },
  { "date": "2026-07-02", "revenue": 25500, "orders": 4 }
]
```
Only includes days within the requested window — this is why it can differ from the all-time `totalRevenue` figure on `/dashboard/stats`.

---

## HTTP status codes used

| Code | Meaning |
|---|---|
| `200` | success (GET/PATCH/DELETE) |
| `201` | resource created (POST) |
| `400` | validation error / bad request (e.g. insufficient stock) |
| `401` | missing/invalid/expired access token |
| `403` | authenticated but missing the required permission |
| `404` | resource not found |
| `409` | conflict (e.g. duplicate email/SKU) |
| `500` | unexpected server error |

## Postman / testing

Import the base URL above and set an `Authorization` header with the token returned from `/auth/login`. Refresh tokens rotate on every `/auth/refresh` call.
