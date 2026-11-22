import json
from typing import Optional, Dict, Any
from ....config.redis import redis_client

CACHE_TTL = 1800


def get_cached_products(store_id: int, query_hash: str) -> Optional[dict]:
    key = f"grocery:products:{store_id}:{query_hash}"
    raw = redis_client.get(key)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_products(store_id: int, query_hash: str, data: dict):
    key = f"grocery:products:{store_id}:{query_hash}"
    try:
        redis_client.set(key, json.dumps(data), expire=CACHE_TTL)
    except Exception:
        pass


def invalidate_products_cache(store_id: int):
    pattern = f"grocery:products:{store_id}:*"
    try:
        redis_client.delete_pattern(pattern)
    except Exception:
        pass
