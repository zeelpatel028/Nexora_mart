# Tulsi Mart – Grocery Store Module Database Schema

This document describes the complete, store-isolated `grocery_*` relational database schema managed by SQLAlchemy ORM models and Alembic migration `b1c2d3e4f5a6` (revising `a0b1c2d3e4f5`). Every operational Grocery table includes both `store_id` (`ForeignKey("stores.id", ondelete="CASCADE")`) and `user_id` (`ForeignKey("users.id", ondelete="SET NULL")`) so multi-tenant store and owner isolation is enforced at both query and schema levels.

---

## 1. Entity Relationship Overview

```text
stores (id, user_id, store_code)
  ├── grocery_store_prefixes (store_id -> prefix strings for all 10 entities)
  ├── grocery_prefixes (store_id, key, prefix_value)
  ├── grocery_id_counters (store_id, entity_key, next_seq)
  ├── grocery_settings (store_id, theme, language, currency, template, bill_sound_enabled)
  ├── grocery_backups (store_id, file_url, size)
  ├── grocery_suppliers (store_id, user_id, supplier_code, bank/UPI fields)
  │     ├── grocery_products (store_id, user_id, product_code, supplier_id, tax/unit fields)
  │     │     ├── grocery_product_batches (store_id, user_id, product_id, remaining_qty, expiry_date)
  │     │     └── grocery_stock_movements (store_id, user_id, product_id, type, qty, ref_id)
  │     ├── grocery_purchase_orders (store_id, user_id, order_code, supplier_id, product_id, qty)
  │     └── grocery_orders -> grocery_order_items (mirrored order + line-item structure)
  ├── grocery_customers (store_id, user_id, customer_code, name, phone, address)
  │     └── grocery_bills (store_id, user_id, invoice_code, customer_id, subtotal, total_tax, grand_total, idempotency_key)
  │           ├── grocery_bill_items (store_id, bill_id, product_id, base_price, gst_rate, tax_amount, price_with_tax)
  │           ├── grocery_invoices (1:1 tax invoice record linked via bill_id)
  │           └── grocery_returns -> grocery_refunds (restocks inventory + records refund movement)
  ├── grocery_expenses (store_id, user_id, expense_code, category, amount, payment_method)
  ├── grocery_payments (store_id, user_id, reference_type, reference_id, amount, payment_method)
  └── grocery_employees (store_id, user_id, employee_code, name, phone, role, salary)
```

---

## 2. Core Grocery Tables

### `grocery_products`
| Column | Type | Constraints / Default | Notes |
|---|---|---|---|
| `id` | `String(36)` | `PK` (UUID string) | Primary identifier |
| `store_id` | `Integer` | `FK(stores.id)`, `NOT NULL`, `INDEX` | Tenant store scope |
| `user_id` | `Integer` | `FK(users.id)`, `NULLABLE`, `INDEX` | Owner isolation |
| `product_code` | `String(100)` | `NOT NULL`, `INDEX` | Auto ID e.g. `S001_PRD_0001` |
| `name` | `String(255)` | `NOT NULL`, `INDEX` | Product display name |
| `supplier_id` | `Integer` | `FK(grocery_suppliers.id)`, `NULLABLE` | Preferred seller |
| `purchase_price_with_tax` | `Float` | `0.0` | Purchase cost inclusive of GST |
| `purchase_gst_rate` | `Float` | `0.0` | `0`, `5`, `12`, `18`, `28` |
| `purchase_unit` | `String(50)` | `'Piece'` | Purchase measurement unit |
| `selling_price_with_tax` | `Float` | `0.0` | Catalog selling price (inclusive of GST) |
| `selling_unit` | `String(50)` | `'Piece'` | Selling measurement unit |
| `selling_gst_rate` | `Float` | `0.0` | `0`, `5`, `12`, `18`, `28` |
| `available_stock` | `Float` | `0.0` | Synchronized on add, receive, bill & return |
| `low_stock_enabled` | `Boolean` | `False` | Alert toggle |
| `low_stock_qty` | `Float` | `5.0` | Alert threshold |
| `expiry_alert_enabled` | `Boolean` | `False` | Requires expiry date on PO receive |
| `is_active`, `is_deleted` | `Boolean` | `True`, `False` | Soft lifecycle flags |
| `created_at`, `updated_at` | `DateTime` | UTC timestamps | Audit trail |

### `grocery_product_batches`
Tracks non-overwriting lot/batch quantities and expiration dates for **FEFO (First Expired, First Out)** deductions.
- **Columns**: `id` (PK), `store_id`, `user_id`, `product_id` (`FK(grocery_products.id)`), `batch_number`, `qty`, `remaining_qty`, `expiry_date`, `purchase_price`, `created_at`, `is_deleted`.
- **Indexes**: `ix_grocery_batches_store_expiry` on `(store_id, expiry_date)`.

### `grocery_stock_movements`
Immutable audit ledger of inventory changes.
- **Columns**: `id` (PK), `store_id`, `user_id`, `product_id`, `type` (`'initial' | 'order_received' | 'sale' | 'adjust' | 'return'`), `qty` (`+` credit / `-` debit), `ref_id` (document code), `created_at`.

### `grocery_suppliers`
- **Columns**: `id` (PK), `store_id`, `user_id`, `supplier_code` (`SUP`), `store_name`, `seller_name`, `phone`, `email`, `address`, `gst_number`, optional payment fields (`bank_name`, `account_holder`, `account_number`, `ifsc`, `upi_id`), `is_active`, `created_at`, `updated_at`, `is_deleted`.

### `grocery_customers` (Khata Ledger Customers)
- **Columns**: `id` (PK), `store_id`, `user_id`, `customer_code` (`KHT`), `name`, `phone`, `address`, `is_active`, `created_at`, `updated_at`, `is_deleted`.

---

## 3. Purchase Order Tables

### `grocery_purchase_orders`
- **Columns**: `id` (PK), `store_id`, `user_id`, `order_code` (`ORD`), `supplier_id`, `product_id`, `qty`, `unit`, `purchase_price`, `total_amount`, `expected_delivery_date`, `status` (`'placed' | 'received'`), `received_at`, `expiry_date`, `payment_status` (`'pending' | 'paid'`), `paid_at`, `created_at`, `updated_at`, `is_deleted`.

### `grocery_orders` & `grocery_order_items`
- `grocery_orders`: `id`, `store_id`, `user_id`, `supplier_id`, `order_code`, `order_date`, `expected_delivery_date`, `total_amount`, `status`, `payment_status`, `received_at`, `paid_at`, `created_at`, `is_deleted`.
- `grocery_order_items`: `id`, `store_id`, `user_id`, `order_id` (`FK(grocery_orders.id)`), `product_id` (`FK(grocery_products.id)`), `product_name`, `ordered_qty`, `received_qty`, `unit`, `purchase_price`, `line_total`, `expiry_date`.

---

## 4. POS Billing & Invoice Tables

### `grocery_bills`
- **Columns**: `id` (PK), `store_id`, `user_id`, `invoice_code` (`INV`), `customer_type` (`'walk_in' | 'khata'`), `customer_id`, `walk_in_name`, `walk_in_phone`, `walk_in_address`, `subtotal` (taxable base sum without GST), `total_tax`, `discount_amount`, `grand_total`, `paid_amount`, `payment_method`, `idempotency_key` (duplicate bill prevention), `payment_status` (`'paid' | 'unpaid'`), `paid_at`, `template_id`, `created_by`, `created_at`, `updated_at`, `is_deleted`.

### `grocery_bill_items`
- **Columns**: `id`, `bill_id` (`FK(grocery_bills.id)`), `store_id`, `product_id`, `product_name`, `price_with_tax` (editable per-bill selling price; does not mutate `grocery_products`), `base_price` (`price_with_tax / (1 + gst_rate/100)`), `gst_rate`, `tax_amount`, `unit`, `qty`, `line_total`, `created_at`.

### `grocery_invoices`
- 1:1 persisted Tax Invoice entity per bill (`bill_id` unique FK to `grocery_bills.id`, `invoice_number`, `subtotal`, `total_tax`, `grand_total`, `payment_status`, `template_id`, `invoice_date`, `is_deleted`). **Purchase prices are never included in invoice responses.**

---

## 5. Finance, Returns, Staff & Configuration Tables

- **`grocery_expenses`**: `id`, `store_id`, `user_id`, `expense_code` (`EXP`), `category`, `amount`, `payment_method`, `expense_date`, `description`, `receipt_url`, `created_at`, `updated_at`, `is_deleted`.
- **`grocery_payments`**: `id`, `store_id`, `user_id`, `reference_type` (`'bill' | 'supplier_order' | 'khata' | 'expense' | 'refund'`), `reference_id`, `reference_code`, `amount`, `payment_method`, `payment_date`, `notes`, `created_at`.
- **`grocery_returns`**: `id`, `store_id`, `user_id`, `bill_id`, `customer_id`, `return_code` (`RTN`), `total_return_amount`, `reason`, `status`, `created_at`.
- **`grocery_refunds`**: `id`, `store_id`, `user_id`, `return_id` (`FK(grocery_returns.id)`), `bill_id`, `refund_code` (`RFD`), `amount`, `refund_method`, `notes`, `created_at`.
- **`grocery_employees`**: `id`, `store_id`, `user_id`, `employee_code` (`EMP`), `name`, `phone`, `role`, `salary`, `is_active`, `joined_at`, `created_at`.
- **`grocery_store_prefixes`** & **`grocery_prefixes`** & **`grocery_id_counters`**: Maintain custom store ID prefixes (`invoice`, `debit_customer`, `walk_in_customer`, `supplier`, `order`, `product`, `employee`, `return`, `refund`, `expense`) and atomic sequence numbers formatted as `{STORE_CODE}_{PREFIX}_{0001}`.
- **`grocery_settings`**: Per-store `theme`, `language`, `currency_code`, `currency_symbol`, `bill_template_id`, `bill_sound_enabled`, `bill_sound_id`.
- **`grocery_backups`**: Tracks JSON export snapshots (`store_id`, `user_id`, `file_url`, `size`, `created_at`).

---

## 6. Safe Migration Strategy

Alembic revision `b1c2d3e4f5a6_upgrade_grocery_tables_and_isolation.py` (`down_revision = 'a0b1c2d3e4f5'`) performs purely additive, non-destructive upgrades:
1. Adds `user_id` columns to pre-existing `grocery_*` tables if missing and backfills `user_id` from `stores.user_id`.
2. Adds `discount_amount`, `paid_amount`, `payment_method`, and `idempotency_key` to `grocery_bills`.
3. Preserves any legacy placeholder rows from older `grocery_invoices` schemas into `grocery_invoices_legacy` before creating the upgraded 1:1 `grocery_invoices` schema.
4. Creates `grocery_store_prefixes`, `grocery_orders`, `grocery_order_items`, `grocery_expenses`, `grocery_payments`, `grocery_returns`, `grocery_refunds`, and `grocery_employees` idempotently.
5. `downgrade()` intentionally leaves tables/rows intact so user data is never lost.
