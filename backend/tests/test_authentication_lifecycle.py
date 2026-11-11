import sys
import datetime
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.store_type import StoreType
from app.models.refresh_token import RefreshToken
from app.schemas.auth_schema import (
    UserRegisterRequest,
    UserLoginRequest,
    RefreshTokenRequest
)
from app.services.auth_service import AuthService
from app.utils.security import (
    decode_access_token,
    verify_password,
    hash_refresh_token
)
from app.core.config import settings

def test_registration_and_login_lifecycle():
    db = SessionLocal()
    test_email = "test_merchant_2026@nexoramart.com"
    try:
        # Clean up if existing
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            db.delete(u)
            db.commit()

        # 1. Registration with valid store type ID
        st_grocery = db.query(StoreType).filter(StoreType.code == "grocery").first()
        assert st_grocery is not None, "Store type 'grocery' not found in database."

        reg_data = UserRegisterRequest(
            name="Rohit Sharma",
            email=test_email,
            password="SecurePassword123!",
            store_type_id=st_grocery.id,
            phone="+91-9876543210"
        )
        user, store, access_token, refresh_token = AuthService.register_user(db, reg_data)

        assert user.id is not None
        assert user.email == test_email
        assert user.first_name == "Rohit"
        assert store.id is not None
        assert store.user_id == user.id
        assert store.store_type_id == st_grocery.id

        # 2. Verify password stored as hash
        assert user.hashed_password != "SecurePassword123!"
        assert verify_password("SecurePassword123!", user.hashed_password) is True

        # 3. Duplicate email rejection (HTTP 409 Conflict)
        from fastapi import HTTPException
        try:
            AuthService.register_user(db, reg_data)
            assert False, "Duplicate email registration did not raise HTTPException / ValueError"
        except (ValueError, HTTPException) as e:
            if isinstance(e, HTTPException):
                assert e.status_code == 409
                assert "already exists" in str(e.detail).lower()
            else:
                assert "already exists" in str(e).lower()

        # 4. Invalid store type rejection
        invalid_reg = UserRegisterRequest(
            name="Fraud User",
            email="fraud@test.com",
            password="Password123!",
            store_type_id=999999  # Non-existent
        )
        try:
            AuthService.register_user(db, invalid_reg)
            assert False, "Invalid store_type_id did not raise ValueError"
        except ValueError as e:
            assert "invalid or inactive store type" in str(e).lower()

        # 5. Login: Correct password succeeds, wrong password fails
        login_success_user, login_store, acc_tok, ref_tok = AuthService.authenticate_user(
            db, UserLoginRequest(email=test_email, password="SecurePassword123!")
        )
        assert login_success_user.id == user.id
        assert login_store.id == store.id

        try:
            AuthService.authenticate_user(
                db, UserLoginRequest(email=test_email, password="WrongPassword!")
            )
            assert False, "Login with wrong password did not fail"
        except ValueError as e:
            assert "invalid credentials" in str(e).lower()

        # 6. Access token expiry claim validation (15 minutes)
        payload = decode_access_token(acc_tok)
        assert payload is not None
        assert payload["sub"] == str(user.id)
        assert "sid" in payload
        iat = payload["iat"]
        exp = payload["exp"]
        lifetime_seconds = exp - iat
        assert 890 <= lifetime_seconds <= 910, f"Expected ~900s (15 min) token expiry, got {lifetime_seconds}s"

        # 7. Refresh token rotation: valid refresh succeeds, rotates token
        ref_user, ref_store, new_acc_tok, new_ref_tok = AuthService.refresh_session(db, ref_tok)
        assert ref_user.id == user.id
        assert ref_store.id == store.id
        assert new_ref_tok != ref_tok, "Rotated refresh token must be different from previous"

        # 8. Reusing old refresh token must be rejected (revocation verification)
        try:
            AuthService.refresh_session(db, ref_tok)
            assert False, "Reusing old/rotated refresh token was not rejected"
        except Exception as e:
            assert "revoked" in str(e).lower() or "invalid" in str(e).lower() or "401" in str(e)

        # 9. Logout: Revokes refresh token
        revoked = AuthService.revoke_token(db, plain_refresh_token=new_ref_tok)
        assert revoked is True

        # Attempting refresh after logout fails
        try:
            AuthService.refresh_session(db, new_ref_tok)
            assert False, "Refresh succeeded with logged-out revoked token"
        except Exception as e:
            assert "revoked" in str(e).lower() or "invalid" in str(e).lower() or "401" in str(e)

        print("[PASS] test_registration_and_login_lifecycle passed all assertions.")
    finally:
        # Cleanup
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            db.delete(u)
            db.commit()
        db.close()

if __name__ == "__main__":
    test_registration_and_login_lifecycle()

