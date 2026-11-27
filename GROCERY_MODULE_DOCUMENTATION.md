# Tulsi Mart – Grocery Store Module Documentation

This document summarizes the upgraded **Grocery Store** module across both the React Native frontend (`react-native-app/src/grocery/`) and the FastAPI backend (`backend/app/stores/grocery/` plus modular re-export packages `backend/app/{models,schemas,routers,services}/grocery/` and `backend/app/migrations/`).

All other store modules (`clothing`, `medical`, `electronics`, `plastic`, `handloom`, `furniture`, `agro`) were left untouched.

---

## 1. Frontend Directory Organization (`react-native-app/src/grocery/`)

`react-native-app/src/navigation/storeResolver.ts` resolves `'grocery'` and the default store route directly to `src/grocery/index.ts`. The legacy `src/stores/grocery/` directory has been removed after confirming zero remaining imports.

| Feature Folder | Screen / Entry Files | Purpose |
|---|---|---|
| `src/grocery/index.ts` | Entry resolver (`getScreen`) | Resolves all 30 Grocery routes cleanly |
| `grocery_dashboard/` | `DashboardScreen.tsx`, `MoreMenuScreen.tsx` | Store KPIs, charts, low-stock/expiring highlights & navigation |
| `grocery_product/` | `ProductInventoryScreen.tsx`, `ProductDetailScreen.tsx` | Catalog list with `TableSkeleton`, filters & FEFO batch/expiry inspection |
| `grocery_add_product/` | `GroceryAddProductScreen.tsx` | Streamlined 10-field Grocery Add Product with auto ID preview & alerts |
| `grocery_edit_product/` | `GroceryEditProductScreen.tsx` | Edit product pricing, GST, units, seller, stock & alerts |
| `grocery_order/` | `PurchaseOrderScreen.tsx`, `PurchaseListScreen.tsx` | Purchase Orders list (`OrderCardSkeleton`), place PO, receive with actual qty + expiry, pay supplier |
| `grocery_add_order/` | `CreatePurchaseScreen.tsx` | Multi-line inward purchase creation connected to `/grocery/orders` |
| `grocery_supplier/` | `SupplierListScreen.tsx`, `SupplierDetailScreen.tsx` | Supplier registry with optional Bank/UPI details, orders & payment history |
| `grocery_customer/` | `KhataScreen.tsx` | Khata credit customer directory & quick registration |
| `grocery_customer_details/` | `CustomerDetailScreen.tsx` | All/Paid/Unpaid bill filters, Khata settlement payment & WhatsApp/PDF statement share |
| `grocery_make_bill/` | `PosBillingScreen.tsx`, `SalesListScreen.tsx`, `SaleDetailScreen.tsx` | POS Billing with Walk-in (name, phone, optional address), Khata quick-pick/add, editable per-bill rate, duplicate-bill `idempotency_key` & sound |
| `grocery_invoice/` | `InvoiceScreen.tsx` | Printable Tax Invoice showing Base Price, GST%, Tax Amount, Selling Rate & Grand Total (no purchase prices shown) |
| `grocery_expense/` | `FinanceScreen.tsx` | Store operating expenses & unified payments audit log (`/grocery/expenses`, `/grocery/payments`) |
| `grocery_reports/` | `ReportsScreen.tsx`, `InventoryValuationScreen.tsx` | Sales trends (`/grocery/dashboard/reports/sales`) & stock valuation (`/grocery/dashboard/reports/valuation`) |
| `grocery_settings/` | `SettingsScreen.tsx`, `PrivacyPolicyScreen.tsx` | Theme, language, currency, template, bill sound toggle, 10 ID prefixes, JSON Export & Restore Backup modal |
| `grocery_account/` | `ProfileScreen.tsx`, `AccountDetailScreen.tsx`, Auth screens | Store owner details & 10 configurable ID prefixes |
| `grocery_components/` | `components/`, `hooks/`, `services/`, `utils/` | Grocery API services, skeletons, cards, inputs, charts & formatters |

---

## 2. Backend Modular Architecture & Prefix API

Under `backend/app/stores/grocery/` (and re-exported from `app/models/grocery`, `app/schemas/grocery`, `app/routers/grocery`, `app/services/grocery`, `app/migrations`):

| Domain Module | Mounted Router Prefix | Key Endpoints |
|---|---|---|
| `grocery_product` | `/api/v1/grocery/products` | `GET /preview-id`, `GET/POST ""`, `GET/PUT/DELETE /{id}`, `POST /{id}/stock`, FEFO active batch deductions |
| `grocery_supplier` | `/api/v1/grocery/suppliers` | `GET /dashboard`, `GET/POST ""`, `GET /{id}` (orders, received orders & payments), `GET /{id}/statement/pdf` |
| `grocery_purchase_order` | `/api/v1/grocery/orders` | `GET/POST ""`, `POST /{id}/receive` (actual `received_quantity`, required expiry if enabled, non-overwriting batches), `POST /{id}/pay` |
| `grocery_billing` | `/api/v1/grocery/billing` | `POST /make-bill` (FEFO batch deduction, editable per-bill price, `idempotency_key`, 1:1 `grocery_invoices`), `GET /invoices`, `GET /invoices/{id}`, `GET /invoices/{id}/pdf` |
| `grocery_khata_customer` | `/api/v1/grocery/customers` | `GET /dashboard`, `GET/POST ""`, `GET /{id}` (`tab_filter`), `POST /{id}/pay` (syncs `grocery_invoices.payment_status` + `grocery_payments`), `GET /{id}/statement/pdf` |
| `grocery_finance` | `/api/v1/grocery` | `GET/POST/DELETE /expenses`, `GET/POST /payments` |
| `grocery_returns` | `/api/v1/grocery/returns` | `GET ""`, `POST ""` (atomic restock + `GroceryStockMovement(type="return")` + `GroceryRefund` + `GroceryPayment`) |
| `grocery_employees` | `/api/v1/grocery/employees` | `GET/POST ""`, `DELETE /{id}` |
| `grocery_prefix` | `/api/v1/grocery/prefixes` | `GET/PUT ""` for all 10 prefixes synced to `grocery_store_prefixes`, `GET /preview/{key}` |
| `grocery_setting` | `/api/v1/grocery/settings` | `GET/PUT ""` |
| `grocery_backup` | `/api/v1/grocery/backup` | `GET /export`, `GET /history`, `POST /restore` |
| `grocery_lookup` | `/api/v1/grocery/lookup` | `GET /gst-rates`, `GET /units` |
| `dashboard_router` | `/api/v1/grocery/dashboard` | `GET /overview`, `GET /reports/sales`, `GET /reports/valuation` |

*(All routers are also dual-mounted under `/api/grocery/...` alongside `/api/v1/grocery/...`.)*

---

## 3. Core Business Logic Highlights

1. **Multi-Tenant Store + User Isolation**: Authenticated store identity comes strictly from the JWT dependency (`get_current_store`); every query scopes on `store_id` and writes populate both `store_id` and `user_id`.
2. **Non-Overwriting PO Receive & FEFO Deduction**:
   - Receiving a Purchase Order credits `grocery_products.available_stock` by actual `received_quantity` (falling back to ordered `qty`) and appends a new row to `grocery_product_batches` instead of overwriting older batches.
   - If the product has `expiry_alert_enabled = True`, receiving an order requires an `expiry_date`.
   - Making a bill deducts `available_stock`, debits `grocery_product_batches.remaining_qty` in **FEFO** order (earliest expiring batch first), creates a 1:1 `grocery_invoices` row, logs a `grocery_payments` entry for paid bills, and never alters the master `selling_price_with_tax` when rates are overridden per bill.
3. **Duplicate-Bill Prevention**: `MakeBillRequest.idempotency_key` prevents accidental double submissions.
4. **10 Configurable Store Prefixes**: Format `{STORE_CODE}_{PREFIX}_{0001}` across `invoice`, `debit_customer`, `walk_in_customer`, `supplier`, `order`, `product`, `employee`, `return`, `refund`, `expense`.

---

## 4. Verification Summary

- **Backend Unit & E2E Tests**: `unittest` suite (`tests/test_grocery_store_apis.py` + `tests/test_grocery_upgrade_e2e.py`) executed cleanly against local SQLite mirror when offline from Aiven MySQL — **11/11 tests passed**.
- **Frontend TypeScript Check**: `npx tsc --noEmit` (with 4GB Node heap) passed with **0 errors**.
- **Android Metro Bundle**: `npm run bundle:android` generated `android/app/src/main/assets/index.android.bundle` cleanly (exit code 0).
- **APK Compilation**: `gradlew.bat assembleRelease` failed inside the sandbox due to restricted write access to `C:\Users\zeel\.gradle\wrapper\dists\...` (`Access is denied`). Running `.\gradlew.bat assembleRelease` outside the sandbox builds the final `.apk`.
