# Tulsi Mart – API Documentation

## 1. Authentication Header
All endpoints require a Bearer JWT token in the HTTP Authorization header:
```http
Authorization: Bearer <jwt_access_token>
```
The authenticated user and active `store_id` are extracted server-side.

---

## 2. Store Prefixes & ID Generation
- **`GET /api/v1/store-prefixes`**: Retrieve active prefixes for the store.
- **`PUT /api/v1/store-prefixes`**: Update store prefixes.
- **`GET /api/v1/store-prefixes/preview/{entity_type}`**: Get preview of next generated sequence ID (`TM_INV_0001`, `TM_PRD_0001`, etc.).

---

## 3. Product Catalog
- **`GET /api/v1/products`**: List store catalog with pagination, search, category filter, and stock levels.
- **`POST /api/v1/products`**: Create a new product. Generates sequence ID with prefix, records pricing and initial stock, sets low-stock threshold.
- **`GET /api/v1/products/{id}`**: Get full product details including batch and pricing breakdown.
- **`PUT /api/v1/products/{id}`**: Update product details.

---

## 4. Purchase Orders
- **`GET /api/v1/orders/purchases`**: List purchase orders with status filters (`PENDING`, `RECEIVED`, `CANCELLED`).
- **`POST /api/v1/orders/purchases`**: Place a new purchase order. Supports custom unit price isolated to this order without overwriting catalog price. Stock is NOT incremented upon placement.
- **`POST /api/v1/orders/purchases/{id}/receive`**: Receive goods. Atomically increments inventory, creates batch records, records credit in `supplier_ledger`, and marks order `RECEIVED`. Prevents duplicate receives.
- **`POST /api/v1/orders/purchases/{id}/pay`**: Record payment against purchase order. Debits supplier ledger.

---

## 5. Billing & POS
- **`POST /api/v1/billing/make-bill`**:
  Generates tax invoice.
  - Supports Walk-in Customer or Khata Customer.
  - Line items support custom selling price and quantity per row.
  - Computes GST breakdown: $\text{Taxable} = \text{Price} / (1 + \text{Rate}/100)$, $\text{GST} = \text{Price} - \text{Taxable}$.
  - Atomically decrements product stock.
  - If Khata customer: writes debit entry to `customer_ledger`.
- **`GET /api/v1/billing/invoices`**: List invoices with customer and date filters.
- **`GET /api/v1/billing/invoices/{id}`**: Full invoice detail for printing and sharing.

---

## 6. Customers & Khata
- **`GET /api/v1/customers/dashboard`**: Returns summary metrics (total customers, total pending bills, total pending amount).
- **`GET /api/v1/customers`**: Search and list customers with balances.
- **`POST /api/v1/customers`**: Add customer.
- **`GET /api/v1/customers/{id}/details`**: Customer summary, filtered bills (`ALL`, `PAID`, `UNPAID`, `PARTIAL`), and payment history.
- **`POST /api/v1/customers/{id}/receive-payment`**: Record payment from customer, crediting `customer_ledger`.
- **`GET /api/v1/customers/{id}/statement`**: Exportable account ledger statement.

---

## 7. Suppliers & Vendors
- **`GET /api/v1/suppliers/dashboard`**: Metrics (total suppliers, pending orders, payable balance, total purchases).
- **`GET /api/v1/suppliers`**: Search and list vendors.
- **`POST /api/v1/suppliers`**: Create supplier.
- **`GET /api/v1/suppliers/{id}/details`**: Vendor details, order history, and payment ledger.
- **`POST /api/v1/suppliers/{id}/pay`**: Record payment to vendor.
- **`GET /api/v1/suppliers/{id}/statement`**: Exportable vendor statement.

---

## 8. Settings & Backup
- **`GET /api/v1/settings/shop`**: Shop profile & preferences.
- **`PUT /api/v1/settings/shop`**: Update shop preferences.
- **`GET /api/v1/settings/backup`**: Export full store JSON backup.
- **`POST /api/v1/settings/restore`**: Restore store data from JSON backup.
