import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import engine
from sqlalchemy import text, inspect

def run_migration():
    print("Running safe migration for product alerts and clothing specifications...")
    insp = inspect(engine)
    
    with engine.begin() as conn:
        # 1. Update product_alerts
        if "product_alerts" in insp.get_table_names():
            alert_cols = [c["name"] for c in insp.get_columns("product_alerts")]
            if "expiry_date" not in alert_cols:
                print("Adding expiry_date to product_alerts...")
                conn.execute(text("ALTER TABLE product_alerts ADD COLUMN expiry_date DATETIME NULL"))
        
        # 2. Update products
        if "products" in insp.get_table_names():
            prod_cols = [c["name"] for c in insp.get_columns("products")]
            if "expiry_date" not in prod_cols:
                print("Adding expiry_date to products...")
                conn.execute(text("ALTER TABLE products ADD COLUMN expiry_date DATETIME NULL"))
                
        # 3. Update product_clothing_details
        if "product_clothing_details" in insp.get_table_names():
            cloth_cols = [c["name"] for c in insp.get_columns("product_clothing_details")]
            if "color" not in cloth_cols:
                print("Adding color to product_clothing_details...")
                conn.execute(text("ALTER TABLE product_clothing_details ADD COLUMN color VARCHAR(50) NULL"))
            if "specifications" not in cloth_cols:
                print("Adding specifications to product_clothing_details...")
                conn.execute(text("ALTER TABLE product_clothing_details ADD COLUMN specifications JSON NULL"))
                
    print("Migration finished successfully!")

if __name__ == "__main__":
    run_migration()

