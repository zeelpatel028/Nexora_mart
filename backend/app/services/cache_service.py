import hashlib
from typing import Optional, Dict, Any
from ..core.redis_client import redis_client
from ..core.config import settings

class CacheService:
    """
    High-performance Caching Service for User Profiles and Token Blacklisting
    Accelerates database interactions and provides instant in-memory responses
    """
    
    @staticmethod
    def _token_hash(token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    # --- User Profile Caching ---

    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached user profile dictionary from Redis"""
        key = f"user:profile:{user_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_user_profile(user_id: int, user_data: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Store user profile in Redis with TTL"""
        key = f"user:profile:{user_id}"
        expire = ttl or settings.REDIS_CACHE_TTL_SECONDS
        return redis_client.set_json(key, user_data, expire=expire)

    @staticmethod
    def invalidate_user(user_id: int, email: Optional[str] = None) -> bool:
        """Purge cached user profile and lookup keys on update/logout"""
        keys = [f"user:profile:{user_id}"]
        if email:
            keys.append(f"user:email:{email.lower().strip()}")
        return redis_client.delete(*keys)

    # --- Token Blacklist (Revocation on Logout) ---

    @staticmethod
    def blacklist_token(token: str, expire_seconds: Optional[int] = None) -> bool:
        """Blacklist a JWT token in Redis so it cannot be reused after logout"""
        thash = CacheService._token_hash(token)
        key = f"token:blacklist:{thash}"
        ttl = expire_seconds or (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        return redis_client.set(key, "revoked", expire=ttl)

    @staticmethod
    def is_token_blacklisted(token: str) -> bool:
        """Check if JWT token has been invalidated"""
        thash = CacheService._token_hash(token)
        key = f"token:blacklist:{thash}"
        val = redis_client.get(key)
        return val == "revoked"

    # --- OTP Verification Caching (with in-memory backup) ---
    _in_memory_otps: Dict[str, str] = {}

    @staticmethod
    def set_otp(email: str, otp: str, ttl: int = 600) -> bool:
        clean_email = email.lower().strip()
        CacheService._in_memory_otps[clean_email] = otp
        key = f"otp:{clean_email}"
        try:
            return bool(redis_client.set(key, otp, expire=ttl))
        except Exception:
            return True

    @staticmethod
    def get_otp(email: str) -> Optional[str]:
        clean_email = email.lower().strip()
        key = f"otp:{clean_email}"
        val = None
        try:
            val = redis_client.get(key)
        except Exception:
            pass
        return val or CacheService._in_memory_otps.get(clean_email)

    @staticmethod
    def clear_otp(email: str) -> bool:
        clean_email = email.lower().strip()
        CacheService._in_memory_otps.pop(clean_email, None)
        key = f"otp:{clean_email}"
        try:
            return bool(redis_client.delete(key))
        except Exception:
            return True

    # --- Health & Diagnostic ---

    @staticmethod
    def get_cache_stats() -> dict:
        return redis_client.get_status()
