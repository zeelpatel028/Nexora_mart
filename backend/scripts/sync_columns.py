import sys
sys.path.insert(0, 'backend')
from app.database.connection import engine
import sqlalchemy as sa

insp = sa.inspect(engine)
with engine.connect() as conn:
    prod_cols = {c['name'] for c in insp.get_columns('grocery_products')}
    prod_defs = [
        ('name', 'VARCHAR(255)'),
        ('supplier_id', 'INTEGER'),
        ('purchase_price_with_tax', 'FLOAT DEFAULT 0.0'),
        ('purchase_gst_rate', 'FLOAT DEFAULT 0.0'),
        ('purchase_unit', "VARCHAR(50) DEFAULT 'Piece'"),
        ('selling_price_with_tax', 'FLOAT DEFAULT 0.0'),
        ('selling_unit', "VARCHAR(50) DEFAULT 'Piece'"),
        ('selling_gst_rate', 'FLOAT DEFAULT 0.0'),
        ('available_stock', 'FLOAT DEFAULT 0.0'),
        ('low_stock_enabled', 'BOOLEAN DEFAULT 0'),
        ('low_stock_qty', 'FLOAT DEFAULT 5.0'),
        ('expiry_alert_enabled', 'BOOLEAN DEFAULT 0'),
        ('is_active', 'BOOLEAN DEFAULT 1'),
        ('is_deleted', 'BOOLEAN DEFAULT 0'),
    ]
    for col, col_type in prod_defs:
        if col not in prod_cols:
            print(f'Adding {col} to grocery_products...')
            conn.execute(sa.text(f'ALTER TABLE grocery_products ADD COLUMN {col} {col_type}'))
    
    po_cols = {c['name'] for c in insp.get_columns('grocery_purchase_orders')}
    po_defs = [
        ('order_code', 'VARCHAR(100)'),
        ('product_id', 'INTEGER'),
        ('qty', 'FLOAT DEFAULT 0.0'),
        ('unit', "VARCHAR(50) DEFAULT 'Piece'"),
        ('purchase_price', 'FLOAT DEFAULT 0.0'),
        ('status', "VARCHAR(50) DEFAULT 'placed'"),
        ('received_at', 'DATETIME'),
        ('expiry_date', 'DATETIME'),
        ('payment_status', "VARCHAR(50) DEFAULT 'pending'"),
        ('paid_at', 'DATETIME'),
        ('updated_at', 'DATETIME'),
        ('is_deleted', 'BOOLEAN DEFAULT 0'),
    ]
    for col, col_type in po_defs:
        if col not in po_cols:
            print(f'Adding {col} to grocery_purchase_orders...')
            conn.execute(sa.text(f'ALTER TABLE grocery_purchase_orders ADD COLUMN {col} {col_type}'))
    
    conn.commit()
print('All columns synchronized successfully!')
