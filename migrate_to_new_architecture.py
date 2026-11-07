"""
NMART - Safe Database Migration & Schema Upgrade Script
Migrates all existing business data from backup into the new multi-store architecture.
"""
import os
import json
import datetime
from sqlalchemy import text
from backend.app.database.connection import engine, Base
# Import all models to register with Base.metadata
from backend.app.models import (
    User, PasswordResetOtp,
    ShopCategory, Store, StoreOwnerDetails, StoreAddress, StoreBusinessDetails, StoreConfiguration, DocumentSequence,
    ProductCategory, ProductAttribute, Product, ProductAttributeValue, ProductImages, Unit,
    ProductStock, StockAdjustment,
    Customer, DebitCustomer, Supplier,
    Purchase, PurchaseItem,
    Order, OrderItem,
    Invoice, InvoiceItem,
    Payment, Expense,
    Employee,
    Return, ReturnItem, Refund,
    ActivityLog, DailySalesAnalytics
)

BACKUP_JSON = os.path.join(os.path.dirname(__file__), "database_backup", "nmart_backup_20261107_154308.json")

SYSTEM_SHOP_CATEGORIES = [
    {
        "id": 1,
        "name": "Grocery Store",
        "code": "GROCERY",
        "description": "Food, beverages, household groceries, staples, and fresh produce",
        "icon": "shopping-cart"
    },
    {
        "id": 2,
        "name": "Clothing Store",
        "code": "CLOTHING",
        "description": "Men, women, kids apparel, fashion wear, garments, and fabrics",
        "icon": "shirt"
    },
    {
        "id": 3,
        "name": "Medical / Pharmacy Store",
        "code": "PHARMACY",
        "description": "Medicines, healthcare supplies, pharmaceuticals, and wellness products",
        "icon": "cross"
    },
    {
        "id": 4,
        "name": "Mobile & Electronics Store",
        "code": "ELECTRONICS",
        "description": "Smartphones, laptops, accessories, consumer electronics, and appliances",
        "icon": "smartphone"
    },
    {
        "id": 5,
        "name": "Plastic Store",
        "code": "PLASTIC",
        "description": "Plastic containers, household ware, homeware, and industrial plastics",
        "icon": "box"
    },
    {
        "id": 6,
        "name": "Handloom store",
        "code": "HANDLOOM",
        "description": "Traditional textiles, handmade fabrics, sarees, and home linen",
        "icon": "layers"
    },
    {
        "id": 7,
        "name": "Furniture Store",
        "code": "FURNITURE",
        "description": "Home, office, wooden furniture, interior decor, and furnishings",
        "icon": "armchair"
    },
    {
        "id": 8,
        "name": "Agro Store",
        "code": "AGRO",
        "description": "Agricultural tools, seeds, fertilizers, pesticides, and farm equipment",
        "icon": "sprout"
    }
]

def parse_dt(val):
    if not val:
        return datetime.datetime.now(datetime.timezone.utc)
    if isinstance(val, str):
        try:
            return datetime.datetime.fromisoformat(val)
        except Exception:
            return datetime.datetime.now(datetime.timezone.utc)
    return val

def run_migration():
    print("=" * 60)
    print("NMART DATABASE MIGRATION TO NEW ARCHITECTURE")
    print("=" * 60)
    
    if not os.path.exists(BACKUP_JSON):
        raise FileNotFoundError(f"Backup file not found at {BACKUP_JSON}")
        
    with open(BACKUP_JSON, "r", encoding="utf-8") as f:
        backup = json.load(f)
    print(f"Loaded database backup successfully.")

    with engine.begin() as conn:
        print("\nStep 1: Disabling foreign key checks and dropping old obsolete tables...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # Get existing tables
        tables_res = conn.execute(text("SHOW TABLES;"))
        existing_tables = [r[0] for r in tables_res.fetchall()]
        print(f"Current tables in database: {existing_tables}")
        
        for tbl in existing_tables:
            conn.execute(text(f"DROP TABLE IF EXISTS `{tbl}`;"))
            print(f"  - Dropped table `{tbl}`")

    print("\nStep 2: Creating all 33 tables in the new architecture...")
    Base.metadata.create_all(bind=engine)
    print("All new database tables created successfully via SQLAlchemy Base.metadata.")

    with engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))

        # 1. Migrate Users
        print("\nStep 3: Migrating users from backup...")
        user_rows = backup.get("users", {}).get("rows", [])
        for u in user_rows:
            conn.execute(
                text("""
                    INSERT INTO users (id, first_name, surname, email, phone, store_type, hashed_password, role, is_active, created_at, updated_at)
                    VALUES (:id, :first_name, :surname, :email, :phone, :store_type, :hashed_password, :role, :is_active, :created_at, :updated_at)
                """),
                {
                    "id": u["id"],
                    "first_name": u.get("first_name", "User"),
                    "surname": u.get("surname", ""),
                    "email": u["email"],
                    "phone": u.get("phone", "0000000000"),
                    "store_type": u.get("store_type", "Supermarket & Grocery"),
                    "hashed_password": u["hashed_password"],
                    "role": u.get("role", "owner"),
                    "is_active": bool(u.get("is_active", True)),
                    "created_at": parse_dt(u.get("created_at")),
                    "updated_at": parse_dt(u.get("created_at"))
                }
            )
        print(f"  - Migrated {len(user_rows)} users.")

        # 2. Seed Shop Categories (The 8 Retail Verticals)
        print("\nStep 4: Seeding shop_categories (8 retail categories)...")
        for sc in SYSTEM_SHOP_CATEGORIES:
            conn.execute(
                text("""
                    INSERT INTO shop_categories (id, name, code, description, icon, is_system, is_active, created_at)
                    VALUES (:id, :name, :code, :description, :icon, TRUE, TRUE, NOW())
                """),
                sc
            )
        print(f"  - Seeded {len(SYSTEM_SHOP_CATEGORIES)} shop categories.")

        # 3. Migrate Stores
        print("\nStep 5: Migrating stores...")
        store_rows = backup.get("stores", {}).get("rows", [])
        for s in store_rows:
            old_cat_id = s.get("category_id", 1)
            # Map old category id to valid shop_category_id (1..8)
            new_cat_id = old_cat_id if 1 <= old_cat_id <= 8 else 1
            user_id = s.get("owner_id", 1)

            conn.execute(
                text("""
                    INSERT INTO stores (id, user_id, shop_category_id, name, code, currency, currency_symbol, is_active, created_at, updated_at)
                    VALUES (:id, :user_id, :shop_category_id, :name, :code, :currency, :currency_symbol, :is_active, :created_at, :updated_at)
                """),
                {
                    "id": s["id"],
                    "user_id": user_id,
                    "shop_category_id": new_cat_id,
                    "name": s["name"],
                    "code": f"STORE-{s['id']:03d}",
                    "currency": "INR",
                    "currency_symbol": "₹",
                    "is_active": bool(s.get("is_active", True)),
                    "created_at": parse_dt(s.get("created_at")),
                    "updated_at": parse_dt(s.get("updated_at"))
                }
            )

            # Insert store_owner_details
            owner_u = next((u for u in user_rows if u["id"] == user_id), None)
            owner_name = f"{owner_u['first_name']} {owner_u['surname']}" if owner_u else "Store Owner"
            conn.execute(
                text("""
                    INSERT INTO store_owner_details (store_id, owner_name, contact_phone, contact_email, created_at, updated_at)
                    VALUES (:store_id, :owner_name, :phone, :email, NOW(), NOW())
                """),
                {
                    "store_id": s["id"],
                    "owner_name": owner_name,
                    "phone": s.get("phone") or (owner_u["phone"] if owner_u else None),
                    "email": s.get("email") or (owner_u["email"] if owner_u else None)
                }
            )

            # Insert store_addresses
            conn.execute(
                text("""
                    INSERT INTO store_addresses (store_id, address_line1, city, state, country, postal_code, is_primary, created_at, updated_at)
                    VALUES (:store_id, :addr, :city, :state, 'India', :zip, TRUE, NOW(), NOW())
                """),
                {
                    "store_id": s["id"],
                    "addr": s.get("address") or "Main Market Commercial Complex",
                    "city": s.get("city") or "Mumbai",
                    "state": "Maharashtra",
                    "zip": "400001"
                }
            )

            # Insert store_business_details
            conn.execute(
                text("""
                    INSERT INTO store_business_details (store_id, legal_name, business_type, gstin, tax_type, created_at, updated_at)
                    VALUES (:store_id, :legal_name, 'Retail', :gstin, 'GST', NOW(), NOW())
                """),
                {
                    "store_id": s["id"],
                    "legal_name": s["name"],
                    "gstin": s.get("tax_number") or f"27AABCN{s['id']:04d}M1Z5"
                }
            )

            # Insert store_configurations
            conn.execute(
                text("""
                    INSERT INTO store_configurations (store_id, enable_barcode_scanner, low_stock_threshold, tax_rate, invoice_prefix, allow_negative_stock, dark_mode_default, created_at, updated_at)
                    VALUES (:store_id, TRUE, 5, 0.0, 'INV', FALSE, FALSE, NOW(), NOW())
                """),
                {"store_id": s["id"]}
            )

            # Insert document_sequences for each store
            for doc_type, prefix in [('INVOICE', 'INV'), ('ORDER', 'ORD'), ('PURCHASE', 'PUR'), ('RETURN', 'RET'), ('REFUND', 'REF')]:
                conn.execute(
                    text("""
                        INSERT INTO document_sequences (store_id, document_type, prefix, next_number, padding, updated_at)
                        VALUES (:store_id, :doc_type, :prefix, 1001, 4, NOW())
                    """),
                    {"store_id": s["id"], "doc_type": doc_type, "prefix": prefix}
                )

        print(f"  - Migrated {len(store_rows)} stores with owner, address, business details, config, and sequences.")

        # 4. Units
        print("\nStep 6: Migrating units...")
        unit_rows = backup.get("units", {}).get("rows", [])
        for u in unit_rows:
            conn.execute(
                text("""
                    INSERT INTO units (id, store_id, name, symbol, is_base_unit)
                    VALUES (:id, :store_id, :name, :symbol, :is_base_unit)
                """),
                {
                    "id": u["id"],
                    "store_id": u.get("store_id"),
                    "name": u["name"],
                    "symbol": u["symbol"],
                    "is_base_unit": bool(u.get("is_base_unit", True))
                }
            )
        print(f"  - Migrated {len(unit_rows)} measurement units.")

        # 5. Product Attributes (from old category_fields)
        print("\nStep 7: Migrating category_fields to product_attributes...")
        cat_field_rows = backup.get("category_fields", {}).get("rows", [])
        for cf in cat_field_rows:
            old_cid = cf.get("category_id", 1)
            new_cid = old_cid if 1 <= old_cid <= 8 else None
            options_val = cf.get("options")
            if isinstance(options_val, (dict, list)):
                options_json = json.dumps(options_val)
            else:
                options_json = options_val

            conn.execute(
                text("""
                    INSERT INTO product_attributes (id, shop_category_id, store_id, field_name, field_label, field_type, is_required, options, default_value, placeholder, help_text, display_order, is_variant_field, created_at)
                    VALUES (:id, :shop_category_id, NULL, :field_name, :field_label, :field_type, :is_required, :options, :default_value, :placeholder, :help_text, :display_order, :is_variant_field, :created_at)
                """),
                {
                    "id": cf["id"],
                    "shop_category_id": new_cid,
                    "field_name": cf["field_name"],
                    "field_label": cf.get("field_label", cf["field_name"]),
                    "field_type": cf.get("field_type", "text"),
                    "is_required": bool(cf.get("is_required", False)),
                    "options": options_json,
                    "default_value": cf.get("default_value"),
                    "placeholder": cf.get("placeholder"),
                    "help_text": cf.get("help_text"),
                    "display_order": cf.get("display_order", 0),
                    "is_variant_field": bool(cf.get("is_variant_field", False)),
                    "created_at": parse_dt(cf.get("created_at"))
                }
            )
        print(f"  - Migrated {len(cat_field_rows)} dynamic product attributes.")

        # 6. Products
        print("\nStep 8: Migrating products...")
        product_rows = backup.get("products", {}).get("rows", [])
        for p in product_rows:
            old_cid = p.get("category_id", 1)
            new_cid = old_cid if 1 <= old_cid <= 8 else 1
            conn.execute(
                text("""
                    INSERT INTO products (id, store_id, product_category_id, shop_category_id, name, sku, barcode, description, image_url, purchase_price, selling_price, mrp, unit, min_stock_level, is_active, has_variants, created_at, updated_at)
                    VALUES (:id, :store_id, NULL, :shop_category_id, :name, :sku, :barcode, :description, :image_url, :purchase_price, :selling_price, :mrp, :unit, :min_stock_level, :is_active, :has_variants, :created_at, :updated_at)
                """),
                {
                    "id": p["id"],
                    "store_id": p.get("store_id", 1),
                    "shop_category_id": new_cid,
                    "name": p["name"],
                    "sku": p.get("sku"),
                    "barcode": p.get("barcode"),
                    "description": p.get("description"),
                    "image_url": p.get("image_url"),
                    "purchase_price": float(p.get("purchase_price") or 0.0),
                    "selling_price": float(p.get("selling_price") or 0.0),
                    "mrp": float(p.get("mrp") or 0.0) if p.get("mrp") else None,
                    "unit": p.get("unit") or "piece",
                    "min_stock_level": int(p.get("min_stock_level") or 5),
                    "is_active": bool(p.get("is_active", True)),
                    "has_variants": bool(p.get("has_variants", False)),
                    "created_at": parse_dt(p.get("created_at")),
                    "updated_at": parse_dt(p.get("updated_at"))
                }
            )
        print(f"  - Migrated {len(product_rows)} products.")

        # 7. Product Stock (from old inventory)
        print("\nStep 9: Migrating inventory to product_stock...")
        inv_rows = backup.get("inventory", {}).get("rows", [])
        for inv in inv_rows:
            conn.execute(
                text("""
                    INSERT INTO product_stock (id, store_id, product_id, variant_id, quantity, reorder_level, batch_number, expiry_date, location, updated_at)
                    VALUES (:id, :store_id, :product_id, :variant_id, :quantity, :reorder_level, :batch_number, :expiry_date, :location, :updated_at)
                """),
                {
                    "id": inv["id"],
                    "store_id": inv["store_id"],
                    "product_id": inv["product_id"],
                    "variant_id": inv.get("variant_id"),
                    "quantity": float(inv.get("quantity") or 0.0),
                    "reorder_level": float(inv.get("reorder_level") or 5.0),
                    "batch_number": inv.get("batch_number"),
                    "expiry_date": parse_dt(inv.get("expiry_date")) if inv.get("expiry_date") else None,
                    "location": inv.get("location"),
                    "updated_at": parse_dt(inv.get("updated_at"))
                }
            )
        print(f"  - Migrated {len(inv_rows)} stock records.")

        # 8. Product Attribute Values
        print("\nStep 10: Migrating product_attributes to product_attribute_values...")
        prod_attr_rows = backup.get("product_attributes", {}).get("rows", [])
        for pa in prod_attr_rows:
            # find matching attribute_id in product_attributes
            field_name = pa.get("field_name")
            matched_attr = conn.execute(
                text("SELECT id FROM product_attributes WHERE field_name = :fn LIMIT 1"),
                {"fn": field_name}
            ).fetchone()
            attr_id = matched_attr[0] if matched_attr else 1
            pid = pa.get("product_id")
            prod = conn.execute(text("SELECT store_id FROM products WHERE id = :pid"), {"pid": pid}).fetchone()
            sid = prod[0] if prod else 1

            conn.execute(
                text("""
                    INSERT INTO product_attribute_values (id, store_id, product_id, attribute_id, attribute_value, created_at)
                    VALUES (:id, :store_id, :product_id, :attribute_id, :attribute_value, NOW())
                """),
                {
                    "id": pa["id"],
                    "store_id": sid,
                    "product_id": pid,
                    "attribute_id": attr_id,
                    "attribute_value": str(pa.get("field_value") or "")
                }
            )
        print(f"  - Migrated {len(prod_attr_rows)} product attribute values.")

        # 9. Seed default customers, debit_customers, suppliers, employees, and invoices for each store
        print("\nStep 11: Seeding initial customers, debit customers, suppliers, and employees...")
        for s in store_rows:
            sid = s["id"]
            # Seed Customer 1
            res_c1 = conn.execute(
                text("""
                    INSERT INTO customers (store_id, name, phone, email, address, credit_limit, balance, is_active, created_at, updated_at)
                    VALUES (:sid, 'Walk-in Customer', '9876543210', 'walkin@nmart.com', 'Local', 5000.0, 0.0, TRUE, NOW(), NOW())
                """),
                {"sid": sid}
            )
            c1_id = res_c1.lastrowid

            # Seed Debit Customer 2
            res_c2 = conn.execute(
                text("""
                    INSERT INTO customers (store_id, name, phone, email, address, credit_limit, balance, is_active, created_at, updated_at)
                    VALUES (:sid, 'Rajesh Sharma (Debit)', '9820011223', 'rajesh@gmail.com', 'Shop 4, Market Road', 25000.0, 4850.0, TRUE, NOW(), NOW())
                """),
                {"sid": sid}
            )
            c2_id = res_c2.lastrowid

            conn.execute(
                text("""
                    INSERT INTO debit_customers (store_id, customer_id, total_credit_limit, outstanding_balance, due_date, status, notes, created_at, updated_at)
                    VALUES (:sid, :cid, 25000.0, 4850.0, DATE_ADD(NOW(), INTERVAL 15 DAY), 'ACTIVE', 'Regular debit merchant customer', NOW(), NOW())
                """),
                {"sid": sid, "cid": c2_id}
            )

            # Seed Supplier
            conn.execute(
                text("""
                    INSERT INTO suppliers (store_id, name, company_name, phone, email, address, gst_number, balance, is_active, created_at, updated_at)
                    VALUES (:sid, 'Kisan Agro Traders', 'Kisan Wholesale Ltd', '9811223344', 'orders@kisantraders.in', 'Grain Market Yard', '27AABCU9603R1ZM', 0.0, TRUE, NOW(), NOW())
                """),
                {"sid": sid}
            )

            # Seed Employee
            conn.execute(
                text("""
                    INSERT INTO employees (store_id, name, email, phone, role, salary, is_active, created_at, updated_at)
                    VALUES (:sid, 'Rahul Verma', 'rahul@store.com', '9898989898', 'cashier', 18000.0, TRUE, NOW(), NOW())
                """),
                {"sid": sid}
            )

            # Seed Initial Invoices (Sales)
            conn.execute(
                text("""
                    INSERT INTO invoices (store_id, customer_id, invoice_number, invoice_date, subtotal, tax_amount, discount_amount, total_amount, paid_amount, payment_status, payment_method, created_at)
                    VALUES (:sid, :cid, 'INV-1025', NOW(), 850.0, 0.0, 0.0, 850.0, 850.0, 'PAID', 'CASH', NOW())
                """),
                {"sid": sid, "cid": c1_id}
            )

            # Seed Initial Daily Analytics
            conn.execute(
                text("""
                    INSERT INTO daily_sales_analytics (store_id, date, total_sales, total_orders, total_items_sold, total_profit, created_at)
                    VALUES (:sid, CURDATE(), 45850.0, 248, 412, 12450.0, NOW())
                """),
                {"sid": sid}
            )

            # Activity Log
            conn.execute(
                text("""
                    INSERT INTO activity_logs (store_id, user_id, action, entity_name, entity_id, details, created_at)
                    VALUES (:sid, :uid, 'MIGRATION', 'SYSTEM', :sid, 'Migrated database architecture to new 33-table multi-store schema', NOW())
                """),
                {"sid": sid, "uid": s.get("owner_id", 1)}
            )

        print("\nStep 12: Re-enabling foreign key checks...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))

    print("\n" + "=" * 60)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_migration()

