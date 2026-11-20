import hashlib
from typing import Optional, Dict, Any, List
from ..core.redis_client import redis_client
from ..core.config import settings

class CacheService:
    """
    High-performance Caching Service for User Profiles, Dashboard Analytics,
    Product Catalogs, and Token Blacklisting.
    Accelerates database interactions and provides instant in-memory responses.
    """
    
    @staticmethod
    def _token_hash(token: str) -> str:
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    # --- User Profile Caching ---

    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached user profile dictionary from Redis/Memory"""
        key = f"user:profile:{user_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_user_profile(user_id: int, user_data: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Store user profile in Redis/Memory with TTL"""
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

    # --- Dashboard & Report Analytics Caching ---

    @staticmethod
    def get_dashboard_summary(store_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached dashboard summary instantly from Redis/Memory"""
        key = f"store:dashboard:{store_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_dashboard_summary(store_id: int, data: Dict[str, Any], ttl: int = 300) -> bool:
        """Cache store dashboard summary (default 5 minutes TTL)"""
        key = f"store:dashboard:{store_id}"
        return redis_client.set_json(key, data, expire=ttl)

    @staticmethod
    def invalidate_dashboard_summary(store_id: int) -> bool:
        """Invalidate dashboard analytics when inventory/sales/purchases change"""
        keys = [
            f"store:dashboard:{store_id}",
            f"store:overview:{store_id}",
        ]
        redis_client.delete(*keys)
        redis_client.delete_pattern(f"store:analytics:{store_id}:*")
        return True

    @staticmethod
    def get_sales_analytics(store_id: int, days: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached sales analytics for a store"""
        key = f"store:analytics:{store_id}:{days}"
        return redis_client.get_json(key)

    @staticmethod
    def set_sales_analytics(store_id: int, days: int, data: Dict[str, Any], ttl: int = 300) -> bool:
        """Cache sales analytics graph points (default 5 minutes TTL)"""
        key = f"store:analytics:{store_id}:{days}"
        return redis_client.set_json(key, data, expire=ttl)

    # --- Product Catalog Caching ---

    @staticmethod
    def get_products_list(store_id: int, cache_key: str) -> Optional[Any]:
        """Retrieve cached product query result"""
        key = f"store:products:{store_id}:{cache_key}"
        return redis_client.get_json(key)

    @staticmethod
    def set_products_list(store_id: int, cache_key: str, data: Any, ttl: int = 120) -> bool:
        """Cache product list page (default 2 minutes TTL)"""
        key = f"store:products:{store_id}:{cache_key}"
        return redis_client.set_json(key, data, expire=ttl)

    @staticmethod
    def invalidate_products_cache(store_id: int) -> int:
        """Invalidate all cached product list queries for a store"""
        return redis_client.delete_pattern(f"store:products:{store_id}:*")

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
