# Tulsi Mart – Database Migration Guide

## 1. Alembic Migration Engine
Database migrations are managed via **Alembic** in the `backend/` directory.

### Migration Environment
- Configuration file: `backend/alembic.ini`
- Migration scripts: `backend/alembic/versions/`
- Target Database: Aiven PostgreSQL / Local SQLite fallback

---

## 2. Running Migrations

To apply all pending migrations up to head:
```bash
cd backend
alembic upgrade head
```

To roll back one revision:
```bash
alembic downgrade -1
```

To create a new auto-generated migration after model changes:
```bash
alembic revision --autogenerate -m "describe_schema_changes"
```

---

## 3. Latest Migration: `5d6e7f8a9b0c`
The latest migration adds:
1. `store_prefixes` table for custom document code prefixes (`TM_INV_`, `TM_PRD_`, etc.).
2. Financial ledgers: `customer_ledger`, `supplier_ledger`, `invoice_payments`, `purchase_order_payments`.
3. Store-wise physical tables for all 8 categories (`grocery`, `clothing`, `medical`, `electronics`, `plastic`, `handloom`, `furniture`, `agro`).
4. Indexes on `(store_id, customer_id)`, `(store_id, supplier_id)`, and `(store_id, status)`.
