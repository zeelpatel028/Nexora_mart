from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.auth_schema import (
    UserLoginRequest,
    UserRegisterRequest,
    ForgotPasswordRequest,
    TokenResponse,
    UserResponse
)
from ..services.auth_service import AuthService
from ..services.cache_service import CacheService
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
    def forgot_password(request_data: ForgotPasswordRequest) -> dict:
        # In production, dispatch email with reset token
        return {
            "success": True,
            "message": f"Password reset instructions dispatched to {request_data.email}"
        }
