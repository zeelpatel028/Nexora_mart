"""
End-to-End Integration, Route Resolution, Security & Index Verification Suite for Tulsi Mart.
Verifies Starlette/FastAPI route ordering (no shadowing), middleware stack registration,
database health, auth/OTP/refresh/logout security, v1 & grocery endpoints, multi-store
isolation, and Alembic composite index creation without requiring OS socket binds.
"""
import sys
import time
import uuid
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import inspect
from starlette.routing import Match

from app.api.v1.customers_router import get_customer_dashboard_metrics
from app.api.v1.suppliers_router import get_supplier_dashboard_metrics
from app.controllers.auth_controller import AuthController
from app.database.connection import SessionLocal, engine
from app.main import app, initialize_database
from app.middleware.auth_middleware import get_current_user
from app.models.store import Store
from app.models.user import PasswordResetOtp, User
from app.schemas.auth_schema import (
    ForgotPasswordRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    UserLoginRequest,
    UserRegisterRequest,
    VerifyOtpRequest,
)
from app.services.rate_limiter_service import RateLimiterService
from app.stores.grocery.dashboard_router import get_dashboard_overview, get_sales_report
from app.stores.grocery.grocery_billing.models import GroceryBill
from app.stores.grocery.grocery_billing.schemas import BillItemInput, MakeBillRequest
from app.stores.grocery.grocery_billing.service import GroceryBillingService
from app.stores.grocery.grocery_product.models import GroceryProduct
from app.stores.grocery.grocery_product.schemas import GroceryProductCreate
from app.stores.grocery.grocery_product.service import GroceryProductService
from app.stores.grocery.grocery_purchase_order.models import GroceryPurchaseOrder
from app.stores.grocery.grocery_purchase_order.schemas import PurchaseOrderCreate
from app.stores.grocery.grocery_purchase_order.service import GroceryPurchaseOrderService
from app.stores.grocery.grocery_supplier.models import GrocerySupplier
from app.stores.grocery.grocery_supplier.schemas import GrocerySupplierCreate
from app.stores.grocery.grocery_supplier.service import GrocerySupplierService


def _match_route(method: str, path: str):
    def _walk(routes, current_path: str):
        scope = {
            "type": "http",
            "method": method.upper(),
            "path": current_path,
            "root_path": "",
            "scheme": "http",
            "headers": [],
        }
        for route in routes:
            if hasattr(route, "original_router") and hasattr(route, "include_context"):
                prefix = route.include_context.prefix or ""
                if prefix and not current_path.startswith(prefix):
                    continue
                sub_path = current_path[len(prefix):] if prefix else current_path
                if not sub_path.startswith("/"):
                    sub_path = "/" + sub_path
                found = _walk(route.original_router.routes, sub_path)
                if found[0] is not None or found[1] is not None:
                    return found
                continue
            match, _ = route.matches(scope)
            if match == Match.FULL:
                return getattr(route, "name", None), getattr(route, "endpoint", None)
        return None, None

    return _walk(app.router.routes, path)


def _expect_http_error(fn, expected_codes):
    try:
        fn()
    except HTTPException as exc:
        assert exc.status_code in expected_codes, (
            f"Expected status in {expected_codes}, got {exc.status_code}: {exc.detail}"
        )
        return exc
    raise AssertionError(f"Expected HTTPException in {expected_codes}, but call succeeded")


def test_routes_middleware_and_e2e_security():
    RateLimiterService.reset_all()
    initialize_database()

    # 1. Verify Middleware Stack & Route Precedence (No Shadowing)
    middleware_names = {m.cls.__name__ for m in app.user_middleware}
    for expected_mw in (
        "CORSMiddleware",
        "RateLimiterMiddleware",
        "GZipMiddleware",
        "SecurityHeadersMiddleware",
    ):
        assert expected_mw in middleware_names, f"Missing middleware: {expected_mw}"

    r_root, ep_root = _match_route("GET", "/")
    r_head, ep_head = _match_route("HEAD", "/")
    r_health, ep_health = _match_route("GET", "/health")
    assert ep_root is not None and ep_head is not None and ep_health is not None

    # Critical non-shadowing route resolution checks
    cust_name, _ = _match_route("GET", "/api/customers/dashboard")
    assert cust_name == "get_customer_dashboard_metrics", (
        f"/api/customers/dashboard shadowed by {cust_name}"
    )
    supp_name, _ = _match_route("GET", "/api/suppliers/dashboard")
    assert supp_name == "get_supplier_dashboard_metrics", (
        f"/api/suppliers/dashboard shadowed by {supp_name}"
    )
    gprod_name, _ = _match_route("GET", "/api/grocery/products")
    assert gprod_name == "list_products", f"/api/grocery/products resolved to {gprod_name}"
    gord_name, _ = _match_route("POST", "/api/grocery/orders")
    assert gord_name is not None, "/api/grocery/orders missing!"

    # Execute root & health endpoints directly
    assert ep_root()["status"] == "success"
    assert ep_head()["status"] == "success"
    health_payload = ep_health()
    assert health_payload["database"]["connected"] is True

    suffix = uuid.uuid4().hex[:8]
    email_a = f"e2e_store_a_{suffix}@tulsimart.com"
    email_b = f"e2e_store_b_{suffix}@tulsimart.com"
    pw_a = "SecurePassA!2026"
    pw_b = "SecurePassB!2026"
    new_pw_a = "UpdatedPassA!2026"

    db = SessionLocal()
    store_ids = []
    try:
        # 2. Protected dependency must reject missing/invalid credentials with 401
        _expect_http_error(lambda: get_current_user(credentials=None, db=db), (401,))

        # 3. Registration works & duplicate email raises 409
        reg_a = AuthController.register(
            db,
            UserRegisterRequest(
                firstName="Asha",
                surname="Patel",
                email=email_a,
                phone="+91-9876501111",
                storeType="Grocery Store",
                password=pw_a,
            ),
        )
        assert reg_a.access_token and reg_a.refresh_token
        store_a_id = reg_a.user.store.id
        store_ids.append(store_a_id)

        _expect_http_error(
            lambda: AuthController.register(
                db,
                UserRegisterRequest(
                    firstName="Asha",
                    surname="Dup",
                    email=email_a,
                    phone="+91-9876501112",
                    storeType="Grocery Store",
                    password=pw_a,
                ),
            ),
            (409,),
        )

        # Register Store B (Clothing Store)
        reg_b = AuthController.register(
            db,
            UserRegisterRequest(
                firstName="Vikram",
                surname="Mehta",
                email=email_b,
                phone="+91-9876502222",
                storeType="Clothing Store",
                password=pw_b,
            ),
        )
        store_b_id = reg_b.user.store.id
        store_ids.append(store_b_id)

        # 4. Login: invalid password rejected (401), valid password succeeds
        _expect_http_error(
            lambda: AuthController.login(db, UserLoginRequest(email=email_a, password="WrongPassword!")),
            (401,),
        )
        RateLimiterService.reset_all()
        good_login = AuthController.login(db, UserLoginRequest(email=email_a, password=pw_a))
        tok_a = good_login.access_token
        ref_a = good_login.refresh_token

        # 5. Refresh token rotation & replay prevention
        ref_res = AuthController.refresh(db, RefreshTokenRequest(refresh_token=ref_a))
        new_tok_a = ref_res.access_token
        new_ref_a = ref_res.refresh_token
        assert new_ref_a != ref_a
        _expect_http_error(
            lambda: AuthController.refresh(db, RefreshTokenRequest(refresh_token=ref_a)),
            (401,),
        )

        user_a = get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=new_tok_a), db=db
        )
        user_b = get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=reg_b.access_token), db=db
        )
        store_a = db.query(Store).filter(Store.id == store_a_id).first()
        store_b = db.query(Store).filter(Store.id == store_b_id).first()

        # 6. Verify /customers/dashboard & /suppliers/dashboard metrics
        cdash = get_customer_dashboard_metrics(db=db, store=store_a, user=user_a)
        sdash = get_supplier_dashboard_metrics(db=db, store=store_a, user=user_a)
        assert "total_customers" in cdash and "total_pending_amount" in cdash
        assert "total_suppliers" in sdash and "total_purchase_amount" in sdash

        # 7. Grocery workflow + multi-store isolation (User A vs User B)
        sup = GrocerySupplierService.create_supplier(
            db,
            store_a_id,
            GrocerySupplierCreate(store_name="Kisan Wholesale", seller_name="Ramesh", phone="9998887776"),
        )
        prod = GroceryProductService.create_product(
            db,
            store_a_id,
            GroceryProductCreate(
                name="Organic Toor Dal 1kg",
                supplier_id=sup.id,
                purchase_price_with_tax=110.0,
                purchase_gst_rate=5.0,
                purchase_unit="Kilogram",
                selling_price_with_tax=140.0,
                selling_unit="Kilogram",
                selling_gst_rate=5.0,
                available_stock=25.0,
                low_stock_enabled=True,
                low_stock_qty=5.0,
                expiry_alert_enabled=False,
            ),
        )

        adj = GroceryProductService.adjust_stock(
            db, store_a_id, prod.id, change_qty=5, reason="Audit"
        )
        assert float(adj["available_stock"]) == 30.0

        po = GroceryPurchaseOrderService.place_order(
            db,
            store_a_id,
            PurchaseOrderCreate(
                supplier_id=sup.id, product_id=prod.id, qty=10, unit="Kilogram", purchase_price=105.0
            ),
        )
        assert po["id"] is not None

        bill = GroceryBillingService.make_bill(
            db,
            store_a,
            user_a.id,
            MakeBillRequest(
                customer_type="walk_in",
                walk_in_name="Cash Buyer",
                items=[
                    BillItemInput(
                        product_id=prod.id,
                        product_name="Organic Toor Dal 1kg",
                        price_with_tax=140.0,
                        gst_rate=5.0,
                        unit="Kilogram",
                        qty=2,
                    )
                ],
            ),
        )
        bill_id = bill["id"]
        assert bill_id is not None

        t0 = time.perf_counter()
        gov = get_dashboard_overview(db=db, store=store_a)
        gsearch_items, gsearch_total = GroceryProductService.list_products(
            db, store_a_id, search="Organic", limit=10
        )
        grep = get_sales_report(period="daily", db=db, store=store_a)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        assert "today_sales" in gov and gsearch_total == 1 and "recent_bills" in grep

        # Cross-store isolation assertions
        _expect_http_error(
            lambda: GroceryProductService.get_product_detail(db, store_b_id, prod.id), (403, 404)
        )
        _expect_http_error(
            lambda: GrocerySupplierService.get_supplier_detail(db, store_b_id, sup.id), (403, 404)
        )
        _expect_http_error(
            lambda: GroceryBillingService.get_invoice_detail(db, store_b_id, bill_id), (403, 404)
        )
        _, b_total = GroceryProductService.list_products(db, store_b_id)
        assert b_total == 0

        # 8. Forgot Password OTP security: hardcoded "123456" MUST NOT work!
        fp_res = AuthController.forgot_password(db, ForgotPasswordRequest(email=email_a))
        if fp_res.get("otp") != "123456":
            _expect_http_error(
                lambda: AuthController.verify_otp(VerifyOtpRequest(email=email_a, otp="123456"), db=db),
                (400,),
            )

        otp_row = (
            db.query(PasswordResetOtp)
            .filter(PasswordResetOtp.email == email_a, PasswordResetOtp.is_used == False)
            .order_by(PasswordResetOtp.id.desc())
            .first()
        )
        assert otp_row is not None
        real_otp = otp_row.otp_code
        assert AuthController.verify_otp(VerifyOtpRequest(email=email_a, otp=real_otp), db=db)["success"]
        assert AuthController.reset_password(
            db, ResetPasswordRequest(email=email_a, otp=real_otp, newPassword=new_pw_a)
        )["success"]

        RateLimiterService.reset_all()
        login_after = AuthController.login(db, UserLoginRequest(email=email_a, password=new_pw_a))
        tok_after = login_after.access_token
        assert AuthController.logout(
            db, token=tok_after, refresh_token=login_after.refresh_token, user_id=user_a.id
        )["success"]
        _expect_http_error(
            lambda: get_current_user(
                credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=tok_after), db=db
            ),
            (401,),
        )

        # 9. Verify Alembic composite performance indexes exist
        insp = inspect(engine)
        expected_indexes = {
            "invoices": {"ix_invoices_store_cust_status", "ix_invoices_store_date"},
            "purchases": {"ix_purchases_store_supp_status"},
            "customers": {"ix_customers_store_active_name"},
            "suppliers": {"ix_suppliers_store_active_name"},
            "products": {"ix_products_store_status_cat"},
            "grocery_bills": {"ix_grocery_bills_store_type_pay"},
            "grocery_purchase_orders": {"ix_grocery_po_store_status_pay"},
            "grocery_products": {"ix_grocery_products_store_active_del"},
        }
        for tbl, idx_set in expected_indexes.items():
            actual = {idx["name"] for idx in insp.get_indexes(tbl)}
            missing = idx_set - actual
            assert not missing, f"Missing composite indexes on {tbl}: {missing}"

        print(
            f"[PASS] test_routes_middleware_and_e2e_security passed all assertions! "
            f"(overview+search+report {elapsed_ms:.1f}ms)"
        )
    finally:
        if store_ids:
            db.query(GroceryBill).filter(GroceryBill.store_id.in_(store_ids)).delete(synchronize_session=False)
            db.query(GroceryPurchaseOrder).filter(GroceryPurchaseOrder.store_id.in_(store_ids)).delete(
                synchronize_session=False
            )
            db.query(GroceryProduct).filter(GroceryProduct.store_id.in_(store_ids)).delete(
                synchronize_session=False
            )
            db.query(GrocerySupplier).filter(GrocerySupplier.store_id.in_(store_ids)).delete(
                synchronize_session=False
            )
        db.query(PasswordResetOtp).filter(PasswordResetOtp.email.in_([email_a, email_b])).delete(
            synchronize_session=False
        )
        for em in (email_a, email_b):
            u = db.query(User).filter(User.email == em).first()
            if u:
                db.delete(u)
        db.commit()
        db.close()


if __name__ == "__main__":
    test_routes_middleware_and_e2e_security()
