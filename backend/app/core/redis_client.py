import json
import logging
from typing import Optional, Any
import redis
from .config import settings

logger = logging.getLogger(__name__)

class RedisManager:
    """
    Centralized Redis Client Manager
    Provides safe, resilient in-memory caching with automatic fallback
    """
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._is_connected: bool = False

    def get_client(self) -> Optional[redis.Redis]:
        if not settings.REDIS_ENABLED or not settings.REDIS_URL:
            return None

        if self._client is None:
            try:
                url = settings.REDIS_URL
                # Automatically enforce TLS (rediss://) for Upstash or cloud endpoints
                if ("upstash.io" in url or "aivencloud.com" in url) and url.startswith("redis://"):
                    url = url.replace("redis://", "rediss://", 1)

                self._client = redis.from_url(
                    url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
                self._client.ping()
                self._is_connected = True
                safe_url = url.split('@')[-1] if '@' in url else url
                logger.info(f"Connected to Redis host at {safe_url}")
            except Exception as e:
                self._client = None
                self._is_connected = False
                logger.warning(f"Redis unavailable, falling back to direct database: {e}")
                return None

        return self._client

    def is_connected(self) -> bool:
        client = self.get_client()
        if not client:
            return False
        try:
            return bool(client.ping())
        except Exception:
            self._is_connected = False
            return False

    def get_status(self) -> dict:
        safe_url = (
            settings.REDIS_URL.split('@')[-1] if '@' in settings.REDIS_URL else settings.REDIS_URL
        ) if settings.REDIS_URL else "not-configured"

        if not settings.REDIS_ENABLED or not settings.REDIS_URL:
            return {"status": "disabled", "endpoint": safe_url}

        connected = self.is_connected()
        return {
            "status": "connected" if connected else "unreachable",
            "endpoint": safe_url,
            "ttl_default": settings.REDIS_CACHE_TTL_SECONDS
        }

    def get(self, key: str) -> Optional[str]:
        client = self.get_client()
        if not client:
            return None
        try:
            return client.get(key)
        except Exception as e:
            logger.warning(f"Redis get failed for key '{key}': {e}")
            return None

    def set(self, key: str, value: str, expire: Optional[int] = None) -> bool:
        client = self.get_client()
        if not client:
            return False
        try:
            ttl = expire if expire is not None else settings.REDIS_CACHE_TTL_SECONDS
            return bool(client.set(key, value, ex=ttl))
        except Exception as e:
            logger.warning(f"Redis set failed for key '{key}': {e}")
            return False

    def get_json(self, key: str) -> Optional[Any]:
        raw = self.get(key)
        if not raw:
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    def set_json(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        try:
            raw = json.dumps(value)
            return self.set(key, raw, expire=expire)
        except Exception as e:
            logger.warning(f"Redis serialization failed for key '{key}': {e}")
            return False

    def delete(self, *keys: str) -> bool:
        client = self.get_client()
        if not client or not keys:
            return False
        try:
            return bool(client.delete(*keys))
        except Exception as e:
            logger.warning(f"Redis delete failed for keys '{keys}': {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        client = self.get_client()
        if not client:
            return 0
        try:
            matched = client.keys(pattern)
            if matched:
                return client.delete(*matched)
            return 0
        except Exception as e:
            logger.warning(f"Redis delete_pattern failed for pattern '{pattern}': {e}")
            return 0

# Singleton instance
redis_client = RedisManager()
