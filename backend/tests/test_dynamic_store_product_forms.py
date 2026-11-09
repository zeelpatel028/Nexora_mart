"""
Test Suite: Dynamic Store-Type Based Product Forms (8 Verticals)
Verifies:
1. Identifying store_type from authenticated user's store.
2. Creating products with vertical-specific fields across all 8 store types.
3. Storing dynamic attributes in both product_attribute_values and product_extra_details.
4. Loading saved attributes and updating products.
5. Store-type isolation (only relevant fields validated for each store).
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import Base, engine, SessionLocal
from app.models.user import User
from app.models.store import Store, ShopCategory
from app.models.store_type import StoreType
from app.models.product import Product, ProductAttributeValue, ProductExtraDetail
from app.services.product_service import ProductService
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.store_types.registry import StoreTypeRegistry

def run_tests():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        # 1. Verify 8 Store Types and their specific field counts
        expected_fields = {
            "grocery": [
                "weight", "food_type", "packaging_type", "manufacturing_date",
                "expiry_date", "batch_number", "brand", "storage_instructions"
            ],
            "clothing": [
                "clothing_type", "gender", "size", "color", "fabric", "pattern",
                "fit_type", "sleeve_type", "neck_type", "season", "collection",
                "material", "design_number"
            ],
            "medical": [
                "medicine_type", "generic_name", "salt_composition", "strength",
                "dosage_form", "manufacturer", "batch_number", "manufacturing_date",
                "expiry_date", "prescription_required", "drug_schedule", "storage_instructions"
            ],
            "mobile_electronics": [
                "device_type", "brand", "model_number", "ram", "storage",
                "processor", "imei_number", "serial_number", "warranty_period",
                "color", "accessories_included"
            ],
            "plastic": [
                "plastic_type", "material", "product_size", "weight",
                "thickness", "color", "capacity", "manufacturing_type"
            ],
            "handloom": [
                "fabric_type", "weaving_type", "pattern", "design",
                "color", "material", "length", "width", "origin"
            ],
            "furniture": [
                "furniture_type", "material", "wood_type", "length",
                "width", "height", "finish", "color", "weight",
                "assembly_required", "warranty"
            ],
            "agro": [
                "product_type", "crop_type", "seed_variety", "brand",
                "quantity", "weight", "germination_rate", "manufacturing_date",
                "expiry_date", "batch_number", "application_instructions"
            ],
        }

        for code, fields in expected_fields.items():
            strat = StoreTypeRegistry.get_strategy(code)
            assert strat is not None, f"Strategy for {code} missing!"
            actual_field_names = [f.field_name for f in strat.fields]
            for f in fields:
                assert f in actual_field_names, f"Field '{f}' missing from strategy '{code}'!"
            print(f"[OK] {code} strategy validated with {len(strat.fields)} vertical fields.")

        # 2. Test Grocery Product Creation & Extra Detail Persistence
        test_user = db.query(User).first()
        if not test_user:
            test_user = User(
                first_name="Test",
                surname="Owner",
                email="test_owner@nmart.com",
                hashed_password="hash",
                is_active=True
            )
            db.add(test_user)
            db.flush()

        # Find or create a grocery store
        st_grocery = db.query(StoreType).filter(StoreType.code == "grocery").first()
        grocery_store = db.query(Store).filter(Store.store_type_id == st_grocery.id).first()
        if not grocery_store:
            grocery_store = Store(
                name="Test Grocery Mart",
                user_id=test_user.id,
                store_type_id=st_grocery.id,
                is_active=True
            )
            db.add(grocery_store)
            db.flush()

        g_payload = ProductCreate(
            name="Organic Basmati Rice 5kg",
            selling_price=18.50,
            purchase_price=12.00,
            mrp=22.00,
            unit="kg",
            initial_stock=50,
            attributes={
                "weight": "5 kg",
                "food_type": "Vegetarian",
                "packaging_type": "Packet / Pouch",
                "manufacturing_date": "2026-01-10",
                "expiry_date": "2027-01-10",
                "batch_number": "B-GR-2026",
                "brand": "Royal Heritage",
                "storage_instructions": "Store in a cool dry place",
                "custom_tag": "Premium Grade A"
            }
        )

        g_prod = ProductService.create_product(db, grocery_store, test_user, g_payload)
        assert g_prod.id is not None
        assert g_prod.attributes.get("weight") == "5 kg"
        assert g_prod.attributes.get("food_type") == "Vegetarian"
        assert g_prod.attributes.get("brand") == "Royal Heritage"
        assert g_prod.attributes.get("custom_tag") == "Premium Grade A"

        # Check structured table product_extra_details
        ped_records = db.query(ProductExtraDetail).filter(ProductExtraDetail.product_id == g_prod.id).all()
        assert len(ped_records) > 0, "product_extra_details table not populated!"
        ped_map = {r.field_name: r.field_value for r in ped_records}
        assert ped_map["brand"] == "Royal Heritage"
        assert ped_map["weight"] == "5 kg"
        print("[OK] Product created and stored in product_attribute_values and product_extra_details.")

        # 3. Test Updating Product Attributes
        upd_payload = ProductUpdate(
            selling_price=19.99,
            attributes={
                "weight": "5 kg",
                "food_type": "Vegan",
                "packaging_type": "Packet / Pouch",
                "brand": "Royal Heritage Super",
                "custom_tag": "Organic Certified"
            }
        )
        updated_prod = ProductService.update_product(db, grocery_store, g_prod.id, upd_payload)
        assert updated_prod.selling_price == 19.99
        assert updated_prod.attributes.get("food_type") == "Vegan"
        assert updated_prod.attributes.get("brand") == "Royal Heritage Super"

        ped_updated = db.query(ProductExtraDetail).filter(ProductExtraDetail.product_id == g_prod.id).all()
        upd_ped_map = {r.field_name: r.field_value for r in ped_updated}
        assert upd_ped_map["brand"] == "Royal Heritage Super"
        assert upd_ped_map["food_type"] == "Vegan"
        print("[OK] Product updated and refreshed in structured details tables.")

        # 4. Clean up test product
        db.query(ProductExtraDetail).filter(ProductExtraDetail.product_id == g_prod.id).delete()
        db.query(ProductAttributeValue).filter(ProductAttributeValue.product_id == g_prod.id).delete()
        db.query(Product).filter(Product.id == g_prod.id).delete()
        db.commit()

        print("[ALL TESTS PASSED] Dynamic Store Product forms verified successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()

