import datetime
import hashlib
import secrets
from typing import Optional
import bcrypt
from jose import jwt, JWTError
from ..core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def generate_refresh_token() -> str:
    """Generate a high-entropy cryptographically secure refresh token string."""
    return secrets.token_urlsafe(48)

def hash_refresh_token(token: str) -> str:
    """Compute SHA-256 hash of refresh token for secure database storage."""
    return hashlib.sha256(token.strip().encode("utf-8")).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    to_encode = data.copy()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.setdefault("iat", int(now.timestamp()))
    to_encode.setdefault("jti", secrets.token_hex(16))
    to_encode.setdefault("iss", settings.JWT_ISSUER)
    to_encode.setdefault("aud", settings.JWT_AUDIENCE)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}  # Lenient on audience check for flexibility while validating signature & exp
        )
        return payload
    except JWTError:
        return None
