import sys
sys.path.insert(0, 'backend')
from app.database.connection import engine
import sqlalchemy as sa

with engine.connect() as conn:
    conn.execute(sa.text("DROP TABLE IF EXISTS grocery_product_batches"))
    conn.execute(sa.text("DROP TABLE IF EXISTS grocery_products"))
    conn.execute(sa.text("DROP TABLE IF EXISTS grocery_purchase_orders"))

    conn.execute(sa.text("""
    CREATE TABLE grocery_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        product_code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        supplier_id INTEGER,
        purchase_price_with_tax FLOAT DEFAULT 0.0 NOT NULL,
        purchase_gst_rate FLOAT DEFAULT 0.0 NOT NULL,
        purchase_unit VARCHAR(50) DEFAULT 'Piece' NOT NULL,
        selling_price_with_tax FLOAT DEFAULT 0.0 NOT NULL,
        selling_unit VARCHAR(50) DEFAULT 'Piece' NOT NULL,
        selling_gst_rate FLOAT DEFAULT 0.0 NOT NULL,
        available_stock FLOAT DEFAULT 0.0 NOT NULL,
        low_stock_enabled BOOLEAN DEFAULT 0 NOT NULL,
        low_stock_qty FLOAT DEFAULT 5.0 NOT NULL,
        expiry_alert_enabled BOOLEAN DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT 1 NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        is_deleted BOOLEAN DEFAULT 0 NOT NULL,
        FOREIGN KEY(store_id) REFERENCES stores (id) ON DELETE CASCADE,
        FOREIGN KEY(supplier_id) REFERENCES grocery_suppliers (id) ON DELETE SET NULL
    );
    """))

    conn.execute(sa.text("""
    CREATE TABLE grocery_product_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        purchase_order_id INTEGER,
        qty FLOAT NOT NULL,
        remaining_qty FLOAT NOT NULL,
        expiry_date DATETIME,
        received_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL,
        is_deleted BOOLEAN DEFAULT 0 NOT NULL,
        FOREIGN KEY(store_id) REFERENCES stores (id) ON DELETE CASCADE,
        FOREIGN KEY(product_id) REFERENCES grocery_products (id) ON DELETE CASCADE
    );
    """))

    conn.execute(sa.text("""
    CREATE TABLE grocery_purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        order_code VARCHAR(100) NOT NULL,
        supplier_id INTEGER,
        product_id INTEGER,
        qty FLOAT NOT NULL,
        unit VARCHAR(50) DEFAULT 'Piece' NOT NULL,
        purchase_price FLOAT NOT NULL,
        total_amount FLOAT NOT NULL,
        expected_delivery_date DATETIME,
        status VARCHAR(50) DEFAULT 'placed' NOT NULL,
        received_at DATETIME,
        expiry_date DATETIME,
        payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        paid_at DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        is_deleted BOOLEAN DEFAULT 0 NOT NULL,
        FOREIGN KEY(store_id) REFERENCES stores (id) ON DELETE CASCADE,
        FOREIGN KEY(supplier_id) REFERENCES grocery_suppliers (id) ON DELETE SET NULL,
        FOREIGN KEY(product_id) REFERENCES grocery_products (id) ON DELETE SET NULL
    );
    """))

    conn.commit()
print("Successfully recreated grocery_products, grocery_product_batches, and grocery_purchase_orders with proper AUTOINCREMENT PK!")
