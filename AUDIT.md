# TULSI MART – COMPREHENSIVE ARCHITECTURAL AUDIT (AUDIT.md)

**Date:** 2026-11-22  
**Target:** Upgrade Existing React Native (Frontend) + FastAPI (Backend) to Modular Store-Type Architecture  
**Status:** Completed Initial Audit  

---

## 1. EXECUTIVE SUMMARY

Tulsi Mart (formerly Nexora Mart) contains a functional, high-quality base codebase with an active React Native mobile application and a Python FastAPI backend. The existing code features complete authentication lifecycles, POS billing, purchase ordering, ledger tracking, Redis caching, and multi-category data models. 

This audit details the current state, identifies architectural gaps compared to the Master Build Prompt, and defines the non-destructive upgrade plan to restructure both backend and frontend into store-wise modular packages (`grocery_*`) without data loss or feature regression.

---

## 2. WHAT EXISTS & WHAT WORKS

### Backend (Python FastAPI)
- **Framework & Runtime:** FastAPI 0.110+ on Python 3.13 / 3.11 with Uvicorn and Gunicorn support.
- **Test Suite:** 8 comprehensive test suites in `backend/tests/run_all_tests.py` testing auth lifecycle, store isolation, rate limiting (3-attempt lockout), cart/wishlist, caching, reports, and v2 features. **All 8 suites pass cleanly.**
- **Security & Auth:** JWT access tokens (15m expiry) + refresh token rotation (7 days) with argon2/bcrypt password hashing.
- **Brute Force Protection:** 3 failed login attempts trigger an automated 15-minute lockout (HTTP 429) backed by Redis / in-memory tracker.
- **Database Resilience:** SQLAlchemy 2.0 with automatic dual-engine driver support (MySQL `pymysql` cloud connection with immediate fallback to local SQLite WAL database `nmart_local.db`).
- **Billing & POS Engine:** `billing_router.py` and `BillingService` calculate itemized GST (taxable base price + GST amount) and update stock and ledgers inside DB transactions.
- **Purchase Orders:** `orders_router.py` supports order placement with custom purchase pricing, receiving with stock incrementation and batch tracking, and payment logging.
- **Store Prefixes & Sequences:** `store_prefixes_router.py` generates sequence codes like `TM_PRD_0001` and `TM_INV_0001`.
- **Ledgers & Accounting:** Double-entry ledgers for both customers (`customer_ledger`) and suppliers (`supplier_ledger`).

### Frontend (React Native)
- **Framework & Runtime:** React Native 0.75.4 (CLI), TypeScript 5.6.2, Android native build verified (`NexoraMart.apk`).
- **Compilation:** TypeScript compilation (`tsc --noEmit`) passes with **0 errors**.
- **Screens Implemented in `src/screens/`:**
  - `PosBillingScreen.tsx` (1,025 lines): Full POS billing with Walk-in vs Khata mode, barcode/item search, line-item GST calculations, stock checks, and bill generation.
  - `PurchaseOrderScreen.tsx` (843 lines): Purchase order placement, receive order modal, payment modal, and supplier/product search dropdowns.
  - `AddProductScreen.tsx` (535 lines): Product creation with prefix ID preview, supplier quick-add, pricing with GST, stock, and alert toggles.
  - `CustomerListScreen.tsx` & `CustomerDetailScreen.tsx`: Khata customer listing, balances, pending bill filters, and transaction history.
  - `SupplierListScreen.tsx` & `SupplierDetailScreen.tsx`: Supplier management, pending payables, and order tracking.
  - `AccountDetailScreen.tsx` (535 lines): Multi-tab store profile, business details, tax info, and prefix configuration.
  - `SettingsScreen.tsx`: Theme switcher, currency options, invoice template picker, sound toggles, and backup.
  - `DashboardScreen.tsx` & `ReportsScreen.tsx`: Analytics overview and valuation reports.
- **UI & Design System:** Centralized `Colors`, `Typography`, `Spacing`, shimmer skeleton placeholders (`TableSkeleton`, `OrderCardSkeleton`), and Lucide-style SVG icon system.

---

## 3. WHAT IS BROKEN / DEFICIENT

1. **Scaffold Stubs vs Real Screens:**
   - `react-native-app/src/stores/grocery/` contains 15-line stub placeholder files created by earlier scaffolding scripts (e.g. `GroceryBillingScreen.tsx`, `GroceryProductsScreen.tsx`).
   - The production-grade implementations currently reside in `react-native-app/src/screens/`. These must be consolidated and migrated into the prompt's store-wise directory structure (`src/stores/grocery/grocery_*`).
2. **Database Table Naming & Schema Inconsistencies:**
   - Existing tables use a mix of generic names (`products`, `suppliers`, `customers`, `invoices`, `store_prefixes`) and dynamic tables (`grocery_products`, `grocery_invoices`).
   - The Master Build Prompt requires standard `grocery_` tables (`grocery_products`, `grocery_suppliers`, `grocery_purchase_orders`, `grocery_customers`, `grocery_bills`, `grocery_bill_items`, `grocery_prefixes`, `grocery_id_counters`, `grocery_settings`, `grocery_product_batches`, `grocery_stock_movements`, `grocery_backups`, `grocery_gst_rates`, `grocery_units`).
   - ID format in existing code is `TM_{PREFIX}_{NUM}` rather than the specified `{store_code}_{prefix}_{4-digit number}` (e.g., `S001_PRD_0001`).
3. **Prefix Keys & Default Values:**
   - Current `store_prefixes` table uses `invoice_prefix`, `debit_customer_prefix` as columns.
   - The prompt specifies a normalized table `grocery_prefixes` (`id, store_id, key, prefix_value, UNIQUE(store_id, key)`) with 10 standard keys and defaults: `invoice: INV`, `debit_customer: KHT`, `walk_in_customer: WLK`, `supplier: SUP`, `order: ORD`, `product: PRD`, `employee: EMP`, `return: RTN`, `refund: RFD`, `expense: EXP`.
4. **Backend Router & Service Organization:**
   - Backend routes are currently scattered across `app/routes/` and `app/api/v1/`.
   - The prompt requires all grocery code inside `backend/app/stores/grocery/` partitioned by feature: `grocery_product/`, `grocery_supplier/`, `grocery_purchase_order/`, `grocery_billing/`, `grocery_khata_customer/`, `grocery_prefix/`, `grocery_setting/`, `grocery_backup/`, `grocery_lookup/`.

---

## 4. WHAT IS SLOW & PERFORMANCE BOTTLENECKS

1. **N+1 Aggregation Queries:**
   - In `customers_router.py` and `suppliers_router.py`, pending balances and bill counts are computed via Python loops querying `db.query(Invoice)` for each customer individually.
   - **Fix:** Replace with single SQL aggregation queries (`func.count()`, `func.sum()`) grouped by `customer_id` / `supplier_id`.
2. **Missing Composite Database Indexes:**
   - The database requires explicit composite indexes on `(store_id, name)`, `(store_id, product_code)`, `(store_id, supplier_id)` on `grocery_products` and `(store_id, customer_id, payment_status)` on `grocery_bills`.
3. **Redis Caching Granularity:**
   - While Redis client exists and handles caching for reports and cart, grocery products, suppliers, customers, prefixes, and GST rates need automated cache read & write-through with targeted invalidation on mutation.

---

## 5. WHAT IS INSECURE

1. **Store ID Verification Consistency:**
   - Certain legacy routers in `app/routes/` rely only on user token without strictly confirming the user's role and ownership/membership for the queried `store_id`.
   - **Fix:** Standardize `store_access` dependency that enforces `store_id` isolation across all grocery endpoints.
2. **Rate Limiting Middleware:**
   - Auth routes have 3-attempt lockout, but a global Redis-backed sliding-window rate limiter middleware needs to cover all `/api/v1/grocery/*` endpoints.

---

## 6. WHAT IS MISSING COMPARED TO MASTER BUILD PROMPT

1. **Exact 10-Field Add Product Flow:**
   - Product Name
   - Product ID (read-only auto-generated `{store_code}_PRD_0001`)
   - Seller Name (searchable dropdown from suppliers)
   - Purchase Price (with tax)
   - Purchase GST Rate (dropdown)
   - Purchase Unit (dropdown)
   - Selling Price (with tax)
   - Selling Unit (dropdown)
   - Selling GST Rate (dropdown)
   - Available Stock
   - Plus two toggles: Low Stock Alert (with qty field) & Expiry Alert.
2. **Receive Order Modal Flow with Expiry Enforcement:**
   - When product has `expiry_alert_enabled = true`, receiving order requires expiry date input and creates a `grocery_product_batches` record.
3. **Base Price GST Calculation on Bills:**
   - Bills must compute and show Base Price (Price without tax) and GST amount, completely hiding purchase price from the invoice.
4. **Statement Generation as PDF:**
   - Khata Customer Detail and Supplier Detail need "Send Statement" generating a clean PDF statement (all bills, paid/unpaid, totals) shareable via WhatsApp/Share sheet.
5. **Distinct Icon Colors Across Entire App:**
   - Products = Blue (`#2563EB`)
   - Suppliers = Orange (`#EA580C`)
   - Orders = Purple (`#9333EA`)
   - Billing = Green (`#16A34A`)
   - Khata = Red (`#DC2626`)
   - Account = Teal (`#0D9488`)
   - Settings = Grey (`#4B5563`)
6. **Animated Splash Screen & Multi-language Support:**
   - Splash screen with smooth fade/scale logo animation.
   - i18n support for English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
7. **Sound on Bill Generation:**
   - Payment success audio chime (GPay-style) with on/off and sound selection in settings.
8. **Seed Script:**
   - `scripts/seed.py` seeding default prefixes, standard GST rates (0%, 5%, 12%, 18%, 28%), and units (kg, g, litre, ml, piece, packet, box, dozen).

---

## 7. EXECUTION & MIGRATION STRATEGY

1. **Step 1:** Retain all working code.
2. **Step 2:** Restructure Backend into `backend/app/config/`, `middleware/`, `dependencies/`, `utils/`, `core/`, and `stores/grocery/` with feature subfolders.
3. **Step 3:** Implement standard `grocery_*` models and Alembic migration that safely copies existing data.
4. **Step 4:** Restructure Frontend into `src/core/`, `components/`, `theme/`, and `stores/grocery/` with full feature implementations.
5. **Step 5:** Add missing features (PDF statements, animated splash, i18n, distinct icon colors, atomic `{store_code}_{prefix}_{4-digit}` ID generation, sound feedback).
6. **Step 6:** Run complete backend tests and TypeScript checks to verify zero regressions.

---

## 8. POST-UPGRADE VERIFICATION & COMPLIANCE

### Verification Summary
- **Backend Test Suites:**
  - `backend/tests/run_all_tests.py`: **8 / 8 Suites Passed (100% Verified)**.
  - `backend/tests/test_grocery_store_apis.py`: **7 / 7 Feature Tests Passed (100% Verified)**.
  - Total: **15 / 15 Test Suites and Cases Verified**.
- **Frontend TypeScript Verification:**
  - `cd react-native-app; npx tsc --noEmit`: **0 Errors (100% Type-Safe)**.
- **Database Migrations:**
  - Alembic migration `6e7f8a9b0c1d_migrate_to_store_isolated_grocery_tables.py` applied successfully.
  - 14 `grocery_*` tables, indexes, and foreign keys active.
  - `scripts/seed.py` seeded default GST rates (0%, 5%, 12%, 18%, 28%), measurement units, and 10 default prefixes per store.

