"""add_store_prefixes_ledgers_and_store_operations

Revision ID: 5d6e7f8a9b0c
Revises: 4c5d6e7f8a9b
Create Date: 2026-11-22 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '5d6e7f8a9b0c'
down_revision: Union[str, Sequence[str], None] = '4c5d6e7f8a9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # 1. store_prefixes table
    if 'store_prefixes' not in tables:
        op.create_table(
            'store_prefixes',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('invoice_prefix', sa.String(length=20), server_default='INV', nullable=False),
            sa.Column('debit_customer_prefix', sa.String(length=20), server_default='DC', nullable=False),
            sa.Column('walk_in_customer_prefix', sa.String(length=20), server_default='WC', nullable=False),
            sa.Column('supplier_prefix', sa.String(length=20), server_default='SUP', nullable=False),
            sa.Column('order_prefix', sa.String(length=20), server_default='ORD', nullable=False),
            sa.Column('product_prefix', sa.String(length=20), server_default='PRD', nullable=False),
            sa.Column('employee_prefix', sa.String(length=20), server_default='EMP', nullable=False),
            sa.Column('return_prefix', sa.String(length=20), server_default='RET', nullable=False),
            sa.Column('refund_prefix', sa.String(length=20), server_default='REF', nullable=False),
            sa.Column('expense_prefix', sa.String(length=20), server_default='EXP', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('store_id')
        )

    # 2. customer_ledger table
    if 'customer_ledger' not in tables:
        op.create_table(
            'customer_ledger',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id', ondelete='CASCADE'), nullable=False),
            sa.Column('transaction_type', sa.String(length=50), nullable=False),
            sa.Column('reference_type', sa.String(length=50), nullable=True),
            sa.Column('reference_id', sa.String(length=100), nullable=True),
            sa.Column('debit', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('credit', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('balance', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('transaction_date', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 3. supplier_ledger table
    if 'supplier_ledger' not in tables:
        op.create_table(
            'supplier_ledger',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('supplier_id', sa.Integer(), sa.ForeignKey('suppliers.id', ondelete='CASCADE'), nullable=False),
            sa.Column('transaction_type', sa.String(length=50), nullable=False),
            sa.Column('reference_type', sa.String(length=50), nullable=True),
            sa.Column('reference_id', sa.String(length=100), nullable=True),
            sa.Column('debit', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('credit', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('balance', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('transaction_date', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 4. invoice_payments table
    if 'invoice_payments' not in tables:
        op.create_table(
            'invoice_payments',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('invoice_id', sa.Integer(), sa.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False),
            sa.Column('amount', sa.Float(), nullable=False),
            sa.Column('payment_method', sa.String(length=50), server_default='CASH', nullable=False),
            sa.Column('payment_date', sa.DateTime(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 5. purchase_order_payments table
    if 'purchase_order_payments' not in tables:
        op.create_table(
            'purchase_order_payments',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('purchase_order_id', sa.Integer(), sa.ForeignKey('purchases.id', ondelete='CASCADE'), nullable=False),
            sa.Column('amount', sa.Float(), nullable=False),
            sa.Column('payment_method', sa.String(length=50), server_default='CASH', nullable=False),
            sa.Column('payment_date', sa.DateTime(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 6. Store-wise operation tables (inventory, purchase orders, invoices)
    categories = ['grocery', 'clothing', 'medical', 'electronics', 'plastic', 'handloom', 'furniture', 'agro']
    for cat in categories:
        inv_table = f"{cat}_inventory"
        if inv_table not in tables:
            op.create_table(
                inv_table,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('product_id', sa.String(length=50), nullable=False),
                sa.Column('current_stock', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('reorder_level', sa.Float(), server_default='5.0', nullable=False),
                sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False),
                sa.Column('last_updated', sa.DateTime(), nullable=True),
                sa.PrimaryKeyConstraint('id')
            )

        po_table = f"{cat}_purchase_orders"
        po_item_table = f"{cat}_purchase_order_items"
        if po_table not in tables:
            op.create_table(
                po_table,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('supplier_id', sa.Integer(), sa.ForeignKey('suppliers.id', ondelete='SET NULL'), nullable=True),
                sa.Column('order_number', sa.String(length=100), nullable=False),
                sa.Column('order_date', sa.DateTime(), nullable=True),
                sa.Column('expected_delivery_date', sa.DateTime(), nullable=True),
                sa.Column('total_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('paid_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('order_status', sa.String(length=50), server_default='Pending', nullable=False),
                sa.Column('payment_status', sa.String(length=50), server_default='Pending', nullable=False),
                sa.Column('notes', sa.Text(), nullable=True),
                sa.Column('created_at', sa.DateTime(), nullable=True),
                sa.PrimaryKeyConstraint('id')
            )

        if po_item_table not in tables:
            op.create_table(
                po_item_table,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('order_id', sa.Integer(), sa.ForeignKey(f'{po_table}.id', ondelete='CASCADE'), nullable=False),
                sa.Column('product_id', sa.String(length=50), nullable=False),
                sa.Column('product_name', sa.String(length=200), nullable=False),
                sa.Column('quantity', sa.Float(), nullable=False),
                sa.Column('received_quantity', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False),
                sa.Column('purchase_price', sa.Float(), nullable=False),
                sa.Column('gst_rate', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('total_amount', sa.Float(), nullable=False),
                sa.Column('batch_number', sa.String(length=100), nullable=True),
                sa.Column('expiry_date', sa.DateTime(), nullable=True),
                sa.PrimaryKeyConstraint('id')
            )

        inv_bill_table = f"{cat}_invoices"
        inv_bill_item_table = f"{cat}_invoice_items"
        if inv_bill_table not in tables:
            op.create_table(
                inv_bill_table,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id', ondelete='SET NULL'), nullable=True),
                sa.Column('invoice_number', sa.String(length=100), nullable=False),
                sa.Column('invoice_date', sa.DateTime(), nullable=True),
                sa.Column('subtotal', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('taxable_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('gst_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('discount_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('total_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('paid_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('payment_status', sa.String(length=50), server_default='PAID', nullable=False),
                sa.Column('payment_method', sa.String(length=50), server_default='CASH', nullable=False),
                sa.Column('customer_type', sa.String(length=50), server_default='WALK_IN', nullable=False),
                sa.Column('customer_name', sa.String(length=150), nullable=True),
                sa.Column('customer_phone', sa.String(length=50), nullable=True),
                sa.Column('notes', sa.Text(), nullable=True),
                sa.Column('created_at', sa.DateTime(), nullable=True),
                sa.PrimaryKeyConstraint('id')
            )

        if inv_bill_item_table not in tables:
            op.create_table(
                inv_bill_item_table,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('invoice_id', sa.Integer(), sa.ForeignKey(f'{inv_bill_table}.id', ondelete='CASCADE'), nullable=False),
                sa.Column('product_id', sa.String(length=50), nullable=False),
                sa.Column('product_name', sa.String(length=200), nullable=False),
                sa.Column('quantity', sa.Float(), nullable=False),
                sa.Column('unit', sa.String(length=50), server_default='Piece', nullable=False),
                sa.Column('selling_price', sa.Float(), nullable=False),
                sa.Column('gst_rate', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('taxable_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('gst_amount', sa.Float(), server_default='0.0', nullable=False),
                sa.Column('total_amount', sa.Float(), nullable=False),
                sa.PrimaryKeyConstraint('id')
            )


def downgrade() -> None:
    pass
