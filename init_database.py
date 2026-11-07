"""
NMART - Database Synchronization & Seed Script
Ensures all tables and columns from table.md exist in the database,
and seeds the 8 primary shop categories with demo data.
"""
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.dirname(__file__))

from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.models import (
    User, PasswordResetOtp,
    ShopCategory, Store, StoreOwnerDetails, StoreAddress, StoreBusinessDetails, StoreConfiguration, DocumentSequence,
    ProductCategory, ProductAttribute, Product, ProductAttributeValue, ProductImages, Unit,
    ProductStock, StockAdjustment,
    Customer, DebitCustomer, Supplier,
    Purchase, PurchaseItem,
    Order, OrderItem,
    Invoice, InvoiceItem,
    Payment, Expense,
    Employee,
    Return, ReturnItem, Refund,
    ActivityLog, DailySalesAnalytics
)

SHOP_CATEGORIES = [
    {
        "id": 1,
        "name": "Grocery Store",
        "code": "GROCERY",
        "description": "Food, household groceries, staples, FMCG, and fresh produce",
        "icon": "shopping-cart"
    },
    {
        "id": 2,
        "name": "Clothing Store",
        "code": "CLOTHING",
        "description": "Men, women, kids apparel, fashion wear, garments, and fabrics",
        "icon": "shirt"
    },
    {
        "id": 3,
        "name": "Medical / Pharmacy Store",
        "code": "PHARMACY",
        "description": "Medicines, healthcare supplies, pharmaceuticals, and wellness products",
        "icon": "cross"
    },
    {
        "id": 4,
        "name": "Mobile & Electronics Store",
        "code": "ELECTRONICS",
        "description": "Smartphones, laptops, accessories, consumer electronics, and appliances",
        "icon": "smartphone"
    },
    {
        "id": 5,
        "name": "Plastic Store",
        "code": "PLASTIC",
        "description": "Plastic containers, household ware, homeware, and industrial plastics",
        "icon": "box"
    },
    {
        "id": 6,
        "name": "Handloom store",
        "code": "HANDLOOM",
        "description": "Traditional textiles, handmade fabrics, sarees, and home linen",
        "icon": "layers"
    },
    {
        "id": 7,
        "name": "Furniture Store",
        "code": "FURNITURE",
        "description": "Home, office, wooden furniture, interior decor, and furnishings",
        "icon": "armchair"
    },
    {
        "id": 8,
        "name": "Agro Store",
        "code": "AGRO",
        "description": "Agricultural tools, seeds, fertilizers, pesticides, and farm equipment",
        "icon": "sprout"
    }
]

def init_db():
    print("Dropping old tables to recreate clean schema...")
    try:
        Base.metadata.drop_all(bind=engine)
    except Exception as e:
        print(f"Note on drop_all: {e}")
    print("Creating all tables from Base.metadata...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")

    db = SessionLocal()
    try:
        # Seed Shop Categories
        print("Seeding 8 Store Categories...")
        for cat_data in SHOP_CATEGORIES:
            new_cat = ShopCategory(**cat_data)
            db.add(new_cat)
        db.commit()
        print("8 Store Categories seeded successfully.")

        # Ensure demo user exists
        demo_user = db.query(User).filter(User.email == "demo@nmart.com").first()
        from backend.app.utils.security import get_password_hash
        if not demo_user:
            demo_user = User(
                first_name="Alex",
                surname="Morgan",
                email="demo@nmart.com",
                phone="9876543210",
                store_type="Grocery Store",
                shop_category="Grocery Store",
                shop_category_id=1,
                hashed_password=get_password_hash("password123"),
                plain_password="password123",
                role="owner"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("Demo user created (demo@nmart.com / password123).")

        # Ensure demo store exists
        demo_store = db.query(Store).filter(Store.user_id == demo_user.id).first()
        if not demo_store:
            demo_store = Store(
                user_id=demo_user.id,
                shop_category_id=1,
                name="Nexora Mart",
                code="NXM001",
                store_code="STR001",
                store_type="Grocery Store",
                store_category="Retail",
                description="Grocery & General Store",
                currency="INR",
                currency_symbol="₹",
                logo_url="logo.png",
                image_url="store.jpg",
                store_status="Active",
                registration_date="07-11-2026",
                is_active=True
            )
            db.add(demo_store)
            db.commit()
            db.refresh(demo_store)

            # Owner Details
            owner = StoreOwnerDetails(
                store_id=demo_store.id,
                owner_id="OWN001",
                owner_name="Zeel Patel",
                contact_email="owner@gmail.com",
                contact_phone="9876543210",
                alternate_phone="9876543211",
                owner_address="Ahmedabad",
                owner_profile_image="owner.png"
            )
            db.add(owner)

            # Address Details
            addr = StoreAddress(
                store_id=demo_store.id,
                address_line1="Shop 12-14, Commercial Center, SG Highway",
                landmark="Opposite City Mall",
                city="Ahmedabad",
                state="Gujarat",
                district="Ahmedabad",
                country="India",
                postal_code="380054",
                is_primary=True
            )
            db.add(addr)

            # Business Details
            biz = StoreBusinessDetails(
                store_id=demo_store.id,
                legal_name="Nexora Mart Retail Pvt Ltd",
                business_type="Retail",
                gstin="24ABCDE1234F1Z5",
                pan_number="ABCDE1234F",
                trade_license_no="ACT/2026/8892",
                business_email="contact@nexoramart.com",
                business_phone="079-26889900"
            )
            db.add(biz)

            # Store Configuration
            cfg = StoreConfiguration(
                store_id=demo_store.id,
                store_opening_time="09:00 AM",
                store_closing_time="10:00 PM",
                working_days="Monday - Saturday",
                currency="INR (₹)",
                default_tax_rate=5.0,
                invoice_prefix="INV",
                invoice_starting_number=1,
                low_stock_alert=5,
                return_period="7 Days",
                store_language="English"
            )
            db.add(cfg)

            # Document Sequences
            for doc_type, pfx in [
                ("INVOICE", "INV"),
                ("DEBIT_CUSTOMER", "DBC"),
                ("WALKIN_CUSTOMER", "WIC"),
                ("SUPPLIER", "SUP"),
                ("ORDER", "ORD")
            ]:
                seq = DocumentSequence(
                    store_id=demo_store.id,
                    document_type=doc_type,
                    prefix=pfx,
                    next_number=1,
                    padding=6,
                    multi_store_code="STR001",
                    sample_example=f"{pfx}-STR001-000001"
                )
                db.add(seq)

            db.commit()
            print("Demo store details and configuration seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
