import sys
import os

# Ensure backend root is in python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.category import Category
from app.models.product import Product, ProductAlert, ProductClothingDetail, ProductGroceryDetail
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.product_service import ProductService
from app.middleware.store_auth import StoreContext
import datetime

def test_add_product_redesign():
    db = SessionLocal()
    try:
        print("1. Locating or creating test store and context...")
        user = db.query(User).first()
        if not user:
            print("No user found in local DB. Skipping end-to-end service test.")
            return

        store = db.query(Store).filter(Store.user_id == user.id).first()
        if not store:
            store = Store(name="Test Store", code="TST01", user_id=user.id, store_type_code="grocery")
            db.add(store)
            db.commit()
            db.refresh(store)

        category = db.query(Category).filter(Category.store_id == store.id).first()
        if not category:
            category = Category(name="General Foods", code="gen_foods", store_id=store.id)
            db.add(category)
            db.commit()
            db.refresh(category)

        ctx = StoreContext(
            store=store,
            user=user,
            role="OWNER"
        )

        print(f"Verified context: user_id={ctx.user_id}, store_id={ctx.store_id}")

        # Test A: Create Grocery Product with Low Stock Alert ON and Expiry Alert ON
        print("2. Testing Grocery Product Creation with Independent Alerts...")
        future_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=15)
        g_prod_in = ProductCreate(
            product_name="Aashirvaad Superior Atta 5kg",
            category_id=category.id,
            selling_price=240.0,
            purchase_price=190.0,
            mrp=260.0,
            current_stock=8.0,
            initial_stock=8.0,
            low_stock_alert_enabled=True,
            low_stock_threshold=10.0,
            expiry_alert_enabled=True,
            expiry_date=future_date,
            alert_days_before=7,
            grocery_details={
                "food_type": "Vegetarian",
                "item_type": "Staples & Grains",
                "packaging_type": "Packet / Pouch",
                "net_weight": "5 kg"
            }
        )

        created_g = ProductService.create_product(db=db, store=store, current_user=user, request=g_prod_in)
        assert created_g.id is not None
        assert created_g.product_name == "Aashirvaad Superior Atta 5kg"
        assert created_g.min_stock_level == 10.0
        assert created_g.expiry_date is not None
        print(f" [PASS] Grocery Product created ID: {created_g.id}")

        # Verify alerts table
        alerts = db.query(ProductAlert).filter(ProductAlert.product_id == created_g.id).all()
        assert len(alerts) >= 1
        low_alert = next((a for a in alerts if a.alert_type == "low_stock"), None)
        assert low_alert is not None
        assert low_alert.threshold_value == 10.0
        print(f" [PASS] Low stock alert correctly saved with threshold={low_alert.threshold_value}")

        # Test B: Active Alerts API (Real-Time Notification Verification)
        print("3. Testing Active Alerts Retrieval (Deduplicated Live Notifications)...")
        active_alerts_resp = ProductService.get_active_alerts(db, ctx)
        alert_items = active_alerts_resp.get("all", []) if isinstance(active_alerts_resp, dict) else active_alerts_resp
        print(f" [INFO] Active alerts count: {len(alert_items)}")
        matching_low = next((a for a in alert_items if a["product_id"] == created_g.id and a.get("type", a.get("alert_type")) == "low_stock"), None)
        assert matching_low is not None, "Product with stock 8 and threshold 10 must appear in active low stock alerts"
        print(f" [PASS] Real active notification verified: {matching_low['product_name']} is low on stock ({matching_low['current_stock']} <= {matching_low.get('threshold', matching_low.get('threshold_value'))})")

        # Test C: Clothing Store Smart Specifications
        print("4. Testing Clothing Store Smart Specifications...")
        # Temporarily switch store to clothing
        orig_store_type = store.store_type
        orig_shop_cat = store.shop_category_id
        orig_type_id = store.store_type_id
        store.store_type = "clothing"
        store.shop_category_id = None
        store.store_type_id = None
        store.shop_category = None
        store.store_type_rel = None
        db.commit()

        cloth_category = db.query(Category).filter(Category.store_id == store.id, Category.code == "apparel").first()
        if not cloth_category:
            cloth_category = Category(name="Men Apparel", code="apparel", store_id=store.id)
            db.add(cloth_category)
            db.commit()
            db.refresh(cloth_category)

        # 1. T-Shirt with smart specifications
        tshirt_in = ProductCreate(
            product_name="Classic Crewneck T-Shirt",
            category_id=cloth_category.id,
            selling_price=499.0,
            purchase_price=220.0,
            current_stock=50.0,
            clothing_details={
                "clothing_type": "T-Shirt",
                "specification_type": "T-Shirt",
                "gender": "Men",
                "fabric_type": "100% Cotton",
                "fit_type": "Slim Fit",
                "pattern": "Solid / Plain",
                "color": "Navy Blue",
                "specifications": {
                    "neck_type": "Round Neck",
                    "sleeve_type": "Half Sleeve",
                    "material": "100% Combed Cotton",
                    "occasion": "Casual"
                }
            }
        )

        created_tshirt = ProductService.create_product(db=db, store=store, current_user=user, request=tshirt_in)
        assert created_tshirt.id is not None
        tshirt_detail = db.query(ProductClothingDetail).filter(ProductClothingDetail.product_id == created_tshirt.id).first()
        assert tshirt_detail is not None
        assert tshirt_detail.clothing_type == "T-Shirt"
        assert tshirt_detail.specifications.get("neck_type") == "Round Neck"
        assert tshirt_detail.color == "Navy Blue"
        print(f" [PASS] T-Shirt created with smart specs: {tshirt_detail.specifications}")

        # 2. Other with Custom Specifications
        other_in = ProductCreate(
            product_name="Hand-Embroidered Ethnic Stole",
            category_id=cloth_category.id,
            selling_price=899.0,
            purchase_price=400.0,
            current_stock=20.0,
            clothing_details={
                "clothing_type": "Other",
                "specification_type": "Other",
                "gender": "Women",
                "fabric_type": "Pure Silk",
                "fit_type": "Regular Fit",
                "pattern": "Embroidered",
                "color": "Crimson Red",
                "specifications": {
                    "Embroidery Technique": "Kashmiri Aari",
                    "Border Width": "3 inches",
                    "Tassel Finish": "Hand Knotted"
                }
            }
        )

        created_other = ProductService.create_product(db=db, store=store, current_user=user, request=other_in)
        other_detail = db.query(ProductClothingDetail).filter(ProductClothingDetail.product_id == created_other.id).first()
        assert other_detail is not None
        assert other_detail.clothing_type == "Other"
        assert other_detail.specifications.get("Embroidery Technique") == "Kashmiri Aari"
        print(f" [PASS] 'Other' clothing type created with custom specs: {other_detail.specifications}")

        # Test D: Form Config for all 8 Store Types
        print("5. Verifying Form Config for all 8 Store Types...")
        store_types = ["grocery", "clothing", "medical", "mobile_electronics", "plastic", "handloom", "furniture", "agro"]
        for st in store_types:
            store.store_type = st
            db.commit()
            ctx_st = StoreContext(store=store, user=user)
            cfg = ProductService.get_form_config(db, ctx_st)
            st_cfg = cfg.store_type
            st_code = st_cfg["code"] if isinstance(st_cfg, dict) else st_cfg.code
            has_img = st_cfg["has_image"] if isinstance(st_cfg, dict) else st_cfg.has_image
            has_exp = st_cfg["has_expiry"] if isinstance(st_cfg, dict) else st_cfg.has_expiry
            has_brd = st_cfg["has_brand"] if isinstance(st_cfg, dict) else st_cfg.has_brand

            assert st_code == st
            if st == "clothing" or st == "agro":
                assert has_img is True
            else:
                assert has_img is False

            if st in ("grocery", "medical", "agro"):
                assert has_exp is True
            else:
                assert has_exp is False

            if st == "grocery":
                assert has_brd is False
            else:
                assert has_brd is True

            print(f" [PASS] Store Type: {st} -> Image: {has_img}, Expiry: {has_exp}, Brand: {has_brd}")

        # Restore original store type
        store.store_type = orig_store_type
        store.shop_category_id = orig_shop_cat
        store.store_type_id = orig_type_id
        db.commit()

        print("\n=======================================================")
        print("ALL ADD PRODUCT REDESIGN & ALERT SUITES PASSED 100%!")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    test_add_product_redesign()
