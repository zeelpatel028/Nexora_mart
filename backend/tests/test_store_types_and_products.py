import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from app.database.connection import SessionLocal
from app.models.store_type import StoreType
from app.models.store import Store
from app.store_types.registry import StoreTypeRegistry
from app.services.product_service import ProductService
from app.schemas.product_schema import ProductCreate

def test_store_types_and_product_validation():
    db = SessionLocal()
    try:
        # 1. Verify all 8 store types are in database
        store_types = db.query(StoreType).filter(StoreType.is_active == True).order_by(StoreType.id).all()
        assert len(store_types) == 8, f"Expected 8 store types, got {len(store_types)}"

        expected_codes = [
            "grocery",
            "clothing",
            "medical",
            "mobile_electronics",
            "plastic",
            "handloom",
            "furniture",
            "agro"
        ]
        db_codes = [st.code for st in store_types]
        for ec in expected_codes:
            assert ec in db_codes, f"Store type code '{ec}' missing from database!"

        # 2. Verify StoreTypeRegistry has strategies for all 8 codes
        for code in expected_codes:
            strat = StoreTypeRegistry.get_strategy(code)
            assert strat is not None
            assert strat.code == code
            ui_config = strat.get_ui_config()
            assert "fields" in ui_config
            assert len(ui_config["default_units"]) > 0

        # 3. Test Medical Store Validation
        med_strat = StoreTypeRegistry.get_strategy("medical")
        # Missing manufacturer & batch_number -> Should fail
        is_val, err = med_strat.validate_product_data(
            {"name": "Paracetamol 500mg"},
            attributes={"dosage_form": "Tablet"}
        )
        assert is_val is False
        assert "Manufacturer" in err or "Batch Number" in err

        # Valid medical attributes -> Should pass
        is_val, err = med_strat.validate_product_data(
            {"name": "Paracetamol 500mg"},
            attributes={
                "manufacturer": "Cipla Ltd",
                "batch_number": "MED-2026-09",
                "expiry_date": "2027-12-31"
            }
        )
        assert is_val is True
        assert err is None

        # 4. Test Clothing Store Validation
        cloth_strat = StoreTypeRegistry.get_strategy("clothing")
        # Missing size and color -> Should fail
        is_val, err = cloth_strat.validate_product_data(
            {"name": "Cotton Polo T-Shirt"},
            attributes={"brand": "Polo"}
        )
        assert is_val is False
        assert "Size" in err or "Color" in err

        # Valid clothing attributes -> Should pass
        is_val, err = cloth_strat.validate_product_data(
            {"name": "Cotton Polo T-Shirt"},
            attributes={"size": "L", "color": "Navy Blue", "fabric": "100% Cotton"}
        )
        assert is_val is True
        assert err is None

        # 5. Test Mobile & Electronics Validation
        elec_strat = StoreTypeRegistry.get_strategy("mobile_electronics")
        is_val, err = elec_strat.validate_product_data(
            {"name": "Smartphone"},
            attributes={"brand": "Samsung"}
        )
        assert is_val is False
        assert "Model Number" in err or "Warranty" in err

        is_val, err = elec_strat.validate_product_data(
            {"name": "Galaxy S24"},
            attributes={
                "brand": "Samsung",
                "model_number": "SM-S921B",
                "warranty_period": "1 Year"
            }
        )
        assert is_val is True

        # 6. Test Handloom Validation
        hand_strat = StoreTypeRegistry.get_strategy("handloom")
        is_val, err = hand_strat.validate_product_data(
            {"name": "Handmade Dupatta"},
            attributes={"pattern": "Zari"}
        )
        assert is_val is False
        assert "Weave Type" in err or "Fabric" in err

        is_val, err = hand_strat.validate_product_data(
            {"name": "Banarasi Saree"},
            attributes={"weave_type": "Banarasi", "color": "Crimson"}
        )
        assert is_val is True

        # 7. Test Furniture Validation
        furn_strat = StoreTypeRegistry.get_strategy("furniture")
        is_val, err = furn_strat.validate_product_data(
            {"name": "Coffee Table"},
            attributes={"dimensions": "40x20x18"}
        )
        assert is_val is False
        assert "Furniture Type" in err or "Material" in err

        is_val, err = furn_strat.validate_product_data(
            {"name": "Teak Wood Coffee Table"},
            attributes={"furniture_type": "Study Desk", "material": "Teak Wood"}
        )
        assert is_val is True

        # 8. Test Agro Store Validation
        agro_strat = StoreTypeRegistry.get_strategy("agro")
        is_val, err = agro_strat.validate_product_data(
            {"name": "Hybrid Cotton"},
            attributes={"variety_crop": "Cotton"}
        )
        assert is_val is False
        assert "Product Type" in err

        is_val, err = agro_strat.validate_product_data(
            {"name": "Hybrid Cotton Seeds"},
            attributes={"product_type": "Seeds", "variety_crop": "BT Cotton"}
        )
        assert is_val is True

        print("[PASS] test_store_types_and_product_validation passed all store type checks.")
    finally:
        db.close()

if __name__ == "__main__":
    test_store_types_and_product_validation()

