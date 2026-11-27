"""upgrade_grocery_tables_and_isolation

Revision ID: b1c2d3e4f5a6
Revises: a0b1c2d3e4f5
Create Date: 2026-11-27 23:30:00.000000

Safely creates all new `grocery_*` tables, adds `user_id` isolation columns
to existing `grocery_*` tables, adds billing/PO enhancement columns, and
backfills `user_id` from `stores.user_id` without deleting or modifying any
unrelated user/store tables.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "a0b1c2d3e4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_TABLES_NEEDING_USER_ID = (
    "grocery_products",
    "grocery_product_batches",
    "grocery_stock_movements",
    "grocery_suppliers",
    "grocery_customers",
    "grocery_purchase_orders",
    "grocery_bills",
    "grocery_prefixes",
    "grocery_settings",
    "grocery_backups",
)


def _existing_cols(insp, table_name: str) -> set[str]:
    return {c["name"] for c in insp.get_columns(table_name)}


def _add_column_if_missing(insp, table_name: str, col: sa.Column) -> None:
    if col.name not in _existing_cols(insp, table_name):
        op.add_column(table_name, col)


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())

    # 1. Add user_id isolation columns + new billing/order columns idempotently
    for tbl in _TABLES_NEEDING_USER_ID:
        if tbl in tables:
            _add_column_if_missing(
                insp,
                tbl,
                sa.Column("user_id", sa.Integer(), nullable=True),
            )
            if "stores" in tables:
                bind.execute(
                    sa.text(
                        f"UPDATE {tbl} SET user_id = ("
                        f"SELECT stores.user_id FROM stores WHERE stores.id = {tbl}.store_id"
                        f") WHERE user_id IS NULL"
                    )
                )

    if "grocery_bills" in tables:
        _add_column_if_missing(insp, "grocery_bills", sa.Column("discount_amount", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("paid_amount", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("payment_method", sa.String(50), nullable=False, server_default="CASH"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("idempotency_key", sa.String(120), nullable=True))

    # Rebuild legacy placeholder grocery_invoices table safely without losing rows
    if "grocery_invoices" in tables:
        existing_inv_cols = _existing_cols(insp, "grocery_invoices")
        has_legacy_fk = any(
            fk.get("referred_table") == "customers"
            for fk in insp.get_foreign_keys("grocery_invoices")
        )
        if "bill_id" not in existing_inv_cols or "taxable_amount" in existing_inv_cols or has_legacy_fk:
            legacy_count = bind.execute(sa.text("SELECT COUNT(*) FROM grocery_invoices")).scalar() or 0
            if legacy_count == 0:
                op.drop_table("grocery_invoices")
                tables.remove("grocery_invoices")
            elif "grocery_invoices_legacy" in tables:
                # Preserve legacy rows safely into grocery_invoices_legacy before replacing schema
                bind.execute(
                    sa.text(
                        "INSERT INTO grocery_invoices_legacy (store_id, customer_id, invoice_number, invoice_date, subtotal, taxable_amount, gst_amount, discount_amount, total_amount, paid_amount, payment_status, payment_method, customer_type, customer_name, customer_phone, notes, created_at) "
                        "SELECT store_id, customer_id, invoice_number, invoice_date, subtotal, taxable_amount, gst_amount, discount_amount, total_amount, paid_amount, payment_status, payment_method, customer_type, customer_name, customer_phone, notes, created_at FROM grocery_invoices"
                    )
                )
                op.drop_table("grocery_invoices")
                tables.remove("grocery_invoices")
            else:
                op.rename_table("grocery_invoices", "grocery_invoices_legacy")
                tables.remove("grocery_invoices")
                tables.add("grocery_invoices_legacy")

    # 2. Ensure all new grocery_* tables exist cleanly
    from app.models import (  # noqa: F401
        GroceryStorePrefix,
        GroceryOrder,
        GroceryOrderItem,
        GroceryBillInvoice,
        GroceryExpense,
        GroceryPayment,
        GroceryReturn,
        GroceryRefund,
        GroceryEmployee,
    )

    for model in (
        GroceryStorePrefix,
        GroceryOrder,
        GroceryOrderItem,
        GroceryBillInvoice,
        GroceryExpense,
        GroceryPayment,
        GroceryReturn,
        GroceryRefund,
        GroceryEmployee,
    ):
        tbl_obj = model.__table__
        if tbl_obj.name not in tables:
            tbl_obj.create(bind=bind, checkfirst=True)
            tables.add(tbl_obj.name)

    # Refresh grocery_invoices columns if table already existed from store_specific_operations
    if "grocery_invoices" in tables:
        insp = sa.inspect(bind)
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("user_id", sa.Integer(), nullable=True))
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("bill_id", sa.Integer(), nullable=True))
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("total_tax", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("grand_total", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("template_id", sa.String(50), nullable=False, server_default="modern_orange"))
        _add_column_if_missing(insp, "grocery_invoices", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    # Non-destructive downgrade: preserve existing user/store data safely.
    pass
