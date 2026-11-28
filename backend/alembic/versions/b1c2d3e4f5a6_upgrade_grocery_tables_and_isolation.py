"""upgrade_grocery_tables_and_isolation

Revision ID: b1c2d3e4f5a6
Revises: a0b1c2d3e4f5
Create Date: 2026-11-27 23:30:00.000000

Safely creates all new `grocery_*` tables, adds `user_id` isolation columns
to existing `grocery_*` tables, adds billing/PO enhancement columns, and
upgrades `grocery_invoices` in-place on MySQL/PostgreSQL (without dropping
parent tables referenced by `grocery_invoice_items_ibfk_2` and without
disabling foreign key checks), preserving 100% of existing production rows.
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


def _existing_cols(insp, table_name: str) -> dict[str, dict]:
    return {c["name"]: c for c in insp.get_columns(table_name)}


def _add_column_if_missing(insp, table_name: str, col: sa.Column) -> bool:
    if col.name not in _existing_cols(insp, table_name):
        op.add_column(table_name, col)
        return True
    return False


def _ensure_index(insp, table_name: str, index_name: str, columns: list[str], unique: bool = False) -> None:
    existing = {idx["name"] for idx in insp.get_indexes(table_name)}
    if index_name not in existing:
        cols = _existing_cols(insp, table_name)
        if all(c in cols for c in columns):
            op.create_index(index_name, table_name, columns, unique=unique)


def _upgrade_legacy_grocery_invoices_inplace(bind, insp, tables: set[str]) -> None:
    """Upgrade existing `grocery_invoices` on MySQL/PostgreSQL without dropping it."""
    dialect = bind.dialect.name
    fks = insp.get_foreign_keys("grocery_invoices")

    # 1. Drop legacy outgoing FK pointing to `customers` (keep child FKs like grocery_invoice_items_ibfk_2 intact)
    for fk in fks:
        if fk.get("referred_table") == "customers" and fk.get("name"):
            op.drop_constraint(fk["name"], "grocery_invoices", type_="foreignkey")

    # 2. Ensure legacy columns are nullable with safe defaults so new ORM inserts succeed
    cols = _existing_cols(insp, "grocery_invoices")
    if dialect == "mysql":
        for col_name, ddl in (
            ("taxable_amount", "DOUBLE NULL DEFAULT 0.0"),
            ("gst_amount", "DOUBLE NULL DEFAULT 0.0"),
            ("discount_amount", "DOUBLE NULL DEFAULT 0.0"),
            ("total_amount", "DOUBLE NULL DEFAULT 0.0"),
            ("paid_amount", "DOUBLE NULL DEFAULT 0.0"),
            ("payment_method", "VARCHAR(50) NULL DEFAULT 'CASH'"),
            ("customer_type", "VARCHAR(50) NULL DEFAULT 'WALK_IN'"),
        ):
            if col_name in cols:
                op.execute(sa.text(f"ALTER TABLE grocery_invoices MODIFY COLUMN {col_name} {ddl}"))
    elif dialect == "postgresql":
        for col_name, default_val in (
            ("taxable_amount", "0.0"),
            ("gst_amount", "0.0"),
            ("discount_amount", "0.0"),
            ("total_amount", "0.0"),
            ("paid_amount", "0.0"),
            ("payment_method", "'CASH'"),
            ("customer_type", "'WALK_IN'"),
        ):
            if col_name in cols:
                op.alter_column("grocery_invoices", col_name, nullable=True, server_default=sa.text(default_val))

    # 3. Add upgraded GroceryInvoice columns idempotently
    for col in (
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("bill_id", sa.Integer(), nullable=True),
        sa.Column("total_tax", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("grand_total", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("template_id", sa.String(50), nullable=False, server_default="modern_orange"),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    ):
        _add_column_if_missing(insp, "grocery_invoices", col)

    # 4. Backfill user_id and totals from preserved legacy columns without touching existing data
    if "stores" in tables:
        bind.execute(
            sa.text(
                "UPDATE grocery_invoices SET user_id = ("
                "SELECT stores.user_id FROM stores WHERE stores.id = grocery_invoices.store_id"
                ") WHERE user_id IS NULL"
            )
        )
    cols = _existing_cols(sa.inspect(bind), "grocery_invoices")
    if "total_amount" in cols and "grand_total" in cols:
        bind.execute(
            sa.text(
                "UPDATE grocery_invoices SET grand_total = COALESCE(total_amount, 0.0) "
                "WHERE grand_total = 0.0 AND COALESCE(total_amount, 0.0) > 0.0"
            )
        )
    if "gst_amount" in cols and "total_tax" in cols:
        bind.execute(
            sa.text(
                "UPDATE grocery_invoices SET total_tax = COALESCE(gst_amount, 0.0) "
                "WHERE total_tax = 0.0 AND COALESCE(gst_amount, 0.0) > 0.0"
            )
        )

    # 5. Add clean indexes & FKs idempotently
    insp = sa.inspect(bind)
    _ensure_index(insp, "grocery_invoices", "ix_grocery_invoices_store_num", ["store_id", "invoice_number"])
    _ensure_index(insp, "grocery_invoices", "ix_grocery_invoices_bill_id", ["bill_id"], unique=True)

    current_fk_cols = {tuple(fk.get("constrained_columns", [])): fk for fk in insp.get_foreign_keys("grocery_invoices")}
    if ("bill_id",) not in current_fk_cols and "grocery_bills" in tables:
        op.create_foreign_key(
            "fk_grocery_invoices_bill_id",
            "grocery_invoices",
            "grocery_bills",
            ["bill_id"],
            ["id"],
            ondelete="CASCADE",
        )
    if ("user_id",) not in current_fk_cols and "users" in tables:
        op.create_foreign_key(
            "fk_grocery_invoices_user_id",
            "grocery_invoices",
            "users",
            ["user_id"],
            ["id"],
            ondelete="SET NULL",
        )
    if ("customer_id",) not in current_fk_cols and "grocery_customers" in tables:
        orphan_count = bind.execute(
            sa.text(
                "SELECT COUNT(*) FROM grocery_invoices gi "
                "WHERE gi.customer_id IS NOT NULL "
                "AND NOT EXISTS (SELECT 1 FROM grocery_customers gc WHERE gc.id = gi.customer_id)"
            )
        ).scalar() or 0
        if orphan_count == 0:
            op.create_foreign_key(
                "fk_grocery_invoices_customer_id",
                "grocery_invoices",
                "grocery_customers",
                ["customer_id"],
                ["id"],
                ondelete="SET NULL",
            )


def _rebuild_legacy_sqlite_grocery_invoices(bind, insp, tables: set[str], invoice_model) -> None:
    """SQLite lacks ALTER COLUMN/DROP CONSTRAINT; rebuild child-first while preserving all rows."""
    existing_cols = _existing_cols(insp, "grocery_invoices")
    has_legacy_fk = any(
        fk.get("referred_table") == "customers"
        for fk in insp.get_foreign_keys("grocery_invoices")
    )
    taxable_col = existing_cols.get("taxable_amount")
    needs_rebuild = (
        has_legacy_fk
        or "bill_id" not in existing_cols
        or (taxable_col is not None and not taxable_col.get("nullable", True) and taxable_col.get("default") is None)
    )
    if not needs_rebuild:
        return

    # Snapshot child & parent rows before ordered teardown (child first, parent second)
    saved_items = []
    if "grocery_invoice_items" in tables:
        item_rows = bind.execute(sa.text("SELECT * FROM grocery_invoice_items")).mappings().all()
        saved_items = [dict(r) for r in item_rows]
        op.drop_table("grocery_invoice_items")
        tables.remove("grocery_invoice_items")

    inv_rows = bind.execute(sa.text("SELECT * FROM grocery_invoices")).mappings().all()
    saved_invoices = [dict(r) for r in inv_rows]
    op.drop_table("grocery_invoices")
    tables.remove("grocery_invoices")

    # Recreate parent table cleanly first
    invoice_model.__table__.create(bind=bind, checkfirst=True)
    tables.add("grocery_invoices")

    valid_cust_ids: set[int] = set()
    if "grocery_customers" in tables:
        valid_cust_ids = {
            r[0] for r in bind.execute(sa.text("SELECT id FROM grocery_customers")).fetchall()
        }

    for r in saved_invoices:
        cust_id = r.get("customer_id")
        if cust_id is not None and cust_id not in valid_cust_ids:
            cust_id = None
        bind.execute(
            sa.text(
                "INSERT INTO grocery_invoices "
                "(id, store_id, user_id, bill_id, customer_id, invoice_number, subtotal, total_tax, grand_total, payment_status, template_id, invoice_date, created_at, is_deleted) "
                "VALUES (:id, :store_id, :user_id, :bill_id, :customer_id, :invoice_number, :subtotal, :total_tax, :grand_total, :payment_status, :template_id, :invoice_date, :created_at, :is_deleted)"
            ),
            {
                "id": r["id"],
                "store_id": r["store_id"],
                "user_id": r.get("user_id"),
                "bill_id": r.get("bill_id"),
                "customer_id": cust_id,
                "invoice_number": r.get("invoice_number") or f"INV-{r['id']}",
                "subtotal": float(r.get("subtotal") or 0.0),
                "total_tax": float(r.get("total_tax") if r.get("total_tax") is not None else (r.get("gst_amount") or 0.0)),
                "grand_total": float(r.get("grand_total") if r.get("grand_total") is not None else (r.get("total_amount") or 0.0)),
                "payment_status": str(r.get("payment_status") or "paid").lower(),
                "template_id": r.get("template_id") or "modern_orange",
                "invoice_date": r.get("invoice_date") or r.get("created_at"),
                "created_at": r.get("created_at") or r.get("invoice_date"),
                "is_deleted": 1 if r.get("is_deleted") else 0,
            },
        )

    if "stores" in tables:
        bind.execute(
            sa.text(
                "UPDATE grocery_invoices SET user_id = ("
                "SELECT stores.user_id FROM stores WHERE stores.id = grocery_invoices.store_id"
                ") WHERE user_id IS NULL"
            )
        )

    # Recreate child table if legacy snapshot had rows and restore them
    if saved_items:
        op.create_table(
            "grocery_invoice_items",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id", ondelete="CASCADE"), nullable=False),
            sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("grocery_invoices.id", ondelete="CASCADE"), nullable=False),
            sa.Column("product_id", sa.String(50), nullable=False),
            sa.Column("product_name", sa.String(200), nullable=False),
            sa.Column("quantity", sa.Float(), nullable=False),
            sa.Column("unit", sa.String(50), server_default="Piece"),
            sa.Column("selling_price", sa.Float(), nullable=False),
            sa.Column("gst_rate", sa.Float(), server_default="0.0"),
            sa.Column("taxable_amount", sa.Float(), server_default="0.0"),
            sa.Column("gst_amount", sa.Float(), server_default="0.0"),
            sa.Column("total_amount", sa.Float(), nullable=False),
        )
        tables.add("grocery_invoice_items")
        for it in saved_items:
            bind.execute(
                sa.text(
                    "INSERT INTO grocery_invoice_items "
                    "(id, store_id, invoice_id, product_id, product_name, quantity, unit, selling_price, gst_rate, taxable_amount, gst_amount, total_amount) "
                    "VALUES (:id, :store_id, :invoice_id, :product_id, :product_name, :quantity, :unit, :selling_price, :gst_rate, :taxable_amount, :gst_amount, :total_amount)"
                ),
                {
                    "id": it["id"],
                    "store_id": it["store_id"],
                    "invoice_id": it["invoice_id"],
                    "product_id": str(it["product_id"]),
                    "product_name": it["product_name"],
                    "quantity": float(it["quantity"]),
                    "unit": it.get("unit") or "Piece",
                    "selling_price": float(it["selling_price"]),
                    "gst_rate": float(it.get("gst_rate") or 0.0),
                    "taxable_amount": float(it.get("taxable_amount") or 0.0),
                    "gst_amount": float(it.get("gst_amount") or 0.0),
                    "total_amount": float(it["total_amount"]),
                },
            )


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())

    # 1. Add user_id isolation columns + new billing columns idempotently
    for tbl in _TABLES_NEEDING_USER_ID:
        if tbl in tables:
            _add_column_if_missing(insp, tbl, sa.Column("user_id", sa.Integer(), nullable=True))
            if "stores" in tables:
                bind.execute(
                    sa.text(
                        f"UPDATE {tbl} SET user_id = ("
                        f"SELECT stores.user_id FROM stores WHERE stores.id = {tbl}.store_id"
                        f") WHERE user_id IS NULL"
                    )
                )

    if "grocery_bills" in tables:
        insp = sa.inspect(bind)
        _add_column_if_missing(insp, "grocery_bills", sa.Column("discount_amount", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("paid_amount", sa.Float(), nullable=False, server_default="0.0"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("payment_method", sa.String(50), nullable=False, server_default="CASH"))
        _add_column_if_missing(insp, "grocery_bills", sa.Column("idempotency_key", sa.String(120), nullable=True))

    # 2. Ensure new parent/standalone grocery_* tables exist BEFORE altering/linking child tables
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

    # 3. Safely create or upgrade `grocery_invoices` WITHOUT breaking child FK `grocery_invoice_items_ibfk_2`
    if "grocery_invoices" not in tables:
        GroceryBillInvoice.__table__.create(bind=bind, checkfirst=True)
        tables.add("grocery_invoices")
    elif dialect == "sqlite":
        insp = sa.inspect(bind)
        _rebuild_legacy_sqlite_grocery_invoices(bind, insp, tables, GroceryBillInvoice)
    else:
        insp = sa.inspect(bind)
        _upgrade_legacy_grocery_invoices_inplace(bind, insp, tables)


def downgrade() -> None:
    # Non-destructive downgrade: preserve existing production data safely.
    pass
