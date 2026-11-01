import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.category import Category, CategoryField
from app.routes.store_routes import get_my_store, update_my_store
from app.routes.category_routes import get_categories, get_category_fields, create_category, add_field_to_category
from app.routes.product_routes import list_products, create_product, update_product, delete_product, get_product
from app.routes.inventory_routes import get_inventory
from app.routes.sale_routes import create_sale
from app.routes.purchase_routes import create_purchase
from app.routes.partner_routes import create_supplier, create_customer
from app.routes.report_routes import get_dashboard_summary, get_category_performance, get_inventory_valuation
from app.schemas.store_schema import StoreUpdate
from app.schemas.category_schema import CategoryCreate, CategoryFieldCreate
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.schemas.partner_schema import CustomerCreate, SupplierCreate
from app.schemas.purchase_schema import PurchaseCreate, PurchaseItemCreate
from app.schemas.sale_schema import SaleCreate, SaleItemCreate

def run_comprehensive_10_category_tests():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@nmart.com").first()
        assert user is not None, "Demo user must exist"

        print("\n========================================================")
        print("TEST 1: Category Listing & Verification (All 10 Categories)")
        print("========================================================")
        categories = get_categories(active_only=True, db=db)
        cat_map = {c.code: c for c in categories}

        expected_10_codes = [
            "grocery", "supermarket", "medical", "clothing", "electronics",
            "mobile_accessories", "hardware", "stationery", "footwear", "vegetable_fruit"
        ]
        for code in expected_10_codes:
            assert code in cat_map, f"Missing expected category: {code}"
            fields = get_category_fields(id=cat_map[code].id, db=db)
            print(f"  [OK] {cat_map[code].name} ({code}): {len(fields)} dynamic fields")
            assert len(fields) >= 3, f"Category {code} has insufficient dynamic fields"

        print("\n========================================================")
        print("TEST 2: Category-Specific Product Creation for ALL 10 Categories")
        print("========================================================")

        # 1. Grocery
        p_grocery = create_product(
            request=ProductCreate(
                name="Organic Basmati Rice 5kg",
                category_id=cat_map["grocery"].id,
                purchase_price=8.50,
                selling_price=12.99,
                unit="kg",
                min_stock_level=10,
                attributes={"brand": "Royal Grain", "weight": "5.0", "unit": "kg", "expiry_date": "2027-12-31"}
            ),
            db=db,
            current_user=user
        )
        print(f"  [1/10 OK] Grocery: {p_grocery.name} (SKU: {p_grocery.sku})")

        # 2. Supermarket
        p_supermarket = create_product(
            request=ProductCreate(
                name="Imported Dark Chocolate Bar 100g",
                category_id=cat_map["supermarket"].id,
                purchase_price=2.00,
                selling_price=3.99,
                mrp=4.50,
                unit="pcs",
                barcode="8901030001234",
                attributes={"brand": "Lindt", "barcode": "8901030001234", "expiry_date": "2027-06-30"}
            ),
            db=db,
            current_user=user
        )
        print(f"  [2/10 OK] Supermarket: {p_supermarket.name} (SKU: {p_supermarket.sku})")

        # 3. Medical
        p_medical = create_product(
            request=ProductCreate(
                name="Amoxicillin 500mg Capsules",
                category_id=cat_map["medical"].id,
                purchase_price=4.20,
                selling_price=7.50,
                mrp=8.00,
                unit="box",
                attributes={
                    "manufacturer": "Pfizer Health",
                    "batch_number": "MED-AMX-2026A",
                    "expiry_date": "2028-05-15"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [3/10 OK] Medical Store: {p_medical.name} (SKU: {p_medical.sku})")

        # 4. Clothing (with multi-variants)
        p_clothing = create_product(
            request=ProductCreate(
                name="Premium Oxford Cotton Shirt",
                category_id=cat_map["clothing"].id,
                purchase_price=15.00,
                selling_price=29.99,
                unit="pcs",
                has_variants=True,
                attributes={"brand": "Nexora Apparel", "size": "L", "color": "Sky Blue", "fabric": "100% Cotton"},
                variants=[
                    {"sku": "SHIRT-BLU-M", "attributes": {"size": "M", "color": "Sky Blue"}, "price": 29.99, "stock": 15},
                    {"sku": "SHIRT-BLU-L", "attributes": {"size": "L", "color": "Sky Blue"}, "price": 29.99, "stock": 20}
                ]
            ),
            db=db,
            current_user=user
        )
        print(f"  [4/10 OK] Clothing Store: {p_clothing.name} ({len(p_clothing.variants)} variants)")

        # 5. Electronics
        p_electronics = create_product(
            request=ProductCreate(
                name="Noise-Canceling Wireless Headphones",
                category_id=cat_map["electronics"].id,
                purchase_price=45.00,
                selling_price=79.99,
                unit="pcs",
                attributes={
                    "brand": "Sony",
                    "model_number": "WH-1000XM4",
                    "serial_number": "SN-SONY-992381",
                    "warranty": "12 Months"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [5/10 OK] Electronics Store: {p_electronics.name} (Model: {p_electronics.attributes.get('model_number')})")

        # 6. Mobile Accessories
        p_mobile = create_product(
            request=ProductCreate(
                name="Shockproof Matte Armor Case",
                category_id=cat_map["mobile_accessories"].id,
                purchase_price=3.00,
                selling_price=9.99,
                unit="pcs",
                attributes={
                    "brand": "Spigen",
                    "compatible_device": "iPhone 15 Pro",
                    "model": "ToughArmor-15P",
                    "color": "Matte Black"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [6/10 OK] Mobile Accessories: {p_mobile.name} (Device: {p_mobile.attributes.get('compatible_device')})")

        # 7. Hardware Store
        p_hardware = create_product(
            request=ProductCreate(
                name="Stainless Steel Hex Bolt Set M8",
                category_id=cat_map["hardware"].id,
                purchase_price=5.00,
                selling_price=9.50,
                unit="box",
                attributes={
                    "material": "Stainless Steel 304",
                    "size": "M8 x 40mm",
                    "weight": "0.8",
                    "unit": "kg"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [7/10 OK] Hardware Store: {p_hardware.name} (Material: {p_hardware.attributes.get('material')})")

        # 8. Stationery Store
        p_stationery = create_product(
            request=ProductCreate(
                name="Hardcover Executive Ruled Journal",
                category_id=cat_map["stationery"].id,
                purchase_price=2.50,
                selling_price=6.00,
                unit="pcs",
                attributes={
                    "brand": "Moleskine",
                    "paper_size": "A5",
                    "product_type": "Notebook",
                    "quantity": "240 Pages"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [8/10 OK] Stationery Store: {p_stationery.name} (Size: {p_stationery.attributes.get('paper_size')})")

        # 9. Footwear Store
        p_footwear = create_product(
            request=ProductCreate(
                name="Air Cushion Athletic Running Shoes",
                category_id=cat_map["footwear"].id,
                purchase_price=25.00,
                selling_price=49.99,
                unit="pair",
                has_variants=True,
                attributes={"brand": "Nike", "shoe_size": "10", "color": "Black/Volt", "material": "Mesh & Rubber"},
                variants=[
                    {"sku": "SHOE-RUN-9", "attributes": {"shoe_size": "9", "color": "Black"}, "price": 49.99, "stock": 10},
                    {"sku": "SHOE-RUN-10", "attributes": {"shoe_size": "10", "color": "Black"}, "price": 49.99, "stock": 12}
                ]
            ),
            db=db,
            current_user=user
        )
        print(f"  [9/10 OK] Footwear Store: {p_footwear.name} (SKU: {p_footwear.sku})")

        # 10. Vegetable & Fruit Shop
        p_produce = create_product(
            request=ProductCreate(
                name="Fresh Farm Gala Apples",
                category_id=cat_map["vegetable_fruit"].id,
                purchase_price=1.80,
                selling_price=3.20,
                unit="kg",
                attributes={"weight": "1.0", "unit": "kg", "quality": "Grade A Premium"}
            ),
            db=db,
            current_user=user
        )
        print(f"  [10/10 OK] Vegetable & Fruit Shop: {p_produce.name} (Quality: {p_produce.attributes.get('quality')})")

        print("\n========================================================")
        print("TEST 3: Future Category Extensibility (Creating 11th Category)")
        print("========================================================")
        existing_jewel = db.query(Category).filter(Category.code == "jewellery").first()
        if existing_jewel:
            new_cat = existing_jewel
            print(f"  [OK] Reusing Existing Category: {new_cat.name} (ID: {new_cat.id})")
        else:
            new_cat = create_category(
                request=CategoryCreate(
                    name="Jewellery Store",
                    code="jewellery",
                    description="Fine gold, diamond, and silver ornaments with purity tracking",
                    icon="💎"
                ),
                db=db,
                current_user=user
            )
            print(f"  [OK] Created New Category: {new_cat.name} (ID: {new_cat.id})")

            # Add dynamic fields to the new category
            f1 = add_field_to_category(
                id=new_cat.id,
                request=CategoryFieldCreate(
                    field_name="metal_purity",
                    field_label="Metal Purity (Karat)",
                    field_type="select",
                    is_required=True,
                    options=["18K", "22K", "24K", "925 Sterling Silver"]
                ),
                db=db,
                current_user=user
            )
            f2 = add_field_to_category(
                id=new_cat.id,
                request=CategoryFieldCreate(
                    field_name="hallmark_number",
                    field_label="BIS Hallmark Certificate #",
                    field_type="text",
                    is_required=False
                ),
                db=db,
                current_user=user
            )
            print(f"  [OK] Added Dynamic Fields: {f1.field_label}, {f2.field_label}")

        # Create product in newly added category
        p_jewel = create_product(
            request=ProductCreate(
                name="22K Classic Gold Wedding Band",
                category_id=new_cat.id,
                purchase_price=320.00,
                selling_price=410.00,
                unit="g",
                attributes={
                    "metal_purity": "22K",
                    "hallmark_number": "HM-2026-IND-991"
                }
            ),
            db=db,
            current_user=user
        )
        print(f"  [OK] Successfully created product in NEW Category: {p_jewel.name} (SKU: {p_jewel.sku})")

        print("\n========================================================")
        print("TEST 4: Store Isolation Verification")
        print("========================================================")
        # Verify that products belong to user's store and cannot bleed across stores
        prods = list_products(db=db, current_user=user)
        for p in prods:
            assert p.store_id == user.store_id, f"Cross-tenant data leak! Product {p.id} has store_id {p.store_id}"
        print(f"  [OK] Verified {len(prods)} products strictly isolated to Store ID {user.store_id}")

        print("\n========================================================")
        print("TEST 5: Reports & Analytics Across Categories")
        print("========================================================")
        summary = get_dashboard_summary(db=db, current_user=user)
        cat_perf = get_category_performance(db=db, current_user=user)
        valuation = get_inventory_valuation(db=db, current_user=user)

        print(f"  [OK] Store: {summary['store_name']}")
        print(f"  [OK] Active Products: {summary['active_products']}")
        print(f"  [OK] Category Breakdown: {len(cat_perf['categories'])} categories represented")
        print(f"  [OK] Inventory Valuation (Cost): ${valuation['total_cost_valuation']:.2f}")

        print("\n>>> ALL 10 CATEGORIES & EXTENSIBILITY SUITE PASSED PERFECTLY! <<<")

    finally:
        db.close()

if __name__ == "__main__":
    run_comprehensive_10_category_tests()
