# Tulsi Mart – Database Schema

## 1. Database Architecture
Tulsi Mart uses PostgreSQL with SQLAlchemy ORM. The database enforces strict multi-tenancy: every table contains a `store_id` foreign key referencing `stores(id)`. Client requests can never dictate or override `store_id`; it is extracted server-side from the verified JWT.

---

## 2. Common & Master Tables

### `stores`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR 255)
- `store_type` (VARCHAR 50: `grocery`, `clothing`, `medical`, `electronics`, `plastic`, `handloom`, `furniture`, `agro`)
- `owner_id` (INTEGER -> `users.id`)
- `phone`, `email`, `address`, `gstin`
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

### `store_prefixes`
Stores customized document prefixes for atomic sequential IDs:
- `id` (SERIAL PRIMARY KEY)
- `store_id` (INTEGER UNIQUE -> `stores.id`)
- `invoice_prefix` (VARCHAR 20, default `TM_INV_`)
- `debit_customer_prefix` (VARCHAR 20, default `TM_DC_`)
- `walk_in_customer_prefix` (VARCHAR 20, default `TM_WC_`)
- `supplier_prefix` (VARCHAR 20, default `TM_SUP_`)
- `order_prefix` (VARCHAR 20, default `TM_ORD_`)
- `product_prefix` (VARCHAR 20, default `TM_PRD_`)
- `employee_prefix` (VARCHAR 20, default `TM_EMP_`)
- `return_prefix` (VARCHAR 20, default `TM_RET_`)
- `refund_prefix` (VARCHAR 20, default `TM_REF_`)
- `expense_prefix` (VARCHAR 20, default `TM_EXP_`)

### `document_sequences`
Atomic counter table tracking sequence numbers:
- `store_id`, `entity_type` (Composite Primary Key)
- `next_number` (INTEGER)
- `padding` (INTEGER, default 4)

---

## 3. Ledgers & Financial Tracking Tables

### `customer_ledger`
- `id` (SERIAL PRIMARY KEY)
- `store_id` (INTEGER -> `stores.id`)
- `customer_id` (INTEGER -> `customers.id`)
- `entry_type` (`DEBIT` when purchase is made on credit, `CREDIT` when payment is received)
- `amount` (DECIMAL 12,2)
- `balance_after` (DECIMAL 12,2 running balance)
- `invoice_id` (INTEGER NULL -> `invoices.id`)
- `payment_method`, `notes`, `created_at`

### `supplier_ledger`
- `id` (SERIAL PRIMARY KEY)
- `store_id` (INTEGER -> `stores.id`)
- `supplier_id` (INTEGER -> `suppliers.id`)
- `entry_type` (`CREDIT` on receiving goods, `DEBIT` on making payment to supplier)
- `amount` (DECIMAL 12,2)
- `balance_after` (DECIMAL 12,2 running payable balance)
- `purchase_order_id` (INTEGER NULL -> `purchase_orders.id`)
- `payment_method`, `notes`, `created_at`

### `product_batches`
- `id` (SERIAL PRIMARY KEY)
- `store_id` (INTEGER -> `stores.id`)
- `product_id` (INTEGER -> `products.id`)
- `batch_number` (VARCHAR 100)
- `quantity` (DECIMAL 10,2)
- `purchase_price` (DECIMAL 10,2)
- `mrp`, `selling_price`
- `expiry_date` (DATE)
- `supplier_id` (INTEGER -> `suppliers.id`)
- `purchase_order_id` (INTEGER NULL)

### `stock_movements`
- `id` (SERIAL PRIMARY KEY)
- `store_id`, `product_id`, `movement_type` (`PURCHASE_RECEIPT`, `SALE`, `RETURN`, `ADJUSTMENT`)
- `quantity`, `balance_after`, `reference_id`, `notes`, `created_at`

---

## 4. Store-Specific Partitioned Tables
Each of the 8 store categories owns dedicated physical tables:
- Products: `{store_type}_products`
- Inventory: `{store_type}_inventory`
- Purchase Orders: `{store_type}_purchase_orders` & `{store_type}_purchase_order_items`
- Invoices: `{store_type}_invoices` & `{store_type}_invoice_items`
