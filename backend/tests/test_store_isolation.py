import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.store_type import StoreType
from app.models.product import Product
from app.models.partner import Customer
from app.models.order import Order
from app.schemas.auth_schema import UserRegisterRequest
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.auth_service import AuthService
from app.services.store_service import StoreService
from app.services.product_service import ProductService
from app.services.report_service import ReportService
from app.routes.product_routes import get_product, update_product, delete_product

def test_store_isolation_and_cross_access_prevention():
    db = SessionLocal()
    email_a = "merchant_a_isolation@nexoramart.com"
    email_b = "merchant_b_isolation@nexoramart.com"
    try:
        # Cleanup
        for em in [email_a, email_b]:
            u = db.query(User).filter(User.email == em).first()
            if u:
                db.delete(u)
                db.commit()

        st_grocery = db.query(StoreType).filter(StoreType.code == "grocery").first()
        st_clothing = db.query(StoreType).filter(StoreType.code == "clothing").first()

        # Create Merchant A (Grocery Store A)
        user_a, store_a, _, _ = AuthService.register_user(
            db,
            UserRegisterRequest(
                name="Alice Merchant",
                email=email_a,
                password="PasswordA123!",
                store_type_id=st_grocery.id,
                store_name="Alice Grocery Central"
            )
        )

        # Create Merchant B (Clothing Store B)
        user_b, store_b, _, _ = AuthService.register_user(
            db,
            UserRegisterRequest(
                name="Bob Retailer",
                email=email_b,
                password="PasswordB123!",
                store_type_id=st_clothing.id,
                store_name="Bob Fashion Studio"
            )
        )

        assert store_a.id != store_b.id, "Store IDs must be distinct"

        # Create Product for Store A
        prod_a = ProductService.create_product(
            db,
            store=store_a,
            current_user=user_a,
            request=ProductCreate(
                name="Organic Whole Wheat Flour",
                selling_price=45.0,
                purchase_price=35.0,
                unit="kg",
                initial_stock=100.0,
                attributes={"brand": "Nature Fresh", "batch_number": "B-001"}
            )
        )
        assert prod_a.store_id == store_a.id

        # Create Product for Store B
        prod_b = ProductService.create_product(
            db,
            store=store_b,
            current_user=user_b,
            request=ProductCreate(
                name="Slim Fit Denim Jeans",
                selling_price=1299.0,
                purchase_price=800.0,
                unit="piece",
                initial_stock=50.0,
                attributes={"brand": "DenimCo", "size": "32", "color": "Navy Blue"}
            )
        )
        assert prod_b.store_id == store_b.id

        # Create Customer for Store A
        cust_a = Customer(store_id=store_a.id, name="Customer Alice VIP", phone="+91-1111111111", is_active=True)
        db.add(cust_a)
        # Create Customer for Store B
        cust_b = Customer(store_id=store_b.id, name="Customer Bob VIP", phone="+91-2222222222", is_active=True)
        db.add(cust_b)
        db.commit()

        # 1. User A can read their own product
        p_read_a = ProductService.get_product(db, store_id=store_a.id, product_id=prod_a.id)
        assert p_read_a.id == prod_a.id

        # 2. User A cannot read User B's product (scoped by store_id)
        try:
            ProductService.get_product(db, store_id=store_a.id, product_id=prod_b.id)
            assert False, "Store A was able to read Store B's product"
        except HTTPException as e:
            assert e.status_code == 404

        # 3. User B cannot read User A's product
        try:
            ProductService.get_product(db, store_id=store_b.id, product_id=prod_a.id)
            assert False, "Store B was able to read Store A's product"
        except HTTPException as e:
            assert e.status_code == 404

        # 4. Tampering test: User A attempts to access Store B via store_id override
        try:
            StoreService.get_user_store(db, user=user_a, store_id=store_b.id)
            assert False, "User A was able to resolve Store B using store_id parameter"
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403 Forbidden for cross-store tampering, got {e.status_code}"

        # 5. Tampering test: User B attempts to access Store A via store_id override
        try:
            StoreService.get_user_store(db, user=user_b, store_id=store_a.id)
            assert False, "User B was able to resolve Store A using store_id parameter"
        except HTTPException as e:
            assert e.status_code == 403

        # 6. User A cannot modify User B's product
        try:
            ProductService.update_product(
                db,
                store=store_a,
                product_id=prod_b.id,
                request=ProductUpdate(name="Hacked Name")
            )
            assert False, "User A was able to update Store B's product"
        except HTTPException as e:
            assert e.status_code in [403, 404]

        # 7. User A cannot delete User B's product
        try:
            ProductService.delete_product(db, store_id=store_a.id, product_id=prod_b.id)
            assert False, "User A was able to delete Store B's product"
        except HTTPException as e:
            assert e.status_code in [403, 404]

        # 8. Store A product list only contains Store A products
        prods_list_a, count_a = ProductService.list_products(db, store_id=store_a.id)
        assert all(p.store_id == store_a.id for p in prods_list_a)
        assert not any(p.id == prod_b.id for p in prods_list_a)

        # 9. Store B product list only contains Store B products
        prods_list_b, count_b = ProductService.list_products(db, store_id=store_b.id)
        assert all(p.store_id == store_b.id for p in prods_list_b)
        assert not any(p.id == prod_a.id for p in prods_list_b)

        # 10. Dashboard summary remains store-scoped
        summary_a = ReportService.get_dashboard_summary(db, store=store_a)
        assert summary_a["active_products"] >= 1
        summary_b = ReportService.get_dashboard_summary(db, store=store_b)
        assert summary_b["active_products"] >= 1

        print("[PASS] test_store_isolation_and_cross_access_prevention passed all 10 security checks.")
    finally:
        for em in [email_a, email_b]:
            u = db.query(User).filter(User.email == em).first()
            if u:
                db.delete(u)
                db.commit()
        db.close()

if __name__ == "__main__":
    test_store_isolation_and_cross_access_prevention()
