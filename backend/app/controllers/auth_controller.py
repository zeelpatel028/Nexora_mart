import random
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.auth_schema import (
    UserLoginRequest,
    UserRegisterRequest,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    TokenResponse,
    UserResponse
)
from ..services.auth_service import AuthService
from ..services.cache_service import CacheService
from ..utils.security import get_password_hash, verify_password
from ..models.user import User

class AuthController:
    @staticmethod
    def format_user_response(user: User) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.full_name,
            firstName=user.first_name,
            surname=user.surname,
            phone=user.phone,
            storeType=user.store_type,
            isActive=user.is_active
        )

    @staticmethod
    def register(db: Session, request_data: UserRegisterRequest) -> TokenResponse:
        try:
            user = AuthService.register_user(db, request_data)
            user_resp = AuthController.format_user_response(user)
            # Authenticate and issue token
            _, token = AuthService.authenticate_user(
                db,
                UserLoginRequest(email=request_data.email, password=request_data.password)
            )
            # Cache newly registered profile in Redis
            CacheService.set_user_profile(user.id, user_resp.model_dump())
            return TokenResponse(token=token, user=user_resp)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    def login(db: Session, request_data: UserLoginRequest) -> TokenResponse:
        try:
            user, token = AuthService.authenticate_user(db, request_data)
            user_resp = AuthController.format_user_response(user)
            # Cache active merchant profile in Redis for fast access
            CacheService.set_user_profile(user.id, user_resp.model_dump())
            return TokenResponse(token=token, user=user_resp)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    @staticmethod
    def logout(token: Optional[str] = None, user_id: Optional[int] = None) -> dict:
        """Revoke JWT token and invalidate cached user profile in Redis"""
        if token:
            CacheService.blacklist_token(token)
        if user_id:
            CacheService.invalidate_user(user_id)
        return {
            "success": True,
            "message": "Successfully logged out and session revoked in Redis"
        }

    @staticmethod
    def forgot_password(db: Session, request_data: ForgotPasswordRequest) -> dict:
        user = AuthService.get_user_by_email(db, request_data.email)
        # Generate 6-digit verification OTP
        otp_code = str(random.randint(100000, 999999))
        CacheService.set_otp(request_data.email, otp_code, ttl=600)
        return {
            "success": True,
            "message": f"6-digit OTP verification code generated for {request_data.email}",
            "otp": otp_code,
            "exists": bool(user)
        }

    @staticmethod
    def verify_otp(request_data: VerifyOtpRequest) -> dict:
        saved_otp = CacheService.get_otp(request_data.email)
        provided_otp = request_data.otp.strip()
        # Accept saved OTP or master demo OTP 123456
        if saved_otp and (saved_otp == provided_otp or provided_otp == "123456"):
            return {
                "success": True,
                "message": "OTP verification successful"
            }
        elif provided_otp == "123456":
            return {
                "success": True,
                "message": "Demo OTP accepted"
            }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP verification code. Please request a new code."
        )

    @staticmethod
    def reset_password(db: Session, request_data: ResetPasswordRequest) -> dict:
        # First verify OTP
        saved_otp = CacheService.get_otp(request_data.email)
        provided_otp = request_data.otp.strip()
        is_valid_otp = (saved_otp and saved_otp == provided_otp) or provided_otp == "123456"
        if not is_valid_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code."
            )

        user = AuthService.get_user_by_email(db, request_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        user.hashed_password = get_password_hash(request_data.newPassword)
        db.commit()
        db.refresh(user)

        # Clear OTP and invalidate profile cache
        CacheService.clear_otp(request_data.email)
        CacheService.invalidate_user(user.id, user.email)

        return {
            "success": True,
            "message": "Password has been successfully reset. Please sign in with your new password."
        }

    @staticmethod
    def update_profile(db: Session, current_user: User, request_data: UpdateProfileRequest) -> UserResponse:
        if request_data.firstName is not None and request_data.firstName.strip():
            current_user.first_name = request_data.firstName.strip()
        if request_data.surname is not None and request_data.surname.strip():
            current_user.surname = request_data.surname.strip()
        if request_data.phone is not None and request_data.phone.strip():
            current_user.phone = request_data.phone.strip()

        # Handle password change
        if request_data.newPassword:
            if not request_data.currentPassword:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password."
                )
            if not verify_password(request_data.currentPassword, current_user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password."
                )
            current_user.hashed_password = get_password_hash(request_data.newPassword)

        db.commit()
        db.refresh(current_user)

        # Invalidate profile cache
        CacheService.invalidate_user(current_user.id, current_user.email)

        user_resp = AuthController.format_user_response(current_user)
        CacheService.set_user_profile(current_user.id, user_resp.model_dump())
        return user_resp
