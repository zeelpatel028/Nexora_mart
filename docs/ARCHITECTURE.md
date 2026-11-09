# Nexora Mart — System Architecture

This document describes the high-level architecture, design patterns, multi-tenancy model, and component interactions of the Nexora Mart platform.

---

## 1. System Topology & Tier Decomposition

Nexora Mart follows a decoupled, three-tier enterprise architecture consisting of a presentation layer (React Native), an application service tier (FastAPI), and a persistence layer (SQLAlchemy + Relational DB).

```
+-------------------------------------------------------------------------+
|                          PRESENTATION LAYER                             |
|                        React Native Mobile App                          |
|  +------------------------+  +--------------------+  +---------------+  |
|  | Screen Components      |  | Navigation Stack   |  | StoreContext  |  |
|  | (11 Business Modules)  |  | & Drawer (11 Items)|  | & AuthContext |  |
|  +------------------------+  +--------------------+  +---------------+  |
|  +-------------------------------------------------------------------+  |
|  | Axios HTTP Client (Automatic Refresh Queue, Token Interceptors)   |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTPS / JSON (Bearer Token)
                                    v
+-------------------------------------------------------------------------+
|                          APPLICATION API TIER                           |
|                         FastAPI Python Backend                          |
|  +-------------------------------------------------------------------+  |
|  | Security Middleware, CORS, Exception Handlers, SlowApi Limiter    |  |
|  +-------------------------------------------------------------------+  |
|  | API Routing Layer (/api & /api/v1):                               |  |
|  | /auth, /store-types, /stores, /products, /bills, /orders,         |  |
|  | /expenses, /employees, /customers, /suppliers, /analytics         |  |
|  +-------------------------------------------------------------------+  |
|  | Controller & Service Layer:                                       |  |
|  | - AuthService (Register, Login, Session Refresh, Revoke)         |  |
|  | - StoreService (Ownership verification, Current store context)   |  |
|  | - ProductService (Dynamic attribute validation via Registry)     |  |
|  | - Billing, Order, Expense, and Analytics Services                 |  |
|  +-------------------------------------------------------------------+  |
|  | Strategy Pattern Engine:                                          |  |
|  | StoreTypeRegistry (Grocery, Clothing, Medical, Electronics, etc.) |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | SQLAlchemy 2.0 ORM / Connection Pool
                                    v
+-------------------------------------------------------------------------+
|                           PERSISTENCE TIER                              |
|                       Relational Database Layer                         |
|  +-------------------------------------------------------------------+  |
|  | Primary: Cloud MySQL / MariaDB (Aiven Managed Cluster)            |  |
|  | Fallback: Local SQLite Mirror (Robust Offline/Sandbox Resiliency) |  |
|  +-------------------------------------------------------------------+  |
|  | Tables: users, store_types, stores, refresh_tokens, products,     |  |
|  | customers, suppliers, bills, bill_items, store_expenses, etc.     |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Multi-Store Tenancy Model

Nexora Mart adopts a **Row-Level Shared-Database Multi-Tenancy Model** scoped by `store_id`.

### Tenancy Principles
1. **User-to-Store Association**:
   - Each authenticated user owns or operates a store record (`stores.user_id -> users.id`).
   - The user's operational vertical is derived from their store's `store_type_id -> store_types.id`.
2. **Authoritative Authorization**:
   - The client application **never** dictates tenant access by passing an arbitrary `store_id`.
   - The backend dependency `get_current_user` extracts the caller identity from the cryptographically verified JWT (`sub` claim).
   - `get_user_store(db, user_id)` resolves the authorized store record. If a request explicitly contains a `store_id` parameter (e.g. in route paths or query params), the service cross-verifies ownership:
     ```python
     if store.user_id != user.id:
         raise HTTPException(status_code=403, detail="Unauthorized access to this store")
     ```
3. **Database Scoping**:
   - Every business record (product, customer, supplier, invoice, expense, employee, order) has a mandatory foreign key `store_id`.
   - All queries executed by services strictly append `.filter(Model.store_id == current_store.id)`.

---

## 3. Store-Type Strategy Pattern (Dynamic Schemas)

Rather than maintaining scattered, unmaintainable `if-else` blocks throughout controllers and models, Nexora Mart employs the **Strategy Pattern** across both backend and frontend.

### Backend Strategy Architecture
Located in `backend/app/store_types/`:
- `BaseStoreType`: Abstract base class defining `code`, `name`, `default_units`, and the contract `validate_product_attributes(attributes: dict) -> Tuple[bool, Optional[str]]`.
- Concrete Implementations:
  - `GroceryStoreType` (`grocery`)
  - `ClothingStoreType` (`clothing`)
  - `MedicalStoreType` (`medical`)
  - `MobileElectronicsStoreType` (`mobile_electronics`)
  - `PlasticStoreType` (`plastic`)
  - `HandloomStoreType` (`handloom`)
  - `FurnitureStoreType` (`furniture`)
  - `AgroStoreType` (`agro`)
- `StoreTypeRegistry`: Central catalog providing `get(code)` lookup with case-insensitive matching and alias resolution.

```
       +--------------------+
       |   BaseStoreType    |
       +--------------------+
                 ^
                 | inherits
     +-----------+-----------+ ...
     |                       |
+-------------+       +---------------+
| GroceryType |  ...  |  MedicalType  |
+-------------+       +---------------+
```

### Dynamic Validation Execution
When creating or updating a product:
1. `ProductService` queries the store's associated `StoreType.code`.
2. Resolves the concrete strategy from `StoreTypeRegistry.get(code)`.
3. Executes `strategy.validate_product_attributes(product_data.attributes)`.
4. If validation fails, an HTTP `422 Unprocessable Entity` or `400 Bad Request` is returned with precise validation error messaging.

---

## 4. Dual-Token Session Lifecycle Architecture

Nexora Mart implements a secure token architecture preventing token theft, infinite session extension, and unauthorized replay.

```
+------------+               +---------------+               +---------------+
|   Client   |               |  Auth Server  |               |  Database     |
+------------+               +---------------+               +---------------+
      |                              |                               |
      | 1. POST /auth/login          |                               |
      |----------------------------->|                               |
      |                              |-- Validate bcrypt hash        |
      |                              |-- Generate JWT (15-min exp)   |
      |                              |-- Generate Refresh Token      |
      |                              |-- Hash refresh token (SHA256) |
      |                              |-- Insert into refresh_tokens  |
      |                              |------------------------------>|
      | 2. Return Tokens + Profile   |                               |
      |<-----------------------------|                               |
      |                              |                               |
      | [After 15 minutes: 401]      |                               |
      | 3. POST /auth/refresh        |                               |
      |----------------------------->|                               |
      |                              |-- Verify refresh token hash   |
      |                              |-- Verify session < 15 hours   |
      |                              |-- Revoke old refresh token    |
      |                              |-- Issue new access & refresh  |
      | 4. Return Rotated Tokens     |                               |
      |<-----------------------------|                               |
```

- **Access Token**: Short-lived (`15 minutes`) containing minimal claims: `sub` (user_id), `sid` (session_id), `iat`, `exp`, `iss`, `aud`.
- **Refresh Token**: High-entropy cryptographically random string (stored exclusively as a SHA-256 hash in `refresh_tokens`).
- **15-Hour Absolute Ceiling**: Unlike rolling sessions that refresh indefinitely, Nexora Mart enforces an absolute session limit of 15 hours from initial login. When `session_created_at + 15 hours` is exceeded, the session is terminated and cannot be refreshed.
- **Token Rotation**: Every successful call to `POST /auth/refresh` immediately revokes the consumed refresh token and issues a new one.

---

## 5. Frontend Architecture & Mobile Navigation

The React Native application (`react-native-app/`) is architected for predictability, type safety, and offline resilience:

### Layering Structure
1. **API Client (`src/api/apiClient.ts`)**:
   - Axios instance with request and response interceptors.
   - Transparently catches `401 Unauthorized` responses and queues concurrent outgoing requests into a promise buffer while refreshing the access token.
   - Employs a failure count to prevent infinite retry loops.
2. **Context Providers (`src/context/`)**:
   - `AuthContext`: Centralizes current user state, active store metadata, token management, and session restoration.
   - `ThemeContext`: Provides dark/light themes and brand token styling.
3. **Store Types Registry (`src/storeTypes/`)**:
   - Parallels backend strategy with dynamic UI form definitions (`StoreTypeConfig`).
   - Dynamically injects specialized form inputs (switches for booleans, horizontal chips for select/options, numeric keyboards for dimensions/measurements) into product creation and editing screens.
4. **Navigation Hierarchy**:
   - Root Stack: Authentication flow (`Login`, `Register`) vs. Main Drawer Navigation.
   - Main Drawer: Houses the 11 standardized enterprise business modules.

---

## 6. Resilience & Database Fallback

To support development, testing, and network outages, the database connection layer in `backend/app/database.py` features automatic graceful degradation:
- Attempts connection to the primary MySQL/MariaDB database pool.
- Upon operational error or network failure (`Errno 11001`, connection timeout), the system catches the exception, logs a warning, and initializes a local SQLite mirror (`nmart_local.db`).
- All migrations, seeds, and models are fully compatible with both MySQL and SQLite dialect types.

