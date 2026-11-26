"""align_int_pks_for_settings_images_variants

Revision ID: 9c0d1e2f3a4b
Revises: 8b9c0d1e2f3a
Create Date: 2026-11-26 20:45:00.000000

Safely ensures `store_settings.id`, `product_images.id`, and `product_variants.id`
use integer AUTO_INCREMENT primary keys matching the existing production Aiven
MySQL schema and all referencing foreign keys (`inventory.variant_id`,
`sale_items.variant_id`, `stock_movements.variant_id`).
Preserves all existing rows and indexes without dropping production data.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "9c0d1e2f3a4b"
down_revision: Union[str, Sequence[str], None] = "8b9c0d1e2f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_TARGET_TABLES = ("store_settings", "product_images", "product_variants")


def _is_int_type(col_type_obj) -> bool:
    type_str = str(col_type_obj).upper()
    return "INT" in type_str and "TINYINT" not in type_str


def _rebuild_sqlite_table_to_int_pk(bind, table_name: str, insp) -> None:
    cols = insp.get_columns(table_name)
    non_id_cols = [c for c in cols if c["name"] != "id"]
    fks = insp.get_foreign_keys(table_name)
    indexes = insp.get_indexes(table_name)

    fk_by_col = {}
    for fk in fks:
        if len(fk.get("constrained_columns", [])) == 1:
            col_name = fk["constrained_columns"][0]
            ref_tbl = fk["referred_table"]
            ref_col = fk["referred_columns"][0]
            ondelete = (fk.get("options") or {}).get("ondelete")
            fk_by_col[col_name] = (ref_tbl, ref_col, ondelete)

    col_defs = [sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False)]
    for c in non_id_cols:
        kwargs = {
            "nullable": c.get("nullable", True),
        }
        if c.get("default") is not None:
            kwargs["server_default"] = sa.text(str(c["default"]))
        args = [c["name"], c["type"]]
        if c["name"] in fk_by_col:
            ref_tbl, ref_col, ondelete = fk_by_col[c["name"]]
            args.append(sa.ForeignKey(f"{ref_tbl}.{ref_col}", ondelete=ondelete))
        col_defs.append(sa.Column(*args, **kwargs))

    tmp_table = f"_mig_intpk_{table_name}"
    if tmp_table in insp.get_table_names():
        op.drop_table(tmp_table)

    op.create_table(tmp_table, *col_defs)

    if non_id_cols:
        col_csv = ", ".join(f'"{c["name"]}"' for c in non_id_cols)
        bind.execute(sa.text(f'INSERT INTO "{tmp_table}" ({col_csv}) SELECT {col_csv} FROM "{table_name}"'))

    op.drop_table(table_name)
    op.rename_table(tmp_table, table_name)

    # Restore indexes cleanly
    created_idx = set()
    for idx in indexes:
        idx_name = idx.get("name")
        idx_cols = idx.get("column_names") or []
        if not idx_name or not idx_cols or idx_name in created_idx:
            continue
        op.create_index(idx_name, table_name, idx_cols, unique=bool(idx.get("unique", False)))
        created_idx.add(idx_name)
    if f"ix_{table_name}_id" not in created_idx:
        op.create_index(f"ix_{table_name}_id", table_name, ["id"])


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())

    for table_name in _TARGET_TABLES:
        if table_name not in tables:
            continue

        cols = {c["name"]: c for c in insp.get_columns(table_name)}
        id_col = cols.get("id")
        if not id_col:
            continue

        already_int = _is_int_type(id_col["type"])

        if dialect == "mysql":
            if already_int:
                extra = bind.execute(
                    sa.text(
                        "SELECT EXTRA FROM INFORMATION_SCHEMA.COLUMNS "
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = 'id'"
                    ),
                    {"t": table_name},
                ).scalar() or ""
                if "auto_increment" not in extra.lower():
                    op.execute(sa.text(f"ALTER TABLE `{table_name}` MODIFY COLUMN `id` INT NOT NULL AUTO_INCREMENT"))
                continue

            # Preserve existing rows when converting a VARCHAR(36) table to INT AUTO_INCREMENT
            op.execute(sa.text(f"ALTER TABLE `{table_name}` ADD COLUMN `_new_int_id` INT NOT NULL AUTO_INCREMENT UNIQUE FIRST"))
            op.execute(sa.text(f"ALTER TABLE `{table_name}` DROP PRIMARY KEY, DROP COLUMN `id`, CHANGE COLUMN `_new_int_id` `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY"))
            continue

        if dialect == "postgresql":
            if already_int:
                continue
            seq_name = f"{table_name}_id_seq"
            op.execute(sa.text(f'ALTER TABLE "{table_name}" ADD COLUMN "_new_int_id" SERIAL'))
            op.execute(sa.text(f'ALTER TABLE "{table_name}" DROP CONSTRAINT IF EXISTS "{table_name}_pkey"'))
            op.execute(sa.text(f'ALTER TABLE "{table_name}" DROP COLUMN "id"'))
            op.execute(sa.text(f'ALTER TABLE "{table_name}" RENAME COLUMN "_new_int_id" TO "id"'))
            op.execute(sa.text(f'ALTER TABLE "{table_name}" ADD PRIMARY KEY ("id")'))
            op.execute(sa.text(f'ALTER SEQUENCE IF EXISTS "{table_name}__new_int_id_seq" RENAME TO "{seq_name}"'))
            continue

        if dialect == "sqlite" and not already_int:
            _rebuild_sqlite_table_to_int_pk(bind, table_name, insp)
            insp = sa.inspect(bind)


def downgrade() -> None:
    # Intentionally preserve integer primary keys and production records on downgrade
    # so live MySQL FKs (`inventory.variant_id`, `sale_items.variant_id`, `stock_movements.variant_id`) remain valid.
    pass
