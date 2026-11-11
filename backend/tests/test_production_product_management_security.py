import sys
from pathlib import Path
from decimal import Decimal
from fastapi import HTTPException

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "app"))

from app.database.connection import SessionLocal, Base, engine
from app.models import (
    User, Store, StoreType, ShopCategory, Category, Brand, Unit,
    Product, ProductPricing, ProductInventory, ProductBatch, ProductVariant,
    StoreUser, StoreSetting
)
from app.middleware.store_auth import StoreContext, get_current_store_context
from app.services.product_service import ProductService
from app.schemas.product_schema import (
    ProductCreate, ProductUpdate, PricingCreate, InventoryCreate,
    BatchCreate, VariantCreate, GroceryDetailsSchema, MedicineDetailsSchema
)


def setup_test_users_and_stores(db):
    """Set up two isolated merchants with different store types."""
    sc_grocery = db.query(ShopCategory).filter(ShopCategory.code == "GROCERY").first()
    if not sc_grocery:
        sc_grocery = ShopCategory(code="GROCERY", name="Grocery Store", is_system=True, is_active=True)
        db.add(sc_grocery)
        db.flush()

    sc_clothing = db.query(ShopCategory).filter(ShopCategory.code == "CLOTHING").first()
    if not sc_clothing:
        sc_clothing = ShopCategory(code="CLOTHING", name="Clothing Store", is_system=True, is_active=True)
        db.add(sc_clothing)
        db.flush()

    # Ensure Store Types exist
    st_grocery = db.query(StoreType).filter(StoreType.code == "grocery").first()
    if not st_grocery:
        st_grocery = StoreType(code="grocery", name="Grocery Store", is_active=True)
        db.add(st_grocery)

    st_clothing = db.query(StoreType).filter(StoreType.code == "clothing").first()
    if not st_clothing:
        st_clothing = StoreType(code="clothing", name="Clothing Store", is_active=True)
        db.add(st_clothing)

    db.flush()

    # User A (Grocery Store Owner)
    user_a = db.query(User).filter(User.email == "usera_test@nmart.com").first()
    if not user_a:
        user_a = User(
            first_name="UserA",
            surname="GroceryOwner",
            email="usera_test@nmart.com",
            phone="9000000001",
            store_type="Grocery Store",
            shop_category_id=sc_grocery.id,
            hashed_password="hash",
            is_active=True
        )
        db.add(user_a)
        db.flush()

    store_a = db.query(Store).filter(Store.user_id == user_a.id).first()
    if not store_a:
        store_a = Store(
            user_id=user_a.id,
            name="Store A Grocery",
            code="STR-A01",
            shop_category_id=sc_grocery.id,
            store_type_id=st_grocery.id,
            is_active=True
        )
        db.add(store_a)
        db.flush()

    # User B (Clothing Store Owner)
    user_b = db.query(User).filter(User.email == "userb_test@nmart.com").first()
    if not user_b:
        user_b = User(
            first_name="UserB",
            surname="ClothingOwner",
            email="userb_test@nmart.com",
            phone="9000000002",
            store_type="Clothing Store",
            shop_category_id=sc_clothing.id,
            hashed_password="hash",
            is_active=True
        )
        db.add(user_b)
        db.flush()

    store_b = db.query(Store).filter(Store.user_id == user_b.id).first()
    if not store_b:
        store_b = Store(
            user_id=user_b.id,
            name="Store B Clothing",
            code="STR-B01",
            shop_category_id=sc_clothing.id,
            store_type_id=st_clothing.id,
            is_active=True
        )
        db.add(store_b)
        db.flush()

    # Store A Category & Brand
    cat_a = db.query(Category).filter(Category.store_id == store_a.id, Category.name == "Store A Category").first()
    if not cat_a:
        cat_a = Category(store_id=store_a.id, name="Store A Category", code="cat_a", is_active=True)
        db.add(cat_a)
        db.flush()

    brand_a = db.query(Brand).filter(Brand.store_id == store_a.id, Brand.name == "Store A Brand").first()
    if not brand_a:
        brand_a = Brand(store_id=store_a.id, name="Store A Brand", code="brand_a", is_active=True)
        db.add(brand_a)
        db.flush()

    # Store B Category & Brand
    cat_b = db.query(Category).filter(Category.store_id == store_b.id, Category.name == "Store B Category").first()
    if not cat_b:
        cat_b = Category(store_id=store_b.id, name="Store B Category", code="cat_b", is_active=True)
        db.add(cat_b)
        db.flush()

    brand_b = db.query(Brand).filter(Brand.store_id == store_b.id, Brand.name == "Store B Brand").first()
    if not brand_b:
        brand_b = Brand(store_id=store_b.id, name="Store B Brand", code="brand_b", is_active=True)
        db.add(brand_b)
        db.flush()

    db.commit()

    # Clean up previous test products for store_a and store_b so the test is fully idempotent
    db.query(Product).filter(Product.store_id.in_([store_a.id, store_b.id])).delete(synchronize_session=False)
    db.commit()

    ctx_a = StoreContext(store=store_a, user=user_a, role="OWNER")
    ctx_b = StoreContext(store=store_b, user=user_b, role="OWNER")

    return ctx_a, ctx_b, cat_a, cat_b, brand_a, brand_b


def run_all_14_security_tests():
    db = SessionLocal()
    try:
        ctx_a, ctx_b, cat_a, cat_b, brand_a, brand_b = setup_test_users_and_stores(db)

        print("\n" + "="*70)
        print("EXECUTING ALL 14 MULTI-TENANT & DYNAMIC PRODUCT SECURITY TESTS")
        print("="*70)

        # TEST 1: User A creates a grocery product. User A can retrieve that product.
        print("\n[TEST 1] User A creates a grocery product and retrieves it...")
        req_1 = ProductCreate(
            product_name="Aashirvaad Superior MP Atta",
            sku="AASH-ATTA-5KG",
            barcode="8901030012345",
            category_id=cat_a.id,
            brand_id=brand_a.id,
            selling_price=245.0,
            purchase_price=210.0,
            initial_stock=50.0,
            grocery_details=GroceryDetailsSchema(
                food_type="Vegetarian",
                net_weight="5 kg",
                packaging_type="Packet / Pouch",
                is_vegetarian=True,
                fssai_license="10012011000123"
            )
        )
        prod_a = ProductService.create_product(db, ctx_a, req_1)
        assert prod_a is not None
        assert prod_a.id is not None
        fetched_a = ProductService.get_product(db, ctx_a, prod_a.id)
        assert fetched_a.id == prod_a.id
        assert fetched_a.product_name == "Aashirvaad Superior MP Atta"
        assert fetched_a.grocery_details is not None
        print("  -> PASS: User A successfully created and retrieved grocery product.")

        # TEST 2: User B cannot retrieve User A's product.
        print("\n[TEST 2] User B cannot retrieve User A's product...")
        try:
            ProductService.get_product(db, ctx_b, prod_a.id)
            assert False, "Security failure: User B retrieved User A's product!"
        except HTTPException as e:
            assert e.status_code in (403, 404)
            print(f"  -> PASS: User B blocked with HTTP {e.status_code} ({e.detail}).")

        # TEST 3: User B cannot update User A's product.
        print("\n[TEST 3] User B cannot update User A's product...")
        try:
            update_req = ProductUpdate(selling_price=1.00)
            ProductService.update_product(db, ctx_b, prod_a.id, update_req)
            assert False, "Security failure: User B updated User A's product!"
        except HTTPException as e:
            assert e.status_code in (403, 404)
            print(f"  -> PASS: User B update blocked with HTTP {e.status_code}.")

        # TEST 4: User B cannot delete User A's product.
        print("\n[TEST 4] User B cannot delete User A's product...")
        try:
            ProductService.delete_product(db, ctx_b, prod_a.id)
            assert False, "Security failure: User B deleted User A's product!"
        except HTTPException as e:
            assert e.status_code in (403, 404)
            print(f"  -> PASS: User B deletion blocked with HTTP {e.status_code}.")

        # TEST 5: User A cannot use User B's category ID.
        print("\n[TEST 5] User A cannot use User B's category ID...")
        try:
            req_cross_cat = ProductCreate(
                product_name="Invalid Cross-Store Product",
                category_id=cat_b.id,
                selling_price=100.0
            )
            ProductService.create_product(db, ctx_a, req_cross_cat)
            assert False, "Security failure: User A used User B's category ID!"
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  -> PASS: Cross-store category creation blocked with HTTP {e.status_code}.")

        # TEST 6: User A cannot use User B's brand ID.
        print("\n[TEST 6] User A cannot use User B's brand ID...")
        try:
            req_cross_brand = ProductCreate(
                product_name="Invalid Cross-Store Brand Product",
                brand_id=brand_b.id,
                selling_price=100.0
            )
            ProductService.create_product(db, ctx_a, req_cross_brand)
            assert False, "Security failure: User A used User B's brand ID!"
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  -> PASS: Cross-store brand creation blocked with HTTP {e.status_code}.")

        # TEST 7: User A cannot access User B's inventory, variants or batches.
        print("\n[TEST 7] User A cannot access User B's inventory, variants or batches...")
        # Create a product for User B with variants and batches
        req_b_prod = ProductCreate(
            product_name="Denim Jeans Slim Fit",
            sku="LEVI-JEANS-01",
            category_id=cat_b.id,
            brand_id=brand_b.id,
            selling_price=1999.0,
            variants=[
                VariantCreate(variant_name="Blue 32", sku="LEVI-BLU-32", selling_price=1999.0, stock_quantity=10.0),
                VariantCreate(variant_name="Black 34", sku="LEVI-BLK-34", selling_price=1999.0, stock_quantity=5.0)
            ],
            batches=[
                BatchCreate(batch_number="BATCH-TEX-2026", selling_price=1999.0, initial_quantity=15.0, current_quantity=15.0)
            ]
        )
        prod_b = ProductService.create_product(db, ctx_b, req_b_prod)
        try:
            ProductService.get_product(db, ctx_a, prod_b.id)
            assert False, "Security failure: User A accessed User B's product inventory/variants/batches!"
        except HTTPException as e:
            assert e.status_code in (403, 404)
            print(f"  -> PASS: Sub-resource access blocked with HTTP {e.status_code}.")

        # TEST 8: Changing product ID in the API URL must not bypass authorization.
        print("\n[TEST 8] Changing product ID in API URL does not bypass authorization...")
        try:
            # User A requests prod_b.id in get_product
            ProductService.get_product(db, ctx_a, str(prod_b.id))
            assert False, "Authorization bypassed by URL product ID parameter!"
        except HTTPException as e:
            assert e.status_code in (403, 404)
            print("  -> PASS: Manipulated product ID URL rejected with 403/404.")

        # TEST 9: A clothing store cannot submit medical-specific product details.
        print("\n[TEST 9] Clothing store cannot submit medical-specific product details...")
        try:
            req_invalid_med = ProductCreate(
                product_name="Illegal Medical In Clothing",
                category_id=cat_b.id,
                selling_price=50.0,
                medicine_details=MedicineDetailsSchema(
                    salt_composition="Amoxicillin 500mg",
                    generic_name="Amoxicillin",
                    prescription_required=True
                )
            )
            ProductService.create_product(db, ctx_b, req_invalid_med)
            assert False, "Validation failure: Clothing store was allowed to submit medicine details!"
        except HTTPException as e:
            assert e.status_code == 422
            print(f"  -> PASS: Mismatched store type details rejected with HTTP {e.status_code} ({e.detail}).")

        # TEST 10: A grocery store only receives grocery-specific fields in form-config.
        print("\n[TEST 10] Grocery store only receives grocery-specific fields in form-config...")
        cfg = ProductService.get_form_config(db, ctx_a)
        spec_field_names = [f.field_name for f in cfg.store_specific_fields]
        assert "food_type" in spec_field_names
        assert "fssai_license" in spec_field_names
        assert "salt_composition" not in spec_field_names
        assert "fabric_type" not in spec_field_names
        assert "thread_count" not in spec_field_names
        assert "crop_name" not in spec_field_names
        print(f"  -> PASS: Form config returned strictly {len(spec_field_names)} grocery fields without cross-category pollution.")

        # TEST 11: A user who is removed from a store cannot continue accessing its products.
        print("\n[TEST 11] Deactivated store employee cannot access products...")
        emp_user = db.query(User).filter(User.email == "deactivated_emp@nmart.com").first()
        if not emp_user:
            emp_user = User(
                first_name="Deactivated", surname="Employee",
                email="deactivated_emp@nmart.com", phone="9000000099",
                hashed_password="hash", is_active=True
            )
            db.add(emp_user)
            db.flush()

        su = db.query(StoreUser).filter(StoreUser.store_id == ctx_a.store_id, StoreUser.user_id == emp_user.id).first()
        if not su:
            su = StoreUser(store_id=ctx_a.store_id, user_id=emp_user.id, role="STAFF", is_active=False)
            db.add(su)
        else:
            su.is_active = False
        db.commit()

        try:
            get_current_store_context(db=db, current_user=emp_user)
            assert False, "Security failure: Deactivated employee accessed store context!"
        except HTTPException as e:
            assert e.status_code == 403
            assert "deactivated" in e.detail.lower()
            print(f"  -> PASS: Deactivated store employee blocked with HTTP {e.status_code} ({e.detail}).")

        # TEST 12: A failed product creation must not leave incomplete database records.
        print("\n[TEST 12] Atomic rollback: failed creation leaves zero orphan records...")
        count_products_before = db.query(Product).count()
        count_pricing_before = db.query(ProductPricing).count()
        count_inventory_before = db.query(ProductInventory).count()

        try:
            # Trigger failure with invalid cross-store category
            fail_req = ProductCreate(
                product_name="Failing Product",
                category_id=cat_b.id,  # Invalid
                selling_price=500.0,
            )
            ProductService.create_product(db, ctx_a, fail_req)
        except HTTPException:
            pass

        count_products_after = db.query(Product).count()
        count_pricing_after = db.query(ProductPricing).count()
        count_inventory_after = db.query(ProductInventory).count()

        assert count_products_after == count_products_before
        assert count_pricing_after == count_pricing_before
        assert count_inventory_after == count_inventory_before
        print("  -> PASS: Database transaction rolled back cleanly. No partial records persisted.")

        # TEST 13: Two stores can independently use the same SKU and barcode.
        print("\n[TEST 13] Two stores independently use the same SKU and barcode...")
        shared_sku = "SHARED-GLOBAL-SKU-99"
        shared_barcode = "8900000009999"

        # User A creates with shared SKU
        p_shared_a = ProductService.create_product(db, ctx_a, ProductCreate(
            product_name="Store A Item",
            sku=shared_sku,
            barcode=shared_barcode,
            category_id=cat_a.id,
            selling_price=100.0
        ))
        assert p_shared_a.sku == shared_sku

        # User B creates with IDENTICAL SKU and Barcode (must succeed!)
        p_shared_b = ProductService.create_product(db, ctx_b, ProductCreate(
            product_name="Store B Item",
            sku=shared_sku,
            barcode=shared_barcode,
            category_id=cat_b.id,
            selling_price=200.0
        ))
        assert p_shared_b.sku == shared_sku
        print(f"  -> PASS: Both Store A and Store B successfully created products with SKU '{shared_sku}'.")

        # TEST 14: An employee can only perform operations permitted by their store role.
        print("\n[TEST 14] Role permissions: STAFF cannot delete products or modify pricing...")
        staff_context = StoreContext(store=ctx_a.store, user=ctx_a.user, role="STAFF")
        try:
            staff_context.require_permission("delete_product")
            assert False, "Security failure: STAFF role was granted delete permission!"
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  -> PASS: STAFF role denied delete permission with HTTP {e.status_code}.")

        try:
            staff_context.require_permission("manage_pricing")
            assert False, "Security failure: STAFF role was granted pricing permission!"
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  -> PASS: STAFF role denied pricing permission with HTTP {e.status_code}.")

        print("\n" + "="*70)
        print("ALL 14 PRODUCTION PRODUCT MANAGEMENT SECURITY TESTS PASSED! (14 / 14)")
        print("="*70)

    finally:
        db.close()


if __name__ == "__main__":
    run_all_14_security_tests()
