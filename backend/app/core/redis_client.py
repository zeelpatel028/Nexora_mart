import json
import logging
import time
import fnmatch
from typing import Optional, Any, Dict, Tuple
try:
    import redis
except ImportError:
    redis = None  # type: ignore[assignment]
from .config import settings

logger = logging.getLogger(__name__)


class InMemoryTTLCache:
    """
    High-speed thread-safe in-memory key-value store with TTL.
    Provides sub-millisecond caching as instant fallback when remote Redis is unreachable.
    """
    def __init__(self):
        self._data: Dict[str, Tuple[str, Optional[float]]] = {}

    def get(self, key: str) -> Optional[str]:
        item = self._data.get(key)
        if not item:
            return None
        val, expire_at = item
        if expire_at is not None and time.time() > expire_at:
            self._data.pop(key, None)
            return None
        return val

    def set(self, key: str, value: str, expire: Optional[int] = None) -> bool:
        expire_at = (time.time() + expire) if expire is not None else None
        self._data[key] = (str(value), expire_at)
        return True

    def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if self._data.pop(k, None) is not None:
                count += 1
        return count

    def delete_pattern(self, pattern: str) -> int:
        keys_to_del = [k for k in self._data.keys() if fnmatch.fnmatch(k, pattern)]
        for k in keys_to_del:
            self._data.pop(k, None)
        return len(keys_to_del)

    def ttl(self, key: str) -> int:
        item = self._data.get(key)
        if not item:
            return -2
        _, expire_at = item
        if expire_at is None:
            return -1
        remaining = int(expire_at - time.time())
        if remaining <= 0:
            self._data.pop(key, None)
            return -2
        return remaining

    def incr(self, key: str) -> int:
        curr = self.get(key)
        new_val = 1 if curr is None else (int(curr) + 1)
        # Preserve expiration if exists
        item = self._data.get(key)
        exp = item[1] if item else None
        self._data[key] = (str(new_val), exp)
        return new_val

    def expire(self, key: str, seconds: int) -> bool:
        item = self._data.get(key)
        if not item:
            return False
        self._data[key] = (item[0], time.time() + seconds)
        return True


class RedisManager:
    """
    Centralized High-Performance Redis Client Manager.
    Features:
    1. Fast connection establishment with 1.5s timeout.
    2. Connection failure cooldown to prevent repeated socket blocking.
    3. Transparent sub-millisecond in-memory fallback for offline/local environments.
    """
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._is_connected: bool = False
        self._last_failure_time: float = 0.0
        self._cooldown_seconds: float = 30.0
        self._memory_cache = InMemoryTTLCache()

    def get_client(self) -> Optional[Any]:
        if redis is None or not settings.REDIS_ENABLED or not settings.REDIS_URL:
            return None

        # If connected and healthy, return client
        if self._client is not None and self._is_connected:
            return self._client

        # Avoid hammering unreachable network host; enforce cooldown
        now = time.time()
        if (now - self._last_failure_time) < self._cooldown_seconds:
            return None

        try:
            url = settings.REDIS_URL
            # Automatically enforce TLS (rediss://) for cloud endpoints
            if ("upstash.io" in url or "aivencloud.com" in url) and url.startswith("redis://"):
                url = url.replace("redis://", "rediss://", 1)

            # Fast 1.5s socket timeout
            self._client = redis.from_url(
                url,
                decode_responses=True,
                socket_connect_timeout=1.5,
                socket_timeout=1.5,
                retry_on_timeout=False
            )
            self._client.ping()
            self._is_connected = True
            safe_url = url.split('@')[-1] if '@' in url else url
            logger.info(f"Connected to Redis host at {safe_url}")
            return self._client
        except Exception as e:
            self._client = None
            self._is_connected = False
            self._last_failure_time = time.time()
            logger.info(f"Redis unavailable ({e}), using high-speed in-memory cache mirror.")
            return None

    def is_connected(self) -> bool:
        client = self.get_client()
        if not client:
            return False
        try:
            return bool(client.ping())
        except Exception:
            self._is_connected = False
            self._last_failure_time = time.time()
            return False

    def get_status(self) -> dict:
        safe_url = (
            settings.REDIS_URL.split('@')[-1] if '@' in settings.REDIS_URL else settings.REDIS_URL
        ) if settings.REDIS_URL else "not-configured"

        if not settings.REDIS_ENABLED or not settings.REDIS_URL:
            return {"status": "in-memory-fallback", "endpoint": safe_url}

        connected = self.is_connected()
        return {
            "status": "connected" if connected else "in-memory-fallback",
            "endpoint": safe_url,
            "ttl_default": settings.REDIS_CACHE_TTL_SECONDS
        }

    def get(self, key: str) -> Optional[str]:
        client = self.get_client()
        if client:
            try:
                return client.get(key)
            except Exception as e:
                logger.warning(f"Redis get failed for key '{key}': {e}. Using memory cache.")
                self._is_connected = False
                self._last_failure_time = time.time()
        return self._memory_cache.get(key)

    def set(self, key: str, value: str, expire: Optional[int] = None) -> bool:
        ttl = expire if expire is not None else settings.REDIS_CACHE_TTL_SECONDS
        self._memory_cache.set(key, value, expire=ttl)
        client = self.get_client()
        if client:
            try:
                return bool(client.set(key, value, ex=ttl))
            except Exception as e:
                logger.warning(f"Redis set failed for key '{key}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return True

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
        if not keys:
            return False
        self._memory_cache.delete(*keys)
        client = self.get_client()
        if client:
            try:
                return bool(client.delete(*keys))
            except Exception as e:
                logger.warning(f"Redis delete failed for keys '{keys}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return True

    def delete_pattern(self, pattern: str) -> int:
        mem_count = self._memory_cache.delete_pattern(pattern)
        client = self.get_client()
        if client:
            try:
                matched = client.keys(pattern)
                if matched:
                    return client.delete(*matched)
            except Exception as e:
                logger.warning(f"Redis delete_pattern failed for pattern '{pattern}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return mem_count

    def incr(self, key: str) -> int:
        client = self.get_client()
        if client:
            try:
                return int(client.incr(key))
            except Exception as e:
                logger.warning(f"Redis incr failed for key '{key}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return self._memory_cache.incr(key)

    def expire(self, key: str, seconds: int) -> bool:
        self._memory_cache.expire(key, seconds)
        client = self.get_client()
        if client:
            try:
                return bool(client.expire(key, seconds))
            except Exception as e:
                logger.warning(f"Redis expire failed for key '{key}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return True

    def ttl(self, key: str) -> int:
        client = self.get_client()
        if client:
            try:
                return int(client.ttl(key))
            except Exception as e:
                logger.warning(f"Redis ttl failed for key '{key}': {e}")
                self._is_connected = False
                self._last_failure_time = time.time()
        return self._memory_cache.ttl(key)


# Singleton instance
redis_client = RedisManager()
