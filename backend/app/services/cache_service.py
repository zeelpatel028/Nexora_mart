import hashlib
import logging
from typing import Optional, Dict, Any, List
from ..core.redis_client import redis_client
from ..core.config import settings

logger = logging.getLogger("nmart.cache")

class CacheService:
    """
    Tulsi Mart Enterprise Cache Service.
    Implements cache-aside architecture for:
    - Products catalogs, categories, details, and search queries.
    - User Cart and Wishlist syncing with Redis.
    - Refresh token active session validation & instant revocation.
    - JWT token blacklisting on logout.
    - OTP storage and automatic invalidation.
    """

    @staticmethod
    def _token_hash(token: str) -> str:
        return hashlib.sha256(token.strip().encode('utf-8')).hexdigest()

    # --- User Profile Caching ---

    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached user profile dictionary from Redis/Memory"""
        key = f"tulsimart:user:profile:{user_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_user_profile(user_id: int, user_data: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Store user profile in Redis/Memory with TTL"""
        key = f"tulsimart:user:profile:{user_id}"
        expire = ttl or settings.REDIS_CACHE_TTL_SECONDS
        return redis_client.set_json(key, user_data, expire=expire)

    @staticmethod
    def invalidate_user(user_id: int, email: Optional[str] = None) -> bool:
        """Purge cached user profile and lookup keys on update/logout"""
        keys = [f"tulsimart:user:profile:{user_id}"]
        if email:
            keys.append(f"tulsimart:user:email:{email.lower().strip()}")
        return redis_client.delete(*keys)

    # --- Refresh Token Validation & Revocation in Redis ---

    @staticmethod
    def store_refresh_token(plain_refresh_token: str, user_id: int, ttl_seconds: Optional[int] = None) -> bool:
        """Store active refresh token hash in Redis for instant revocation"""
        thash = CacheService._token_hash(plain_refresh_token)
        key = f"tulsimart:refresh:token:{thash}"
        ttl = ttl_seconds or (settings.REFRESH_TOKEN_EXPIRE_HOURS * 3600)
        return redis_client.set(key, str(user_id), expire=ttl)

    @staticmethod
    def is_refresh_token_in_redis(plain_refresh_token: str) -> bool:
        """Check if refresh token is registered as active in Redis"""
        thash = CacheService._token_hash(plain_refresh_token)
        key = f"tulsimart:refresh:token:{thash}"
        val = redis_client.get(key)
        return val is not None

    @staticmethod
    def revoke_refresh_token(plain_refresh_token: str) -> bool:
        """Instantly revoke refresh token in Redis upon logout or rotation"""
        thash = CacheService._token_hash(plain_refresh_token)
        key = f"tulsimart:refresh:token:{thash}"
        redis_client.delete(key)
        # Also add to revoked set for safety
        blacklist_key = f"tulsimart:token:blacklist:{thash}"
        ttl = settings.REFRESH_TOKEN_EXPIRE_HOURS * 3600
        redis_client.set(blacklist_key, "revoked", expire=ttl)
        return True

    # --- JWT Token Blacklist (Logout) ---

    @staticmethod
    def blacklist_token(token: str, expire_seconds: Optional[int] = None) -> bool:
        """Blacklist a JWT access or refresh token in Redis"""
        thash = CacheService._token_hash(token)
        key = f"tulsimart:token:blacklist:{thash}"
        ttl = expire_seconds or (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        return redis_client.set(key, "revoked", expire=ttl)

    @staticmethod
    def is_token_blacklisted(token: str) -> bool:
        """Check if JWT token has been invalidated"""
        thash = CacheService._token_hash(token)
        key = f"tulsimart:token:blacklist:{thash}"
        val = redis_client.get(key)
        return val == "revoked"

    # --- User Cart Caching ---

    @staticmethod
    def get_user_cart(user_id: int) -> Optional[List[Dict[str, Any]]]:
        """Fetch user cart from Redis"""
        key = f"tulsimart:cart:{user_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_user_cart(user_id: int, cart_items: List[Dict[str, Any]], ttl: int = 604800) -> bool:
        """Save user cart to Redis (7 days TTL)"""
        key = f"tulsimart:cart:{user_id}"
        return redis_client.set_json(key, cart_items, expire=ttl)

    @staticmethod
    def clear_user_cart(user_id: int) -> bool:
        """Clear user cart in Redis"""
        key = f"tulsimart:cart:{user_id}"
        return bool(redis_client.delete(key))

    # --- User Wishlist Caching ---

    @staticmethod
    def get_user_wishlist(user_id: int) -> Optional[List[int]]:
        """Fetch user wishlist product IDs from Redis"""
        key = f"tulsimart:wishlist:{user_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_user_wishlist(user_id: int, product_ids: List[int], ttl: int = 604800) -> bool:
        """Save user wishlist product IDs to Redis (7 days TTL)"""
        key = f"tulsimart:wishlist:{user_id}"
        return redis_client.set_json(key, product_ids, expire=ttl)

    # --- Product Catalog & Categories Caching ---

    @staticmethod
    def get_products_list(store_id: int, cache_key: str) -> Optional[Any]:
        """Retrieve cached product query result"""
        key = f"tulsimart:products:list:{store_id}:{cache_key}"
        return redis_client.get_json(key)

    @staticmethod
    def set_products_list(store_id: int, cache_key: str, data: Any, ttl: int = 180) -> bool:
        """Cache product list page (default 3 minutes TTL)"""
        key = f"tulsimart:products:list:{store_id}:{cache_key}"
        return redis_client.set_json(key, data, expire=ttl)

    @staticmethod
    def get_product_detail(product_id: int) -> Optional[Any]:
        """Retrieve cached product detail"""
        key = f"tulsimart:products:detail:{product_id}"
        return redis_client.get_json(key)

    @staticmethod
    def set_product_detail(product_id: int, data: Any, ttl: int = 300) -> bool:
        """Cache product detail (default 5 minutes TTL)"""
        key = f"tulsimart:products:detail:{product_id}"
        return redis_client.set_json(key, data, expire=ttl)

    @staticmethod
    def get_categories(store_id: Optional[int] = None) -> Optional[Any]:
        """Retrieve cached category list"""
        key = f"tulsimart:categories:list:{store_id or 'all'}"
        return redis_client.get_json(key)

    @staticmethod
    def set_categories(data: Any, store_id: Optional[int] = None, ttl: int = 600) -> bool:
        """Cache category list (default 10 minutes TTL)"""
        key = f"tulsimart:categories:list:{store_id or 'all'}"
        return redis_client.set_json(key, data, expire=ttl)

    @staticmethod
    def invalidate_products_cache(store_id: Optional[int] = None) -> int:
        """Invalidate all cached products and categories upon mutation"""
        patterns = ["tulsimart:products:*", "tulsimart:categories:*"]
        deleted = 0
        for p in patterns:
            deleted += redis_client.delete_pattern(p)
        return deleted

    # --- Dashboard & Report Analytics Caching ---

    @staticmethod
    def get_dashboard_summary(store_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached dashboard summary instantly from Redis/Memory"""
        try:
            key = f"tulsimart:store:dashboard:{store_id}"
            return redis_client.get_json(key)
        except Exception as e:
            logger.warning(f"Error reading dashboard summary cache for store {store_id}: {e}")
            return None

    @staticmethod
    def set_dashboard_summary(store_id: int, data: Dict[str, Any], ttl: int = 300) -> bool:
        """Cache store dashboard summary (default 5 minutes TTL)"""
        try:
            key = f"tulsimart:store:dashboard:{store_id}"
            return redis_client.set_json(key, data, expire=ttl)
        except Exception as e:
            logger.warning(f"Error caching dashboard summary for store {store_id}: {e}")
            return False

    @staticmethod
    def get_sales_analytics(store_id: int, days: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached sales analytics for a store and date range from Redis/Memory.
        Key structure: tulsimart:store:{store_id}:analytics:sales:{days}
        """
        try:
            key = f"tulsimart:store:{store_id}:analytics:sales:{days}"
            return redis_client.get_json(key)
        except Exception as e:
            logger.warning(f"Error reading sales analytics cache for store {store_id}, days {days}: {e}")
            return None

    @staticmethod
    def set_sales_analytics(store_id: int, days: int, data: Dict[str, Any], ttl: int = 300) -> bool:
        """
        Cache sales analytics for a store and date range (default 5 minutes TTL).
        Key structure: tulsimart:store:{store_id}:analytics:sales:{days}
        """
        try:
            key = f"tulsimart:store:{store_id}:analytics:sales:{days}"
            return redis_client.set_json(key, data, expire=ttl)
        except Exception as e:
            logger.warning(f"Error caching sales analytics for store {store_id}, days {days}: {e}")
            return False

    @staticmethod
    def invalidate_sales_analytics(store_id: int) -> bool:
        """
        Invalidate all cached sales analytics across all date ranges for a store.
        """
        try:
            redis_client.delete_pattern(f"tulsimart:store:{store_id}:analytics:sales:*")
            return True
        except Exception as e:
            logger.warning(f"Error invalidating sales analytics cache for store {store_id}: {e}")
            return False

    @staticmethod
    def invalidate_dashboard_summary(store_id: int) -> bool:
        """Invalidate dashboard analytics when inventory/sales/purchases change"""
        try:
            keys = [
                f"tulsimart:store:dashboard:{store_id}",
                f"tulsimart:store:overview:{store_id}",
            ]
            redis_client.delete(*keys)
            redis_client.delete_pattern(f"tulsimart:store:analytics:{store_id}:*")
            redis_client.delete_pattern(f"tulsimart:store:{store_id}:analytics:*")
            return True
        except Exception as e:
            logger.warning(f"Error invalidating dashboard summary for store {store_id}: {e}")
            return False

    # --- OTP Verification Caching ---
    _in_memory_otps: Dict[str, str] = {}

    @staticmethod
    def set_otp(email: str, otp: str, ttl: int = 600) -> bool:
        clean_email = email.lower().strip()
        CacheService._in_memory_otps[clean_email] = otp
        key = f"tulsimart:otp:{clean_email}"
        try:
            return bool(redis_client.set(key, otp, expire=ttl))
        except Exception:
            return True

    @staticmethod
    def get_otp(email: str) -> Optional[str]:
        clean_email = email.lower().strip()
        key = f"tulsimart:otp:{clean_email}"
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
        key = f"tulsimart:otp:{clean_email}"
        try:
            return bool(redis_client.delete(key))
        except Exception:
            return True

    @staticmethod
    def get_cache_stats() -> dict:
        return redis_client.get_status()
