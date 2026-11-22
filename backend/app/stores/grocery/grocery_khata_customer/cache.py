import json
from typing import Optional
from ....config.redis import redis_client

CACHE_TTL = 1800


def get_cached_customers(store_id: int, query_hash: str) -> Optional[dict]:
    key = f"grocery:customers:{store_id}:{query_hash}"
    raw = redis_client.get(key)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_customers(store_id: int, query_hash: str, data: dict):
    key = f"grocery:customers:{store_id}:{query_hash}"
    try:
        redis_client.set(key, json.dumps(data), expire=CACHE_TTL)
    except Exception:
        pass


def invalidate_customers_cache(store_id: int):
    try:
        redis_client.delete_pattern(f"grocery:customers:{store_id}:*")
        redis_client.delete_pattern(f"grocery:bills:{store_id}:*")
    except Exception:
        pass
