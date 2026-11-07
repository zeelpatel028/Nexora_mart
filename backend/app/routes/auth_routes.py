from typing import Optional
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database.connection import get_db
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
from ..controllers.auth_controller import AuthController
from ..middleware.auth_middleware import get_current_user, security_scheme
from ..services.cache_service import CacheService
from ..utils.security import decode_access_token
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request_data: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate merchant user and return JWT bearer token"""
    return AuthController.login(db, request_data)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Create new merchant store account and return JWT bearer token"""
    return AuthController.register(db, request_data)

@router.post("/forgot-password")
def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset flow and issue 6-digit verification OTP"""
    return AuthController.forgot_password(db, request_data)

@router.post("/verify-otp")
def verify_otp(request_data: VerifyOtpRequest):
    """Verify 6-digit OTP code sent to user email"""
    return AuthController.verify_otp(request_data)

@router.post("/reset-password")
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verify OTP and update user account password"""
    return AuthController.reset_password(db, request_data)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get authenticated merchant profile details with Redis caching"""
    # 1. Fast Path: Check Redis
    cached = CacheService.get_user_profile(current_user.id)
    if cached:
        return UserResponse(**cached)

    # 2. Slow Path: Format & store in Redis
    user_resp = AuthController.format_user_response(current_user)
    CacheService.set_user_profile(current_user.id, user_resp.model_dump())
    return user_resp

@router.put("/me", response_model=UserResponse)
def update_profile(
    request_data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update personal profile, contact information, or account password"""
    return AuthController.update_profile(db, current_user, request_data)

@router.post("/logout")
def logout(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)):
    """Sign out merchant session and blacklist token in Redis"""
    if credentials and credentials.credentials:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"]) if payload and "sub" in payload else None
        return AuthController.logout(token=credentials.credentials, user_id=user_id)
    return {"success": True, "message": "Successfully logged out"}
