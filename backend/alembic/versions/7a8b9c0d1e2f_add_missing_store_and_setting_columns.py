"""add_missing_store_and_setting_columns

Revision ID: 7a8b9c0d1e2f
Revises: 6e7f8a9b0c1d
Create Date: 2026-11-22 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, Sequence[str], None] = '6e7f8a9b0c1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # 1. stores missing columns
    if 'stores' in tables:
        cols = [c['name'] for c in insp.get_columns('stores')]
        if 'phone' not in cols:
            op.add_column('stores', sa.Column('phone', sa.String(50), nullable=True))
        if 'address' not in cols:
            op.add_column('stores', sa.Column('address', sa.Text(), nullable=True))
        if 'gst_number' not in cols:
            op.add_column('stores', sa.Column('gst_number', sa.String(50), nullable=True))

    # 2. store_settings missing columns
    if 'store_settings' in tables:
        cols = [c['name'] for c in insp.get_columns('store_settings')]
        if 'allow_negative_stock' not in cols:
            op.add_column('store_settings', sa.Column('allow_negative_stock', sa.Boolean(), server_default='0', nullable=False))
        if 'enable_barcode_scanner' not in cols:
            op.add_column('store_settings', sa.Column('enable_barcode_scanner', sa.Boolean(), server_default='1', nullable=False))
        if 'tax_inclusive_pricing' not in cols:
            op.add_column('store_settings', sa.Column('tax_inclusive_pricing', sa.Boolean(), server_default='0', nullable=False))

    # 3. grocery_products relax product_name not null constraint for legacy compatibility
    if 'grocery_products' in tables:
        cols = {c['name']: c for c in insp.get_columns('grocery_products')}
        if 'product_name' in cols and not cols['product_name']['nullable']:
            if bind.dialect.name == 'mysql':
                op.execute("ALTER TABLE grocery_products MODIFY COLUMN product_name VARCHAR(255) NULL;")
            elif bind.dialect.name != 'sqlite':
                op.alter_column('grocery_products', 'product_name', nullable=True)

    # 4. grocery_purchase_orders relax legacy columns
    if 'grocery_purchase_orders' in tables:
        cols = {c['name']: c for c in insp.get_columns('grocery_purchase_orders')}
        if 'order_number' in cols and not cols['order_number']['nullable']:
            if bind.dialect.name == 'mysql':
                op.execute("ALTER TABLE grocery_purchase_orders MODIFY COLUMN order_number VARCHAR(100) NULL;")
                op.execute("ALTER TABLE grocery_purchase_orders MODIFY COLUMN paid_amount FLOAT NULL DEFAULT 0.0;")
            elif bind.dialect.name != 'sqlite':
                op.alter_column('grocery_purchase_orders', 'order_number', nullable=True)
                op.alter_column('grocery_purchase_orders', 'paid_amount', nullable=True)

    # 5. Fix foreign keys on grocery_purchase_orders
    if 'grocery_purchase_orders' in tables and bind.dialect.name != 'sqlite':
        fks = {fk['name']: fk for fk in insp.get_foreign_keys('grocery_purchase_orders')}
        if 'grocery_purchase_orders_ibfk_2' in fks:
            op.drop_constraint('grocery_purchase_orders_ibfk_2', 'grocery_purchase_orders', type_='foreignkey')

        current_fk_cols = {','.join(fk['constrained_columns']) for fk in insp.get_foreign_keys('grocery_purchase_orders')}
        if 'supplier_id' not in current_fk_cols and 'grocery_suppliers' in tables:
            op.create_foreign_key(
                'fk_grocery_po_supplier',
                'grocery_purchase_orders',
                'grocery_suppliers',
                ['supplier_id'],
                ['id'],
                ondelete='SET NULL'
            )
        if 'product_id' not in current_fk_cols and 'grocery_products' in tables:
            op.create_foreign_key(
                'fk_grocery_po_product',
                'grocery_purchase_orders',
                'grocery_products',
                ['product_id'],
                ['id'],
                ondelete='SET NULL'
            )


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    if 'stores' in tables:
        cols = [c['name'] for c in insp.get_columns('stores')]
        if 'gst_number' in cols:
            op.drop_column('stores', 'gst_number')
        if 'address' in cols:
            op.drop_column('stores', 'address')
        if 'phone' in cols:
            op.drop_column('stores', 'phone')

    if 'store_settings' in tables:
        cols = [c['name'] for c in insp.get_columns('store_settings')]
        if 'tax_inclusive_pricing' in cols:
            op.drop_column('store_settings', 'tax_inclusive_pricing')
        if 'enable_barcode_scanner' in cols:
            op.drop_column('store_settings', 'enable_barcode_scanner')
        if 'allow_negative_stock' in cols:
            op.drop_column('store_settings', 'allow_negative_stock')
