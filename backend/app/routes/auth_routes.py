from typing import Optional
from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..schemas.auth_schema import (
    UserLoginRequest,
    UserRegisterRequest,
    RefreshTokenRequest,
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
from ..services.store_service import StoreService
from ..services.rate_limiter_service import RateLimiterService
from ..utils.security import decode_access_token
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse, include_in_schema=False)
def login(request: Request, request_data: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate merchant user and return short-lived access JWT and 15-hour refresh token"""
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, retry_after = RateLimiterService.check_login_rate_limit(request_data.email, client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in 5 minutes.",
            headers={"Retry-After": str(retry_after)}
        )

    response = AuthController.login(db, request_data)
    RateLimiterService.clear_login_rate_limit(request_data.email, client_ip)
    return response

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register/", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def register(request_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Create new merchant store account and return short-lived access JWT and 15-hour refresh token"""
    return AuthController.register(db, request_data)

@router.post("/refresh", response_model=TokenResponse)
@router.post("/refresh/", response_model=TokenResponse, include_in_schema=False)
def refresh_token(request_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Rotate refresh token and issue a fresh 15-minute access JWT.
    Enforces a strict 15-hour absolute session limit from the original login.
    """
    return AuthController.refresh(db, request_data)

@router.post("/forgot-password")
@router.post("/forgot-password/", include_in_schema=False)
def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset flow and issue 6-digit verification OTP"""
    return AuthController.forgot_password(db, request_data)

@router.post("/verify-otp")
@router.post("/verify-otp/", include_in_schema=False)
def verify_otp(request_data: VerifyOtpRequest):
    """Verify 6-digit OTP code sent to user email"""
    return AuthController.verify_otp(request_data)

@router.post("/reset-password")
@router.post("/reset-password/", include_in_schema=False)
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verify OTP and update user account password"""
    return AuthController.reset_password(db, request_data)

@router.get("/me", response_model=UserResponse)
@router.get("/me/", response_model=UserResponse, include_in_schema=False)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get authenticated merchant profile details and current store context"""
    store = StoreService.get_user_store(db, current_user)
    return AuthController.format_user_response(current_user, store)

@router.put("/me", response_model=UserResponse)
@router.patch("/me", response_model=UserResponse)
def update_profile(
    request_data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update personal profile, contact information, or account password"""
    return AuthController.update_profile(db, current_user, request_data)

@router.post("/logout")
@router.post("/logout/", include_in_schema=False)
def logout(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """Sign out merchant session, revoke refresh token, and blacklist access token in Redis"""
    token_str = credentials.credentials if (credentials and credentials.credentials) else None
    user_id = None
    if token_str:
        payload = decode_access_token(token_str)
        if payload and "sub" in payload:
            try:
                user_id = int(payload["sub"])
            except Exception:
                pass

    return AuthController.logout(db, token=token_str, user_id=user_id)
