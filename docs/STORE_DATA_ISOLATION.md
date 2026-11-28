# Tulsi Mart – Store Data Isolation & Multi-Tenancy

## 1. Multi-Tenant Isolation Strategy
Tulsi Mart supports multiple stores and multiple store types (`grocery`, `clothing`, `medical`, `electronics`, `plastic`, `handloom`, `furniture`, `agro`) on a single database cluster while guaranteeing complete tenant isolation.

---

## 2. Isolation Guarantees

### Server-Side Tenant Resolution
- Tenant context is established in `app/api/dependencies.py` via `get_current_store_context`.
- Every repository and service method receives the validated `store: Store` model.
- Every SQLAlchemy database query explicitly filters by `Model.store_id == store.id`.

### Partitioned Store Tables
In addition to foreign key constraints, high-volume transactions and store-specific operations use dedicated physical tables:
- `grocery_invoices`, `clothing_invoices`, `medical_invoices`, etc.
- `grocery_inventory`, `clothing_inventory`, etc.
- `grocery_purchase_orders`, `clothing_purchase_orders`, etc.

### Sequence Isolation
Document sequence numbers (`TM_INV_0001`, `TM_PRD_0001`, etc.) are tracked per store in `document_sequences` with a composite primary key `(store_id, entity_type)`. Store A's invoices never interfere with Store B's numbering.
