"""migrate_to_store_isolated_grocery_tables

Revision ID: 6e7f8a9b0c1d
Revises: 5d6e7f8a9b0c
Create Date: 2026-11-22 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

revision: str = '6e7f8a9b0c1d'
down_revision: Union[str, Sequence[str], None] = '5d6e7f8a9b0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()
    is_mysql = bind.dialect.name == 'mysql'

    # 1. grocery_prefixes
    if 'grocery_prefixes' not in tables:
        op.create_table(
            'grocery_prefixes',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('key', sa.String(length=50), nullable=False),
            sa.Column('prefix_value', sa.String(length=20), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('store_id', 'key', name='uq_grocery_prefixes_store_key')
        )

    # 2. grocery_id_counters
    if 'grocery_id_counters' not in tables:
        op.create_table(
            'grocery_id_counters',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('key', sa.String(length=50), nullable=False),
            sa.Column('last_number', sa.Integer(), server_default='0', nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('store_id', 'key', name='uq_grocery_id_counters_store_key')
        )

    # 3. grocery_gst_rates
    if 'grocery_gst_rates' not in tables:
        op.create_table(
            'grocery_gst_rates',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('rate', sa.Float(), nullable=False, unique=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 4. grocery_units
    if 'grocery_units' not in tables:
        op.create_table(
            'grocery_units',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('name', sa.String(length=50), nullable=False, unique=True),
            sa.Column('short_name', sa.String(length=20), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 5. grocery_suppliers
    if 'grocery_suppliers' not in tables:
        op.create_table(
            'grocery_suppliers',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('supplier_code', sa.String(length=100), nullable=False),
            sa.Column('store_name', sa.String(length=255), nullable=False),
            sa.Column('seller_name', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=True),
            sa.Column('address', sa.Text(), nullable=True),
            sa.Column('gst_number', sa.String(length=50), nullable=True),
            sa.Column('bank_name', sa.String(length=100), nullable=True),
            sa.Column('account_holder', sa.String(length=100), nullable=True),
            sa.Column('account_number', sa.String(length=100), nullable=True),
            sa.Column('ifsc', sa.String(length=50), nullable=True),
            sa.Column('upi_id', sa.String(length=100), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 6. grocery_customers
    if 'grocery_customers' not in tables:
        op.create_table(
            'grocery_customers',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('customer_code', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=False),
            sa.Column('address', sa.Text(), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 7. grocery_products
    if 'grocery_products' not in tables:
        op.create_table(
            'grocery_products',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_code', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('supplier_id', sa.Integer(), sa.ForeignKey('grocery_suppliers.id', ondelete='SET NULL'), nullable=True),
            sa.Column('purchase_price_with_tax', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('purchase_gst_rate', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('purchase_unit', sa.String(length=50), server_default='Piece', nullable=False),
            sa.Column('selling_price_with_tax', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('selling_unit', sa.String(length=50), server_default='Piece', nullable=False),
            sa.Column('selling_gst_rate', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('available_stock', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('low_stock_enabled', sa.Boolean(), server_default='0', nullable=False),
            sa.Column('low_stock_qty', sa.Float(), server_default='5.0', nullable=False),
            sa.Column('expiry_alert_enabled', sa.Boolean(), server_default='0', nullable=False),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        prod_cols = {c['name'] for c in insp.get_columns('grocery_products')}
        if 'name' not in prod_cols:
            op.add_column('grocery_products', sa.Column('name', sa.String(length=255), nullable=True))
            bind.execute(text("UPDATE grocery_products SET name = product_name WHERE name IS NULL AND product_name IS NOT NULL"))
        if 'supplier_id' not in prod_cols:
            op.add_column('grocery_products', sa.Column('supplier_id', sa.Integer(), nullable=True))
        if 'purchase_price_with_tax' not in prod_cols:
            op.add_column('grocery_products', sa.Column('purchase_price_with_tax', sa.Float(), server_default='0.0', nullable=False))
        if 'purchase_gst_rate' not in prod_cols:
            op.add_column('grocery_products', sa.Column('purchase_gst_rate', sa.Float(), server_default='0.0', nullable=False))
        if 'purchase_unit' not in prod_cols:
            op.add_column('grocery_products', sa.Column('purchase_unit', sa.String(length=50), server_default='Piece', nullable=False))
        if 'selling_price_with_tax' not in prod_cols:
            op.add_column('grocery_products', sa.Column('selling_price_with_tax', sa.Float(), server_default='0.0', nullable=False))
        if 'selling_unit' not in prod_cols:
            op.add_column('grocery_products', sa.Column('selling_unit', sa.String(length=50), server_default='Piece', nullable=False))
        if 'selling_gst_rate' not in prod_cols:
            op.add_column('grocery_products', sa.Column('selling_gst_rate', sa.Float(), server_default='0.0', nullable=False))
        if 'available_stock' not in prod_cols:
            op.add_column('grocery_products', sa.Column('available_stock', sa.Float(), server_default='0.0', nullable=False))
        if 'low_stock_enabled' not in prod_cols:
            op.add_column('grocery_products', sa.Column('low_stock_enabled', sa.Boolean(), server_default='0', nullable=False))
        if 'low_stock_qty' not in prod_cols:
            op.add_column('grocery_products', sa.Column('low_stock_qty', sa.Float(), server_default='5.0', nullable=False))
        if 'expiry_alert_enabled' not in prod_cols:
            op.add_column('grocery_products', sa.Column('expiry_alert_enabled', sa.Boolean(), server_default='0', nullable=False))
        if 'is_active' not in prod_cols:
            op.add_column('grocery_products', sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False))
        if 'is_deleted' not in prod_cols:
            op.add_column('grocery_products', sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False))

    # 8. grocery_product_batches
    # Foreign key product_id references grocery_products.id which is String(36)
    if 'grocery_product_batches' not in tables:
        op.create_table(
            'grocery_product_batches',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.String(length=36), sa.ForeignKey('grocery_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('purchase_order_id', sa.Integer(), nullable=True),
            sa.Column('qty', sa.Float(), nullable=False),
            sa.Column('remaining_qty', sa.Float(), nullable=False),
            sa.Column('expiry_date', sa.DateTime(), nullable=True),
            sa.Column('received_at', sa.DateTime(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 9. grocery_purchase_orders
    if 'grocery_purchase_orders' not in tables:
        op.create_table(
            'grocery_purchase_orders',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('order_code', sa.String(length=100), nullable=False),
            sa.Column('supplier_id', sa.Integer(), sa.ForeignKey('grocery_suppliers.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_id', sa.String(length=36), sa.ForeignKey('grocery_products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('qty', sa.Float(), nullable=False),
            sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False),
            sa.Column('purchase_price', sa.Float(), nullable=False),
            sa.Column('total_amount', sa.Float(), nullable=False),
            sa.Column('expected_delivery_date', sa.DateTime(), nullable=True),
            sa.Column('status', sa.String(length=50), server_default='placed', nullable=False),
            sa.Column('received_at', sa.DateTime(), nullable=True),
            sa.Column('expiry_date', sa.DateTime(), nullable=True),
            sa.Column('payment_status', sa.String(length=50), server_default='pending', nullable=False),
            sa.Column('paid_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        po_cols = {c['name'] for c in insp.get_columns('grocery_purchase_orders')}
        if 'order_code' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('order_code', sa.String(length=100), nullable=True))
            bind.execute(text("UPDATE grocery_purchase_orders SET order_code = order_number WHERE order_code IS NULL AND order_number IS NOT NULL"))
        if 'product_id' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('product_id', sa.String(length=36), nullable=True))
        if 'qty' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('qty', sa.Float(), server_default='0.0', nullable=False))
        if 'unit' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False))
        if 'purchase_price' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('purchase_price', sa.Float(), server_default='0.0', nullable=False))
        if 'status' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('status', sa.String(length=50), server_default='placed', nullable=False))
        if 'received_at' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('received_at', sa.DateTime(), nullable=True))
        if 'expiry_date' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('expiry_date', sa.DateTime(), nullable=True))
        if 'payment_status' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('payment_status', sa.String(length=50), server_default='pending', nullable=False))
        if 'paid_at' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('paid_at', sa.DateTime(), nullable=True))
        if 'updated_at' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('updated_at', sa.DateTime(), nullable=True))
        if 'is_deleted' not in po_cols:
            op.add_column('grocery_purchase_orders', sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False))

    # 10. grocery_bills
    if 'grocery_bills' not in tables:
        op.create_table(
            'grocery_bills',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('invoice_code', sa.String(length=100), nullable=False),
            sa.Column('customer_type', sa.String(length=50), nullable=False),
            sa.Column('customer_id', sa.Integer(), sa.ForeignKey('grocery_customers.id', ondelete='SET NULL'), nullable=True),
            sa.Column('walk_in_name', sa.String(length=255), nullable=True),
            sa.Column('walk_in_phone', sa.String(length=50), nullable=True),
            sa.Column('walk_in_address', sa.Text(), nullable=True),
            sa.Column('subtotal', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('total_tax', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('grand_total', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('payment_status', sa.String(length=50), server_default='unpaid', nullable=False),
            sa.Column('paid_at', sa.DateTime(), nullable=True),
            sa.Column('template_id', sa.String(length=50), server_default='modern_orange', nullable=False),
            sa.Column('created_by', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('is_deleted', sa.Boolean(), server_default='0', nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 11. grocery_bill_items
    if 'grocery_bill_items' not in tables:
        op.create_table(
            'grocery_bill_items',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('bill_id', sa.Integer(), sa.ForeignKey('grocery_bills.id', ondelete='CASCADE'), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.String(length=36), sa.ForeignKey('grocery_products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(length=255), nullable=False),
            sa.Column('price_with_tax', sa.Float(), nullable=False),
            sa.Column('base_price', sa.Float(), nullable=False),
            sa.Column('gst_rate', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('tax_amount', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False),
            sa.Column('qty', sa.Float(), server_default='1.0', nullable=False),
            sa.Column('line_total', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 12. grocery_settings
    if 'grocery_settings' not in tables:
        op.create_table(
            'grocery_settings',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), unique=True, nullable=False),
            sa.Column('theme', sa.String(length=50), server_default='system', nullable=False),
            sa.Column('language', sa.String(length=20), server_default='en', nullable=False),
            sa.Column('currency_code', sa.String(length=10), server_default='INR', nullable=False),
            sa.Column('currency_symbol', sa.String(length=10), server_default='₹', nullable=False),
            sa.Column('bill_template_id', sa.String(length=50), server_default='modern_orange', nullable=False),
            sa.Column('bill_sound_enabled', sa.Boolean(), server_default='1', nullable=False),
            sa.Column('bill_sound_id', sa.String(length=50), server_default='sound_gpay', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 13. grocery_stock_movements
    if 'grocery_stock_movements' not in tables:
        op.create_table(
            'grocery_stock_movements',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.String(length=36), sa.ForeignKey('grocery_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=False),
            sa.Column('qty', sa.Float(), nullable=False),
            sa.Column('ref_id', sa.String(length=100), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 14. grocery_backups
    if 'grocery_backups' not in tables:
        op.create_table(
            'grocery_backups',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('file_url', sa.String(length=500), nullable=False),
            sa.Column('size', sa.Integer(), server_default='0', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # =========================================================================
    # SAFE DATA MIGRATION WITHOUT DATA LOSS
    # =========================================================================
    try:
        if 'suppliers' in tables:
            if is_mysql:
                bind.execute(text("""
                    INSERT IGNORE INTO grocery_suppliers (
                        id, store_id, supplier_code, store_name, seller_name, phone, email, address, gst_number,
                        is_active, created_at, updated_at, is_deleted
                    )
                    SELECT 
                        id, store_id, 
                        COALESCE(NULLIF(supplier_code, ''), CONCAT('S001_SUP_', LPAD(id, 4, '0'))),
                        COALESCE(company_name, name, 'Store Supplier'),
                        COALESCE(name, 'Supplier'),
                        COALESCE(phone, ''),
                        email, address, gst_number,
                        COALESCE(is_active, 1),
                        COALESCE(created_at, CURRENT_TIMESTAMP),
                        COALESCE(updated_at, CURRENT_TIMESTAMP),
                        0
                    FROM suppliers;
                """))
            else:
                bind.execute(text("""
                    INSERT OR IGNORE INTO grocery_suppliers (
                        id, store_id, supplier_code, store_name, seller_name, phone, email, address, gst_number,
                        is_active, created_at, updated_at, is_deleted
                    )
                    SELECT 
                        id, store_id, 
                        COALESCE(NULLIF(supplier_code, ''), 'S001_SUP_' || SUBSTR('0000' || id, -4, 4)),
                        COALESCE(company_name, name, 'Store Supplier'),
                        COALESCE(name, 'Supplier'),
                        COALESCE(phone, ''),
                        email, address, gst_number,
                        COALESCE(is_active, 1),
                        COALESCE(created_at, CURRENT_TIMESTAMP),
                        COALESCE(updated_at, CURRENT_TIMESTAMP),
                        0
                    FROM suppliers;
                """))
    except Exception:
        pass

    try:
        if 'customers' in tables:
            if is_mysql:
                bind.execute(text("""
                    INSERT IGNORE INTO grocery_customers (
                        id, store_id, customer_code, name, phone, address, is_active, created_at, updated_at, is_deleted
                    )
                    SELECT 
                        id, store_id,
                        COALESCE(NULLIF(customer_code, ''), CONCAT('S001_KHT_', LPAD(id, 4, '0'))),
                        COALESCE(name, 'Customer'),
                        COALESCE(phone, ''),
                        address,
                        COALESCE(is_active, 1),
                        COALESCE(created_at, CURRENT_TIMESTAMP),
                        COALESCE(updated_at, CURRENT_TIMESTAMP),
                        0
                    FROM customers;
                """))
            else:
                bind.execute(text("""
                    INSERT OR IGNORE INTO grocery_customers (
                        id, store_id, customer_code, name, phone, address, is_active, created_at, updated_at, is_deleted
                    )
                    SELECT 
                        id, store_id,
                        COALESCE(NULLIF(customer_code, ''), 'S001_KHT_' || SUBSTR('0000' || id, -4, 4)),
                        COALESCE(name, 'Customer'),
                        COALESCE(phone, ''),
                        address,
                        COALESCE(is_active, 1),
                        COALESCE(created_at, CURRENT_TIMESTAMP),
                        COALESCE(updated_at, CURRENT_TIMESTAMP),
                        0
                    FROM customers;
                """))
    except Exception:
        pass


def downgrade() -> None:
    # Downgrade drops new grocery_* tables safely without touching base tables
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    tables_to_drop = [
        'grocery_bill_items',
        'grocery_bills',
        'grocery_product_batches',
        'grocery_stock_movements',
        'grocery_backups',
        'grocery_settings',
        'grocery_units',
        'grocery_gst_rates',
        'grocery_id_counters',
        'grocery_prefixes'
    ]

    for t in tables_to_drop:
        if t in tables:
            op.drop_table(t)
