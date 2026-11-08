import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, inspect
from app.database.connection import _build_engine, _get_target_database_url

def migrate_missing_columns():
    eng, _ = _build_engine(_get_target_database_url())

    migrations = [
        # users table
        ('users', 'shop_category', 'VARCHAR(100) NULL'),
        ('users', 'plain_password', 'VARCHAR(255) NULL'),
        ('users', 'shop_category_id', 'INT NULL'),
        ('users', 'last_login', 'DATETIME NULL'),

        # stores table
        ('stores', 'store_code', 'VARCHAR(50) NULL'),
        ('stores', 'store_type', "VARCHAR(100) NULL DEFAULT 'Supermarket'"),
        ('stores', 'store_category', "VARCHAR(100) NULL DEFAULT 'Retail'"),
        ('stores', 'description', 'TEXT NULL'),
        ('stores', 'image_url', "VARCHAR(500) NULL DEFAULT 'store.jpg'"),
        ('stores', 'store_status', "VARCHAR(50) NOT NULL DEFAULT 'Active'"),
        ('stores', 'registration_date', 'VARCHAR(50) NULL'),
        ('stores', 'created_by', 'VARCHAR(100) NULL'),
        ('stores', 'updated_by', 'VARCHAR(100) NULL'),

        # store_owner_details table
        ('store_owner_details', 'owner_id', "VARCHAR(50) NULL DEFAULT 'OWN001'"),
        ('store_owner_details', 'alternate_phone', 'VARCHAR(50) NULL'),
        ('store_owner_details', 'owner_address', 'TEXT NULL'),
        ('store_owner_details', 'owner_profile_image', "VARCHAR(500) NULL DEFAULT 'owner.png'"),

        # store_addresses table
        ('store_addresses', 'landmark', 'VARCHAR(255) NULL'),
        ('store_addresses', 'district', 'VARCHAR(100) NULL'),

        # store_business_details table
        ('store_business_details', 'pan_number', 'VARCHAR(50) NULL'),
        ('store_business_details', 'business_email', 'VARCHAR(255) NULL'),
        ('store_business_details', 'business_phone', 'VARCHAR(50) NULL'),

        # store_configurations table
        ('store_configurations', 'store_opening_time', "VARCHAR(20) NOT NULL DEFAULT '09:00 AM'"),
        ('store_configurations', 'store_closing_time', "VARCHAR(20) NOT NULL DEFAULT '10:00 PM'"),
        ('store_configurations', 'working_days', "VARCHAR(100) NOT NULL DEFAULT 'Monday - Saturday'"),
        ('store_configurations', 'currency', "VARCHAR(20) NOT NULL DEFAULT 'INR'"),
        ('store_configurations', 'default_tax_rate', 'FLOAT NOT NULL DEFAULT 5.0'),
        ('store_configurations', 'invoice_starting_number', 'INT NOT NULL DEFAULT 1'),
        ('store_configurations', 'low_stock_alert', 'INT NOT NULL DEFAULT 5'),
        ('store_configurations', 'return_period', "VARCHAR(50) NOT NULL DEFAULT '7 Days'"),
        ('store_configurations', 'store_language', "VARCHAR(50) NOT NULL DEFAULT 'English'"),

        # document_sequences table
        ('document_sequences', 'multi_store_code', "VARCHAR(50) NULL DEFAULT 'STR001'"),
        ('document_sequences', 'sample_example', 'VARCHAR(100) NULL'),
    ]

    with eng.begin() as conn:
        print("Starting schema migration...")
        inspector = inspect(conn)
        db_tables = inspector.get_table_names()

        for tbl, col, col_def in migrations:
            if tbl not in db_tables:
                print(f"Table '{tbl}' does not exist, skipping column '{col}'.")
                continue

            existing_cols = [c['name'] for c in inspector.get_columns(tbl)]
            if col not in existing_cols:
                print(f"Adding '{col}' to '{tbl}'...")
                conn.execute(text(f"ALTER TABLE `{tbl}` ADD COLUMN `{col}` {col_def};"))
                print(f"  [SUCCESS] Added '{col}' to '{tbl}'")
            else:
                print(f"  [EXISTS] '{col}' in '{tbl}'")

        # Sync existing users shop_category if currently NULL
        conn.execute(text("""
            UPDATE users 
            SET shop_category = 'Grocery Store' 
            WHERE shop_category IS NULL OR shop_category = '';
        """))
        print("[SUCCESS] Existing users shop_category backfilled.")

    print("\nAll missing columns migrated successfully!")

if __name__ == "__main__":
    migrate_missing_columns()

