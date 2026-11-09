# Nexora Mart — Multi-Store Management System

Nexora Mart is an enterprise-grade retail and wholesale management platform tailored for diverse business verticals. Built with a high-performance **FastAPI (Python 3.13)** backend and a responsive, modular **React Native (0.75)** mobile application, it enables single and multi-merchant operations while enforcing strict multi-tenant store isolation, automated session lifecycles, and store-specific product schemas.

---

## 1. Supported Store Types

Nexora Mart dynamically configures validation schemas, measurement units, and product attributes based on the store's vertical. Eight core store types are supported out of the box:

| # | Display Name | Stable Code | Primary Domain Attributes |
|---|--------------|-------------|---------------------------|
| 1 | Grocery Store | `grocery` | Batch number, Expiry date, FSSAI license, Organic indicator |
| 2 | Clothing Store | `clothing` | Brand, Size, Color, Fabric, Gender category |
| 3 | Medical / Pharmacy Store | `medical` | Generic name, Strength, Dosage form, Batch, Expiry, Prescription flag, Manufacturer |
| 4 | Mobile & Electronics Store | `mobile_electronics` | Brand, Model, Warranty period (months), IMEI/Serial, RAM/Storage |
| 5 | Plastic Store | `plastic` | Plastic type (PP, HDPE, PET), Volume/Capacity, Dimensions, Food-grade flag |
| 6 | Handloom Store | `handloom` | Fabric type, Weave technique, Pattern, Artisan region, Dimensions |
| 7 | Furniture Store | `furniture` | Material (Teak, Sheesham, Engineered), Finish, Room type, Warranty (years), Assembly |
| 8 | Agro Store | `agro` | Crop category, Seed variety, Active ingredient, Batch, Expiry, NPK ratio |

> **Note**: Display names can be customized via the database or API without affecting internal business logic, which relies strictly on immutable stable codes.

---

## 2. Core Architecture & Highlights

```
+-------------------------------------------------------------+
|                React Native Mobile Application              |
|   (TypeScript, React Navigation, Axios Auth Queue, Metro)   |
+-------------------------------------------------------------+
                              |
                     HTTPS / JWT Bearer
                              v
+-------------------------------------------------------------+
|                     FastAPI API Server                      |
|       (Routers: /api and /api/v1, Auth, Rate Limiter)       |
+-------------------------------------------------------------+
                              |
               SQLAlchemy 2.0 ORM + Alembic
                              v
+-------------------------------------------------------------+
|               Relational Database Tier                      |
|         MySQL / MariaDB (Local SQLite Fallback)             |
+-------------------------------------------------------------+
```

- **Strict Multi-Tenant Isolation**: Store owners and staff can only access data belonging to their verified `store_id`. Cross-store queries result in immediate `403 Forbidden` responses.
- **Dual-Token Session Lifecycle**:
  - Access Token: Short-lived (`15 minutes`) JWT carrying authenticated identity claims.
  - Refresh Token: Long-lived cryptographically secure token (`15 hours` absolute ceiling).
  - Rotation: Refresh tokens rotate on every refresh; revocation on logout removes server-side session credentials.
- **Store-Type Registry**: Clean backend strategy modules and frontend schema hooks enforce type-specific validation rules without complex, brittle `if/else` ladders.
- **Unified 11-Module Business Workflow**: Home Dashboard, Make Bill, View Bill, Product Catalog, Debit Customer (Khata), Supplier Management ("Supper"), Orders, Store Expenses, Employee Roster, Sales Analytics, and Store Settings / Account.

---

## 3. Quick Start Guide

### Prerequisites
- **Python**: Version 3.10+ (Tested on Python 3.13)
- **Node.js**: Version 18+ & npm / npx
- **Database**: MySQL 8.0+ or SQLite local mirror (`nmart_local.db`)
- **Android SDK**: Build-tools 34+, Android 10+ (API 29+) device or emulator

---

### Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Activate Virtual Environment**:
   - Windows PowerShell:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - Linux / macOS:
     ```bash
     source .venv/bin/activate
     ```

3. **Configure Environment Variables (`backend/.env`)**:
   ```ini
   PORT=8000
   DATABASE_URL=sqlite:///./nmart_local.db
   SECRET_KEY=supersecretjwtkey_nexora_mart_2026_production
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_HOURS=15
   JWT_ISSUER=nexora-mart-api
   JWT_AUDIENCE=nexora-mart-app
   ```

4. **Run Database Migrations & Seed Store Types**:
   ```bash
   alembic upgrade head
   python -c "from app.database import SessionLocal; from app.services.seed_service import seed_store_types; db = SessionLocal(); seed_store_types(db); db.close()"
   ```

5. **Start the API Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   API interactive documentation is available at `http://localhost:8000/docs`.

---

### Mobile App Setup

1. **Navigate to the React Native App**:
   ```bash
   cd react-native-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Base URL (`src/constants/config.ts`)**:
   ```typescript
   export const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Android Emulator
   // Or 'http://<YOUR_LAN_IP>:8000/api' for physical devices
   ```

4. **Run TypeScript Check & Test Bundle**:
   ```bash
   npm run lint             # Runs tsc --noEmit (zero errors)
   npm run bundle:android   # Verifies JavaScript bundling
   ```

5. **Launch on Android**:
   ```bash
   npm run android
   ```

---

## 4. Documentation Index

For detailed guides, please refer to the comprehensive manuals in the `docs/` directory:

- [System Architecture](ARCHITECTURE.md) — High-level architecture, module decomposition, and tenancy models.
- [Database & Schema](DATABASE.md) — Entity-relationship models, tables, indexes, and Alembic migrations.
- [Authentication & Sessions](AUTHENTICATION.md) — 15-min access / 15-hr refresh lifecycle, rotation, and cryptographic hashing.
- [REST API Reference](API_REFERENCE.md) — Full endpoint reference with requests, responses, and status codes.
- [Frontend Mobile Architecture](FRONTEND.md) — React Native navigation, state management, and Axios interceptors.
- [Store Types & Dynamic Schemas](STORE_TYPES.md) — Attribute specifications and validators for all 8 business verticals.
- [Routing & Middleware](ROUTING.md) — API routing tree, dependency injection, and React Navigation routes.
- [Security & Isolation Matrix](SECURITY.md) — BOLA prevention, password hashing, and cross-store isolation proofs.
- [Implementation & Verification Plan](IMPLEMENTATION_PLAN.md) — Historical development logs, test runs, and test suites.

---

## 5. Verification & Test Suite

Run the full end-to-end multi-store test suite:
```bash
python backend/tests/run_all_tests.py
```

Expected output:
```text
============================================================
RUNNING COMPLETE NEXORA MART MULTI-STORE TEST SUITE
============================================================
--- Suite 1: Authentication & Token Lifecycle --- [PASS]
--- Suite 2: Store Isolation & Security Access Control --- [PASS]
--- Suite 3: 8 Store Types & Dynamic Product Schemas --- [PASS]
--- Suite 4: Multi-Category Integration Flow --- [PASS]
============================================================
ALL TESTS PASSED SUCCESSFULLY! (4 / 4 Suites Verified)
============================================================
```

