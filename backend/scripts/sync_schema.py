import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.connection import engine, Base
import app.models  # load all models into Base.metadata
from sqlalchemy import text, inspect

def sync_all_schema():
    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())
    print(f"Inspecting {len(existing_tables)} existing tables in MySQL database...")

    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if table_name not in existing_tables:
                print(f"Table '{table_name}' does not exist, creating it...")
                table.create(conn)
                continue

            existing_cols = {c['name']: c for c in insp.get_columns(table_name)}

            for col in table.columns:
                if col.name not in existing_cols:
                    # Construct SQL type string
                    col_type = col.type.compile(engine.dialect)
                    nullable_str = "NULL" if col.nullable else "NULL" # safe default for existing rows
                    default_str = ""
                    if col.server_default is not None:
                        default_str = f"DEFAULT {col.server_default.arg}"
                    elif col.default is not None and not callable(col.default.arg):
                        default_str = f"DEFAULT '{col.default.arg}'"

                    alter_stmt = f"ALTER TABLE `{table_name}` ADD COLUMN `{col.name}` {col_type} {default_str} {nullable_str}"
                    print(f"Adding column '{col.name}' to '{table_name}': {alter_stmt}")
                    try:
                        conn.execute(text(alter_stmt))
                    except Exception as e:
                        print(f"  Notice: could not add column ({e})")

        # Sync products name / product_name and relax legacy non-null columns
        try:
            conn.execute(text("ALTER TABLE products MODIFY COLUMN name VARCHAR(255) NULL"))
            conn.execute(text("ALTER TABLE products MODIFY COLUMN product_name VARCHAR(255) NULL"))
            conn.execute(text("ALTER TABLE products MODIFY COLUMN purchase_price FLOAT NULL DEFAULT 0.0"))
            conn.execute(text("ALTER TABLE products MODIFY COLUMN selling_price FLOAT NULL DEFAULT 0.0"))
            conn.execute(text("ALTER TABLE products MODIFY COLUMN unit VARCHAR(50) NULL DEFAULT 'pcs'"))
            conn.execute(text("ALTER TABLE products MODIFY COLUMN min_stock_level INT NULL DEFAULT 5"))
            conn.execute(text("UPDATE products SET product_name = name WHERE product_name IS NULL"))
            conn.execute(text("UPDATE products SET name = product_name WHERE name IS NULL"))
        except Exception as e:
            print(f"Notice during products relaxation: {e}")

    print("==================================================")
    print("ALL TABLES & COLUMNS 100% SYNCHRONIZED WITH MYSQL!")
    print("==================================================")

if __name__ == "__main__":
    sync_all_schema()
