"""sync_store_settings_and_variant_defaults

Revision ID: a0b1c2d3e4f5
Revises: 9c0d1e2f3a4b
Create Date: 2026-11-26 20:52:00.000000

Safely aligns legacy NOT NULL columns on `store_settings` and `product_variants`
with server defaults and adds any missing optional columns without dropping data
or modifying existing user/store rows.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "a0b1c2d3e4f5"
down_revision: Union[str, Sequence[str], None] = "9c0d1e2f3a4b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_STORE_SETTINGS_MYSQL_DEFAULTS = [
    ("store_name", "VARCHAR(200) NOT NULL DEFAULT 'Tulsi Mart'"),
    ("show_logo_on_invoice", "TINYINT(1) NOT NULL DEFAULT 1"),
    ("auto_print_invoice", "TINYINT(1) NOT NULL DEFAULT 0"),
    ("tax_enabled", "TINYINT(1) NOT NULL DEFAULT 1"),
    ("default_gst_rate", "DECIMAL(5,2) NOT NULL DEFAULT 0.00"),
    ("prices_include_tax", "TINYINT(1) NOT NULL DEFAULT 0"),
    ("payment_cash_enabled", "TINYINT(1) NOT NULL DEFAULT 1"),
    ("payment_upi_enabled", "TINYINT(1) NOT NULL DEFAULT 1"),
    ("payment_card_enabled", "TINYINT(1) NOT NULL DEFAULT 1"),
    ("security_require_otp", "TINYINT(1) NOT NULL DEFAULT 0"),
    ("security_session_timeout", "INT NOT NULL DEFAULT 30"),
    ("home_cash_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0.00"),
]


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    insp = sa.inspect(bind)
    tables = set(insp.get_table_names())

    if "store_settings" in tables:
        ss_cols = {c["name"] for c in insp.get_columns("store_settings")}

        extra_cols = [
            ("store_name", sa.String(200), False, "Tulsi Mart"),
            ("show_logo_on_invoice", sa.Boolean(), False, "1"),
            ("auto_print_invoice", sa.Boolean(), False, "0"),
            ("tax_enabled", sa.Boolean(), False, "1"),
            ("default_gst_rate", sa.Numeric(5, 2), False, "0.00"),
            ("prices_include_tax", sa.Boolean(), False, "0"),
            ("payment_cash_enabled", sa.Boolean(), False, "1"),
            ("payment_upi_enabled", sa.Boolean(), False, "1"),
            ("payment_card_enabled", sa.Boolean(), False, "1"),
            ("security_require_otp", sa.Boolean(), False, "0"),
            ("security_session_timeout", sa.Integer(), False, "30"),
            ("home_cash_amount", sa.Numeric(12, 2), False, "0.00"),
            ("currency_symbol", sa.String(10), True, None),
            ("currency_code", sa.String(10), True, None),
            ("invoice_prefix", sa.String(30), True, None),
            ("theme_mode", sa.String(20), True, None),
            ("primary_color", sa.String(30), True, None),
            ("invoice_terms", sa.Text(), True, None),
        ]

        for col_name, col_type, nullable, dflt in extra_cols:
            if col_name not in ss_cols:
                kwargs = {"nullable": nullable}
                if dflt is not None:
                    kwargs["server_default"] = sa.text(f"'{dflt}'" if isinstance(col_type, sa.String) else dflt)
                op.add_column("store_settings", sa.Column(col_name, col_type, **kwargs))

        if dialect == "mysql":
            ss_cols = {c["name"] for c in insp.get_columns("store_settings")}
            for col_name, col_ddl in _STORE_SETTINGS_MYSQL_DEFAULTS:
                if col_name in ss_cols:
                    op.execute(sa.text(f"ALTER TABLE `store_settings` MODIFY COLUMN `{col_name}` {col_ddl}"))

    if "product_variants" in tables:
        pv_cols = {c["name"] for c in insp.get_columns("product_variants")}
        if "name" not in pv_cols:
            op.add_column(
                "product_variants",
                sa.Column("name", sa.String(150), server_default=sa.text("''"), nullable=False),
            )
        elif dialect == "mysql":
            op.execute(sa.text("ALTER TABLE `product_variants` MODIFY COLUMN `name` VARCHAR(150) NOT NULL DEFAULT ''"))


def downgrade() -> None:
    pass
