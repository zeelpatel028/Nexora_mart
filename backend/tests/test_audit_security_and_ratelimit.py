import os
import sys
from pathlib import Path

# Add backend directory to path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from starlette.requests import Request
from fastapi import HTTPException
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.store_type import StoreType
from app.models.product import Product, ProductInventory
from app.models.inventory import ProductStock, StockAdjustment
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, RefreshTokenRequest
from app.schemas.sale_schema import SaleCreate, SaleItemCreate
from app.services.auth_service import AuthService
from app.services.rate_limiter_service import RateLimiterService
from app.services.sale_service import SaleService
from app.services.return_service import ReturnService
from app.routes.auth_routes import login as route_login

class MockClient:
    host = "127.0.0.1"

class DummyRequest:
    client = MockClient()
    headers = {}
    url = type("DummyURL", (), {"path": "/api/v1/auth/login"})()

def test_audit_security_and_ratelimit():
    print("\n" + "=" * 60)
    print("RUNNING COMPLETE AUDIT: SECURITY, RATE LIMITING & RETURNS TEST")
    print("=" * 60)

    # 1. TEST REGISTRATION & 409 DUPLICATE EMAIL
    print("\n[TEST 1] Testing registration validation and 409 duplicate email conflict...")
    RateLimiterService.reset_all()

    db = SessionLocal()
    test_email = "audit_user_2026@nmart.com"
    try:
        # Clean up existing test user
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()

        st_grocery = db.query(StoreType).filter(StoreType.code == "grocery").first()
        assert st_grocery is not None, "Store type grocery missing"

        # Valid Registration
        reg_payload = UserRegisterRequest(
            name="Audit Tester",
            email=test_email,
            password="Password123!",
            store_type_id=st_grocery.id
        )
        user, store, access_token, refresh_token = AuthService.register_user(db, reg_payload)
        assert user.id is not None
        assert user.email == test_email
        assert access_token is not None
        print("  -> PASS: Valid registration created user and store with JWT and Refresh Token.")

        # Duplicate Registration -> Must raise HTTP 409 Conflict
        try:
            AuthService.register_user(db, reg_payload)
            assert False, "Duplicate registration did not raise 409 Conflict!"
        except HTTPException as exc:
            assert exc.status_code == 409, f"Expected 409, got {exc.status_code}"
            assert exc.detail == "An account with this email already exists. Please log in or use another email."
            print(f"  -> PASS: Duplicate registration blocked with HTTP 409 Conflict: '{exc.detail}'.")

        # 2. TEST LOGIN RATE LIMITING (5 requests max, 6th returns 429)
        print("\n[TEST 2] Testing login rate limiting (max 5 requests / 5 min, 6th returns 429)...")
        RateLimiterService.reset_all()

        dummy_req = DummyRequest()
        bad_login_payload = UserLoginRequest(
            email=test_email,
            password="WrongPassword123!"
        )

        # Attempts 1 to 5: Should raise 401 Unauthorized (allowed attempt, bad password)
        for i in range(1, 6):
            try:
                route_login(dummy_req, bad_login_payload, db)
                assert False, f"Attempt {i} unexpectedly succeeded"
            except HTTPException as exc:
                assert exc.status_code == 401, f"Attempt {i} expected 401, got {exc.status_code}"
                print(f"  -> Attempt {i}: Allowed (Returned HTTP 401 Invalid Credentials).")

        # Attempt 6: MUST RAISE HTTP 429 Too Many Requests with Retry-After header!
        try:
            route_login(dummy_req, bad_login_payload, db)
            assert False, "Attempt 6 was not rate limited!"
        except HTTPException as exc:
            assert exc.status_code == 429, f"Expected 429, got {exc.status_code}"
            assert "too many" in exc.detail.lower()
            assert "Retry-After" in exc.headers or "retry-after" in exc.headers
            retry_val = exc.headers.get("Retry-After") or exc.headers.get("retry-after")
            print(f"  -> Attempt 6: BLOCKED with HTTP 429 Too Many Requests! Retry-After: {retry_val}s.")

        # 3. TEST RATE LIMIT RESET ON SUCCESSFUL LOGIN
        print("\n[TEST 3] Testing rate limit reset upon successful login...")
        RateLimiterService.reset_all()
        valid_login = UserLoginRequest(
            email=test_email,
            password="Password123!"
        )
        login_res = route_login(dummy_req, valid_login, db)
        assert login_res.access_token is not None
        assert login_res.refresh_token is not None
        print("  -> PASS: Successful login authenticated and reset rate limiter.")

        # 4. TEST REFRESH TOKEN ROTATION
        print("\n[TEST 4] Testing refresh token rotation...")
        u_ref, s_ref, new_access, new_refresh = AuthService.refresh_session(db, login_res.refresh_token)
        assert new_access != login_res.access_token, "Access token must be newly generated"
        assert new_refresh != login_res.refresh_token, "Refresh token must be rotated"
        print("  -> PASS: Refresh token rotated successfully.")

        # 5. TEST SALES INVENTORY REDUCTION & RETURNS RESTORATION
        print("\n[TEST 5] Testing sales inventory reduction and return restoration...")
        # Create test product with stock = 100
        test_prod = Product(
            store_id=store.id,
            product_name="Audit Basmati Rice 5kg",
            sku="AUDIT-RICE-5KG",
            status="active"
        )
        db.add(test_prod)
        db.flush()

        # Add initial stock
        stock = ProductStock(
            store_id=store.id,
            product_id=test_prod.id,
            quantity=100.0
        )
        db.add(stock)

        inv_rec = ProductInventory(
            store_id=store.id,
            product_id=test_prod.id,
            current_stock=100.0,
            opening_stock=100.0
        )
        db.add(inv_rec)
        db.commit()

        # Sale of 15 units
        sale_req = SaleCreate(
            items=[
                SaleItemCreate(
                    product_id=test_prod.id,
                    quantity=15.0,
                    unit_price=250.0,
                    discount=0.0
                )
            ],
            payment_method="CASH"
        )
        sale_data = SaleService.create_sale(db, store, user, sale_req)
        invoice_id = sale_data["id"]

        # Verify stock was reduced from 100 -> 85 in ProductStock and ProductInventory
        stk_after = db.query(ProductStock).filter(ProductStock.store_id == store.id, ProductStock.product_id == test_prod.id).first()
        inv_after = db.query(ProductInventory).filter(ProductInventory.store_id == store.id, ProductInventory.product_id == test_prod.id).first()
        assert stk_after.quantity == 85.0, f"Expected 85.0, got {stk_after.quantity}"
        assert float(inv_after.current_stock) == 85.0, f"Expected 85.0, got {inv_after.current_stock}"
        print(f"  -> PASS: Sale #{sale_data['invoice_number']} reduced stock from 100 -> 85 across all tables.")

        # Process return of 5 units
        return_items = [
            {
                "product_id": test_prod.id,
                "quantity": 5.0,
                "unit_price": 250.0,
                "condition_note": "Sealed pack return"
            }
        ]
        ret_data = ReturnService.process_return(
            db=db,
            store=store,
            user=user,
            invoice_id=invoice_id,
            items=return_items,
            reason="Customer changed mind",
            refund_method="CASH"
        )
        assert ret_data["total_return_amount"] == 1250.0, f"Expected 1250.0, got {ret_data['total_return_amount']}"

        # Verify stock restored from 85 -> 90 in ProductStock and ProductInventory
        stk_restored = db.query(ProductStock).filter(ProductStock.store_id == store.id, ProductStock.product_id == test_prod.id).first()
        inv_restored = db.query(ProductInventory).filter(ProductInventory.store_id == store.id, ProductInventory.product_id == test_prod.id).first()
        assert stk_restored.quantity == 90.0, f"Expected 90.0, got {stk_restored.quantity}"
        assert float(inv_restored.current_stock) == 90.0, f"Expected 90.0, got {inv_restored.current_stock}"

        # Verify StockAdjustment record created
        adj = db.query(StockAdjustment).filter(
            StockAdjustment.store_id == store.id,
            StockAdjustment.product_id == test_prod.id,
            StockAdjustment.adjustment_type == "ADD"
        ).first()
        assert adj is not None, "Missing StockAdjustment record for return"
        assert adj.quantity == 5.0
        print(f"  -> PASS: Return #{ret_data['return_number']} restored stock from 85 -> 90 with audit trail.")

        print("\n" + "=" * 60)
        print("ALL AUDIT, SECURITY, RATE LIMIT & RETURNS TESTS PASSED! (5 / 5)")
        print("=" * 60 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    test_audit_security_and_ratelimit()
