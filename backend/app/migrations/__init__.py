"""Alembic grocery schema migration helpers."""

import importlib.util
from pathlib import Path
from alembic.migration import MigrationContext
from alembic.operations import Operations

LATEST_GROCERY_REVISION = "b1c2d3e4f5a6"
_MIGRATION_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "alembic"
    / "versions"
    / "b1c2d3e4f5a6_upgrade_grocery_tables_and_isolation.py"
)


def get_grocery_migration_module():
    spec = importlib.util.spec_from_file_location("grocery_mig_b1c2d3e4f5a6", _MIGRATION_PATH)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


def ensure_grocery_schema(bind_engine) -> None:
    """Idempotently run grocery migration `b1c2d3e4f5a6` against an engine."""
    mig = get_grocery_migration_module()
    with bind_engine.begin() as conn:
        mc = MigrationContext.configure(conn)
        with Operations.context(mc):
            mig.upgrade()
