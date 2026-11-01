import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.database.connection import engine, Base, SessionLocal
from app.core.config import settings
from app.models import *  # Import all 18 models
from app.models.user import User
from app.services.seed_service import seed_categories_and_fields
from app.utils.security import get_password_hash

def reset_and_initialize_database():
    print("=" * 60)
    print("DATABASE RESET & INITIALIZATION")
    print("=" * 60)
    print(f"Target Database URL: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")

    with engine.connect() as conn:
        print("\nStep 1: Dropping all existing tables in database...")
        if "mysql" in str(engine.url):
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            result = conn.execute(text("SHOW TABLES;"))
            existing_tables = [row[0] for row in result.fetchall()]
            print(f"Found {len(existing_tables)} existing tables: {existing_tables}")
            for tbl in existing_tables:
                print(f"  Dropping table: {tbl}...")
                conn.execute(text(f"DROP TABLE IF EXISTS `{tbl}`;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            conn.commit()
            print("[OK] All old tables dropped successfully.")
        else:
            # For SQLite or PostgreSQL
            Base.metadata.drop_all(bind=conn)
            conn.commit()
            print("[OK] Base.metadata.drop_all executed.")

    print("\nStep 2: Creating all new database tables from schema...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  + {table_name}")

    print("\nStep 3: Seeding initial data (10 categories, 41 dynamic fields, units)...")
    db = SessionLocal()
    try:
        seed_categories_and_fields(db)

        # Seed Demo User
        demo_user = db.query(User).filter(User.email == "demo@nmart.com").first()
        if not demo_user:
            demo_user = User(
                first_name="Alex",
                surname="Morgan",
                email="demo@nmart.com",
                phone="+1-555-0199",
                store_type="Supermarket",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                role="owner"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Link demo user's store
            seed_categories_and_fields(db)
            print("  + Seeded Demo Merchant: demo@nmart.com / password123")

        print("\nStep 4: Verification of Seeded Records:")
        from app.models.category import Category
        from app.models.unit import Unit
        from app.models.store import Store

        cat_count = db.query(Category).count()
        unit_count = db.query(Unit).count()
        user_count = db.query(User).count()
        store_count = db.query(Store).count()

        print(f"  - Categories in DB: {cat_count}")
        print(f"  - Units in DB:      {unit_count}")
        print(f"  - Users in DB:      {user_count}")
        print(f"  - Stores in DB:     {store_count}")
        print("\n" + "=" * 60)
        print("DATABASE RESET & SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during data seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_initialize_database()

