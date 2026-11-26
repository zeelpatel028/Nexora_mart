import datetime
import secrets
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..core.config import settings
from ..schemas.auth_schema import (
    UserLoginRequest,
    UserRegisterRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    TokenResponse,
    UserResponse,
    StoreSummary,
    StoreTypeSummary,
    SafeUser
)
from ..services.auth_service import AuthService
from ..services.cache_service import CacheService
from ..services.report_service import ReportService
from ..utils.security import get_password_hash, verify_password
from ..models.user import User, PasswordResetOtp
from ..models.store import Store

class AuthController:
    @staticmethod
    def format_store_summary(store: Optional[Store]) -> Optional[StoreSummary]:
        if not store:
            return None
        st_summary = None
        if store.store_type_rel:
            st_summary = StoreTypeSummary(
                id=store.store_type_rel.id,
                code=store.store_type_rel.code,
                name=store.store_type_rel.name
            )
        elif store.shop_category:
            st_summary = StoreTypeSummary(
                id=store.shop_category.id,
                code=store.shop_category.code.lower(),
                name=store.shop_category.name
            )

        return StoreSummary(
            id=store.id,
            name=store.name,
            code=store.code or store.store_code,
            store_type=st_summary
        )

    @staticmethod
    def format_user_response(user: User, store: Optional[Store] = None) -> UserResponse:
        store_summary = AuthController.format_store_summary(store)
        st_name = store.store_type if (store and store.store_type) else (user.store_type or "")
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.full_name,
            firstName=user.first_name,
            surname=user.surname,
            phone=user.phone or "",
            storeType=st_name,
            isActive=user.is_active,
            user=SafeUser(id=user.id, name=user.full_name, email=user.email),
            store=store_summary
        )

    @staticmethod
    def register(db: Session, request_data: UserRegisterRequest) -> TokenResponse:
        try:
            user, store, access_token, refresh_token = AuthService.register_user(db, request_data)
            user_resp = AuthController.format_user_response(user, store)
            store_summary = AuthController.format_store_summary(store)
            # Cache active merchant profile and pre-warm dashboard data in Redis
            try:
                CacheService.set_user_profile(user.id, user_resp.model_dump())
                if store:
                    dash = ReportService.get_dashboard_summary(db, store)
                    CacheService.set_dashboard_summary(store.id, dash)
            except Exception:
                pass
            return TokenResponse(
                access_token=access_token,
                token=access_token,
                refresh_token=refresh_token,
                tokenType="bearer",
                token_type="bearer",
                expires_in=900,
                user=user_resp,
                store=store_summary
            )
        except HTTPException:
            raise
        except ValueError as e:
            msg = str(e)
            if "already exists" in msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists. Please log in or use another email."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg
            )

    @staticmethod
    def login(db: Session, request_data: UserLoginRequest) -> TokenResponse:
        try:
            user, store, access_token, refresh_token = AuthService.authenticate_user(db, request_data)
            user_resp = AuthController.format_user_response(user, store)
            store_summary = AuthController.format_store_summary(store)
            try:
                CacheService.set_user_profile(user.id, user_resp.model_dump())
                if store:
                    dash = ReportService.get_dashboard_summary(db, store)
                    CacheService.set_dashboard_summary(store.id, dash)
            except Exception:
                pass
            return TokenResponse(
                access_token=access_token,
                token=access_token,
                refresh_token=refresh_token,
                tokenType="bearer",
                token_type="bearer",
                expires_in=900,
                user=user_resp,
                store=store_summary
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    @staticmethod
    def refresh(db: Session, request_data: RefreshTokenRequest) -> TokenResponse:
        user, store, access_token, new_refresh_token = AuthService.refresh_session(
            db, request_data.refresh_token
        )
        user_resp = AuthController.format_user_response(user, store)
        store_summary = AuthController.format_store_summary(store)
        try:
            CacheService.set_user_profile(user.id, user_resp.model_dump())
            if store:
                dash = ReportService.get_dashboard_summary(db, store)
                CacheService.set_dashboard_summary(store.id, dash)
        except Exception:
            pass
        return TokenResponse(
            access_token=access_token,
            token=access_token,
            refresh_token=new_refresh_token,
            tokenType="bearer",
            token_type="bearer",
            expires_in=900,
            user=user_resp,
            store=store_summary
        )

    @staticmethod
    def logout(
        db: Session,
        token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> dict:
        """Revoke JWT token and refresh session in DB and Redis"""
        if token:
            try:
                CacheService.blacklist_token(token)
            except Exception:
                pass
        if refresh_token:
            AuthService.revoke_token(db, plain_refresh_token=refresh_token)
        elif user_id:
            AuthService.revoke_token(db, user_id=user_id)

        if user_id:
            try:
                CacheService.invalidate_user(user_id)
            except Exception:
                pass
        return {
            "success": True,
            "message": "Successfully logged out and session revoked"
        }

    @staticmethod
    def forgot_password(db: Session, request_data: ForgotPasswordRequest) -> dict:
        user = AuthService.get_user_by_email(db, request_data.email)
        target_email = (user.email if user else request_data.email).strip().lower()
        otp_code = f"{secrets.randbelow(900000) + 100000}"

        # Persist OTP in database (invalidate previous unused OTPs for this email)
        now = datetime.datetime.now(datetime.timezone.utc)
        if user:
            db.query(PasswordResetOtp).filter(
                PasswordResetOtp.email == target_email,
                PasswordResetOtp.is_used == False
            ).update({"is_used": True})
            db.add(PasswordResetOtp(
                user_id=user.id,
                email=target_email,
                otp_code=otp_code,
                otp_type="RESET_PASSWORD",
                is_used=False,
                expires_at=now + datetime.timedelta(minutes=10),
            ))
            db.commit()

        try:
            CacheService.set_otp(target_email, otp_code, ttl=600)
            req_email_norm = request_data.email.strip().lower()
            if target_email != req_email_norm:
                CacheService.set_otp(req_email_norm, otp_code, ttl=600)
        except Exception:
            pass

        resp = {
            "success": True,
            "message": f"If an account exists for {target_email}, a 6-digit verification OTP has been generated.",
            "email": target_email,
        }
        if settings.is_dev:
            resp["otp"] = otp_code
        return resp

    @staticmethod
    def _is_valid_otp(email: str, provided_otp: str, db: Optional[Session] = None) -> bool:
        clean_email = email.strip().lower()
        code = provided_otp.strip()
        if not code:
            return False
        saved_otp = None
        try:
            saved_otp = CacheService.get_otp(clean_email)
        except Exception:
            pass
        if saved_otp and secrets.compare_digest(saved_otp, code):
            return True
        if db is not None:
            now = datetime.datetime.now(datetime.timezone.utc)
            otp_row = db.query(PasswordResetOtp).filter(
                PasswordResetOtp.email == clean_email,
                PasswordResetOtp.otp_code == code,
                PasswordResetOtp.is_used == False,
            ).order_by(PasswordResetOtp.id.desc()).first()
            if otp_row:
                exp = otp_row.expires_at
                if exp.tzinfo is None:
                    exp = exp.replace(tzinfo=datetime.timezone.utc)
                if exp > now:
                    return True
        return False

    @staticmethod
    def verify_otp(request_data: VerifyOtpRequest, db: Optional[Session] = None) -> dict:
        if AuthController._is_valid_otp(request_data.email, request_data.otp, db=db):
            return {
                "success": True,
                "message": "OTP verification successful"
            }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP verification code. Please request a new code."
        )

    @staticmethod
    def reset_password(db: Session, request_data: ResetPasswordRequest) -> dict:
        clean_email = request_data.email.strip().lower()
        code = request_data.otp.strip()
        if not AuthController._is_valid_otp(clean_email, code, db=db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code."
            )

        user = AuthService.get_user_by_email(db, clean_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        user.hashed_password = get_password_hash(request_data.newPassword)
        db.query(PasswordResetOtp).filter(
            PasswordResetOtp.email == user.email.lower(),
            PasswordResetOtp.is_used == False
        ).update({"is_used": True})
        db.commit()
        db.refresh(user)

        try:
            CacheService.clear_otp(clean_email)
            CacheService.clear_otp(user.email)
            CacheService.invalidate_user(user.id, user.email)
        except Exception:
            pass

        return {
            "success": True,
            "message": "Password has been successfully reset. Please sign in with your new password."
        }

    @staticmethod
    def update_profile(db: Session, current_user: User, request_data: UpdateProfileRequest) -> UserResponse:
        # Always load persistent DB User instance (handles Redis-cached detached user objects)
        db_user = db.query(User).filter(User.id == current_user.id).first()
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if request_data.name and not request_data.firstName:
            parts = request_data.name.strip().split(maxsplit=1)
            db_user.first_name = parts[0]
            if len(parts) > 1:
                db_user.surname = parts[1]
        else:
            if request_data.firstName is not None and request_data.firstName.strip():
                db_user.first_name = request_data.firstName.strip()
            if request_data.surname is not None and request_data.surname.strip():
                db_user.surname = request_data.surname.strip()

        if request_data.phone is not None and request_data.phone.strip():
            db_user.phone = request_data.phone.strip()

        if request_data.newPassword:
            if not request_data.currentPassword:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password."
                )
            if not verify_password(request_data.currentPassword, db_user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password."
                )
            db_user.hashed_password = get_password_hash(request_data.newPassword)

        db.commit()
        db.refresh(db_user)

        try:
            CacheService.invalidate_user(db_user.id, db_user.email)
        except Exception:
            pass

        store = db.query(Store).filter(Store.user_id == db_user.id, Store.is_active == True).first()
        user_resp = AuthController.format_user_response(db_user, store)
        try:
            CacheService.set_user_profile(db_user.id, user_resp.model_dump())
        except Exception:
            pass
        return user_resp
