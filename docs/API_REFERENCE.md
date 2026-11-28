# Nexora Mart — REST API Reference

This document provides complete documentation for the Nexora Mart REST API. All endpoints are mounted symmetrically at both `/api` and `/api/v1`.

---

## 1. Global Conventions

### Base URLs
- Local Development (Android Emulator): `http://10.0.2.2:8000/api`
- Local Development (Browser / Desktop): `http://localhost:8000/api`
- Production: `https://api.nexoramart.com/api`

### Standard Request Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### Standard Status Codes
| HTTP Status | Meaning | Usage |
|-------------|---------|-------|
| `200 OK` | Success | Successful GET, PATCH, or general command. |
| `201 Created` | Resource Created | Successful POST entity creation. |
| `400 Bad Request` | Invalid Input | Malformed JSON or business logic constraint violation. |
| `401 Unauthorized` | Unauthenticated | Missing, expired, or invalid JWT / refresh token. |
| `403 Forbidden` | Access Denied | Authenticated user lacks access to the requested store tenant. |
| `404 Not Found` | Not Found | Requested entity does not exist or is soft-deleted. |
| `422 Unprocessable` | Validation Error | Pydantic schema failure or dynamic store-type attribute mismatch. |
| `500 Server Error` | Internal Error | Unhandled backend exception. |

---

## 2. Authentication Endpoints

### 2.1. Register User & Store
`POST /auth/register`

Creates a user and their initial store inside a single database transaction. Validates `store_type_id`.

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "store_name": "Doe Organic Grocery",
  "store_type_id": 1,
  "phone": "+1234567890",
  "address": "45 Market St"
}
```

**Success Response (`201 Created`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "nrt_4f89d0a6c8e312b9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 12,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "is_active": true
  },
  "store": {
    "id": 8,
    "name": "Doe Organic Grocery",
    "store_type_id": 1,
    "store_type": {
      "id": 1,
      "code": "grocery",
      "name": "Grocery Store"
    }
  }
}
```

---

### 2.2. Login
`POST /auth/login`

Authenticates credentials and establishes a 15-hour session.

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (`200 OK`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "nrt_9a2b8e3...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 12,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "store": {
    "id": 8,
    "name": "Doe Organic Grocery",
    "store_type_id": 1,
    "store_type": {
      "id": 1,
      "code": "grocery",
      "name": "Grocery Store"
    }
  }
}
```

---

### 2.3. Refresh Session
`POST /auth/refresh`

Rotates the refresh token and issues a new 15-minute access token. Enforces 15-hour session limit.

**Request Body**:
```json
{
  "refresh_token": "nrt_9a2b8e3..."
}
```

**Success Response (`200 OK`)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "nrt_new_token_48c...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": { "id": 12, "name": "Jane Doe", "email": "jane@example.com" },
  "store": { "id": 8, "name": "Doe Organic Grocery" }
}
```

---

### 2.4. Logout
`POST /auth/logout`

Revokes the active refresh token and terminates the server-side session.

**Request Body**:
```json
{
  "refresh_token": "nrt_new_token_48c..."
}
```

**Success Response (`200 OK`)**:
```json
{
  "message": "Successfully logged out"
}
```

---

### 2.5. Current User Profile
`GET /auth/me`

Returns verified user profile, active store, and permissions.

---

## 3. Store Types Endpoints

### 3.1. List Store Types
`GET /store-types`

Returns all active store types for registration and onboarding.

**Query Parameters**:
- `is_active` (`boolean`, optional, default `true`): Filter by active status.

**Success Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "code": "grocery",
    "name": "Grocery Store",
    "description": "Supermarkets, FMCG, organic food, and packaged goods",
    "icon": "basket-outline",
    "is_active": true
  },
  {
    "id": 2,
    "code": "clothing",
    "name": "Clothing Store",
    "description": "Apparel, garments, boutique, and textiles",
    "icon": "shirt-outline",
    "is_active": true
  },
  {
    "id": 3,
    "code": "medical",
    "name": "Medical / Pharmacy Store",
    "description": "Pharmacies, drugstores, and medical supplies",
    "icon": "medkit-outline",
    "is_active": true
  },
  {
    "id": 4,
    "code": "mobile_electronics",
    "name": "Mobile & Electronics Store",
    "description": "Smartphones, computers, audio, and accessories",
    "icon": "phone-portrait-outline",
    "is_active": true
  },
  {
    "id": 5,
    "code": "plastic",
    "name": "Plastic Store",
    "description": "Plastic ware, storage containers, and packaging",
    "icon": "cube-outline",
    "is_active": true
  },
  {
    "id": 6,
    "code": "handloom",
    "name": "Handloom Store",
    "description": "Handcrafted textiles, artisanal fabrics, and crafts",
    "icon": "color-palette-outline",
    "is_active": true
  },
  {
    "id": 7,
    "code": "furniture",
    "name": "Furniture Store",
    "description": "Home and office furniture, fixtures, and decor",
    "icon": "bed-outline",
    "is_active": true
  },
  {
    "id": 8,
    "code": "agro",
    "name": "Agro Store",
    "description": "Seeds, fertilizers, pesticides, and farm equipment",
    "icon": "leaf-outline",
    "is_active": true
  }
]
```

---

## 4. Store Endpoints

### 4.1. Get Current Store
`GET /stores/current`

Returns store profile, category, store type, tax rate, and settings for the authenticated merchant.

### 4.2. Update Current Store
`PATCH /stores/current`

**Request Body**:
```json
{
  "name": "Doe Supermarket & Grocery",
  "phone": "+1987654321",
  "address": "100 Broadway",
  "tax_rate": 5.0
}
```

---

## 5. Products Endpoints

### 5.1. List Products
`GET /products`

Queries products scoped strictly to the current store tenant.

**Query Parameters**:
- `search` (`string`, optional): Search by name, SKU, or barcode.
- `category_id` (`integer`, optional): Filter by category.
- `is_active` (`boolean`, optional, default `true`): Active status.
- `skip` (`integer`, default `0`): Pagination offset.
- `limit` (`integer`, default `50`): Page size.

---

### 5.2. Create Product
`POST /products`

Validates dynamic store-type attributes against the store's vertical strategy before persisting.

**Request Body (Medical Store Example)**:
```json
{
  "name": "Paracetamol 500mg Tablets",
  "selling_price": 4.50,
  "purchase_price": 2.20,
  "mrp": 5.00,
  "unit": "strip",
  "initial_stock": 200,
  "min_stock_level": 25,
  "attributes": {
    "generic_name": "Acetaminophen",
    "dosage_form": "Tablet",
    "strength": "500mg",
    "manufacturer": "HealthPharma Ltd",
    "batch_number": "BAT-2026-X1",
    "expiry_date": "2028-12-31",
    "requires_prescription": false
  }
}
```

**Validation Error Response (`422 Unprocessable Entity`)**:
```json
{
  "detail": "Medical products require 'generic_name' attribute"
}
```

---

## 6. Billing & Invoice Endpoints

### 6.1. Create Bill
`POST /bills`

Generates a point-of-sale customer invoice and updates stock levels atomically.

**Request Body**:
```json
{
  "customer_id": 4,
  "items": [
    {
      "product_id": 15,
      "quantity": 2,
      "unit_price": 4.50,
      "tax_rate": 5.0
    }
  ],
  "payment_method": "cash",
  "discount_amount": 0.50
}
```

---

## 7. Orders Endpoints

- `GET /orders`: List orders scoped by current store.
- `POST /orders`: Place a purchase order or customer special order.
- `GET /orders/{id}`: Detailed view of order items.
- `PATCH /orders/{id}`: Update order status (`pending`, `completed`, `cancelled`).

---

## 8. Store Expenses & Employees

- `GET /expenses` & `POST /expenses`: Track daily shop operational costs.
- `GET /employees` & `POST /employees`: Manage employee roster, roles, and wages.

---

## 9. Analytics & Sales

- `GET /analytics/sales`: Provides daily, weekly, and monthly sales breakdowns, profit margins, and top-selling products.

