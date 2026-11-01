from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..utils.security import decode_access_token
from ..services.auth_service import AuthService
from ..services.cache_service import CacheService
from ..models.user import User

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )

    # 1. Check Redis token blacklist (fast in-memory lookup)
    if CacheService.is_token_blacklisted(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been terminated. Please log in again."
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    user_id = int(payload["sub"])

    # 2. Fast Path: Check Redis for cached user (bypasses SQLite DB disk read)
    cached_profile = CacheService.get_user_profile(user_id)
    if cached_profile:
        if not cached_profile.get("isActive", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        # Construct active User model instance from Redis cache
        return User(
            id=cached_profile["id"],
            email=cached_profile["email"],
            first_name=cached_profile.get("firstName") or cached_profile.get("first_name", ""),
            surname=cached_profile.get("surname", ""),
            phone=cached_profile.get("phone", ""),
            store_type=cached_profile.get("storeType") or cached_profile.get("store_type", ""),
            is_active=cached_profile.get("isActive", True)
        )

    # 3. Slow Path (Cache Miss / Redis Down): Fallback to Relational Database
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Populate Redis cache for subsequent fast-path requests
    user_dict = {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "firstName": user.first_name,
        "surname": user.surname,
        "phone": user.phone,
        "storeType": user.store_type,
        "isActive": user.is_active
    }
    CacheService.set_user_profile(user.id, user_dict)
    return user
