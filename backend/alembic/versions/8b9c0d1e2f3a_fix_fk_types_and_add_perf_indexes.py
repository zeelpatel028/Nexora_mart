"""fix_fk_types_and_add_perf_indexes

Revision ID: 8b9c0d1e2f3a
Revises: 7a8b9c0d1e2f
Create Date: 2026-11-26 00:00:00.000000

Safely aligns foreign key column types (for PostgreSQL/MySQL strict FK compatibility)
and adds composite performance indexes across multi-store tables without dropping data.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "8b9c0d1e2f3a"
down_revision: Union[str, Sequence[str], None] = "7a8b9c0d1e2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _ensure_index(insp, table_name: str, index_name: str, columns: list[str]) -> None:
    if table_name not in insp.get_table_names():
        return
    existing = {idx["name"] for idx in insp.get_indexes(table_name)}
    if index_name not in existing:
        table_cols = {c["name"] for c in insp.get_columns(table_name)}
        if all(col in table_cols for col in columns):
            op.create_index(index_name, table_name, columns, unique=False)


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())
    dialect = bind.dialect.name

    # 1. Align FK column types on PostgreSQL / MySQL safely without data loss
    if dialect in ("postgresql", "mysql"):
        if "grocery_product_details_v2" in tables:
            cols = {c["name"]: c for c in insp.get_columns("grocery_product_details_v2")}
            if "grocery_product_id" in cols and "INT" in str(cols["grocery_product_id"]["type"]).upper():
                for fk in insp.get_foreign_keys("grocery_product_details_v2"):
                    if "grocery_product_id" in fk.get("constrained_columns", []):
                        op.drop_constraint(fk["name"], "grocery_product_details_v2", type_="foreignkey")
                if dialect == "postgresql":
                    op.execute(
                        "ALTER TABLE grocery_product_details_v2 "
                        "ALTER COLUMN grocery_product_id TYPE VARCHAR(36) USING grocery_product_id::varchar(36)"
                    )
                else:
                    op.execute(
                        "ALTER TABLE grocery_product_details_v2 "
                        "MODIFY COLUMN grocery_product_id VARCHAR(36) NOT NULL"
                    )
                if "grocery_products" in tables:
                    op.create_foreign_key(
                        "fk_grocery_pd_v2_product",
                        "grocery_product_details_v2",
                        "grocery_products",
                        ["grocery_product_id"],
                        ["id"],
                        ondelete="CASCADE",
                    )

        for tbl, fk_name, on_delete in [
            ("order_items", "fk_order_items_product", None),
            ("product_stock", "fk_product_stock_product", "CASCADE"),
            ("purchase_items", "fk_purchase_items_product", None),
            ("return_items", "fk_return_items_product", None),
            ("stock_adjustments", "fk_stock_adjustments_product", "CASCADE"),
        ]:
            if tbl not in tables:
                continue
            cols = {c["name"]: c for c in insp.get_columns(tbl)}
            if "product_id" in cols and "CHAR" in str(cols["product_id"]["type"]).upper():
                for fk in insp.get_foreign_keys(tbl):
                    if "product_id" in fk.get("constrained_columns", []):
                        op.drop_constraint(fk["name"], tbl, type_="foreignkey")
                if dialect == "postgresql":
                    op.execute(f"ALTER TABLE {tbl} ALTER COLUMN product_id TYPE INTEGER USING product_id::integer")
                else:
                    op.execute(f"ALTER TABLE {tbl} MODIFY COLUMN product_id INT NOT NULL")
                if "products" in tables:
                    op.create_foreign_key(
                        fk_name,
                        tbl,
                        "products",
                        ["product_id"],
                        ["id"],
                        ondelete=on_delete,
                    )

    # 2. Composite performance indexes for store-isolated queries
    _ensure_index(insp, "invoices", "ix_invoices_store_cust_status", ["store_id", "customer_id", "payment_status"])
    _ensure_index(insp, "invoices", "ix_invoices_store_date", ["store_id", "invoice_date"])
    _ensure_index(insp, "purchases", "ix_purchases_store_supp_status", ["store_id", "supplier_id", "payment_status"])
    _ensure_index(insp, "customers", "ix_customers_store_active_name", ["store_id", "is_active", "name"])
    _ensure_index(insp, "suppliers", "ix_suppliers_store_active_name", ["store_id", "is_active", "name"])
    _ensure_index(insp, "products", "ix_products_store_status_cat", ["store_id", "status", "category_id"])
    _ensure_index(insp, "expenses", "ix_expenses_store_date", ["store_id", "expense_date"])
    _ensure_index(insp, "payments", "ix_payments_store_ref", ["store_id", "reference_type", "reference_id"])
    _ensure_index(insp, "grocery_bills", "ix_grocery_bills_store_type_pay", ["store_id", "customer_type", "payment_status"])
    _ensure_index(insp, "grocery_purchase_orders", "ix_grocery_po_store_status_pay", ["store_id", "status", "payment_status"])
    _ensure_index(insp, "grocery_products", "ix_grocery_products_store_active_del", ["store_id", "is_deleted", "is_active"])


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    for tbl, idx_name in [
        ("invoices", "ix_invoices_store_cust_status"),
        ("invoices", "ix_invoices_store_date"),
        ("purchases", "ix_purchases_store_supp_status"),
        ("customers", "ix_customers_store_active_name"),
        ("suppliers", "ix_suppliers_store_active_name"),
        ("products", "ix_products_store_status_cat"),
        ("expenses", "ix_expenses_store_date"),
        ("payments", "ix_payments_store_ref"),
        ("grocery_bills", "ix_grocery_bills_store_type_pay"),
        ("grocery_purchase_orders", "ix_grocery_po_store_status_pay"),
        ("grocery_products", "ix_grocery_products_store_active_del"),
    ]:
        if tbl in insp.get_table_names():
            existing = {idx["name"] for idx in insp.get_indexes(tbl)}
            if idx_name in existing:
                op.drop_index(idx_name, table_name=tbl)
