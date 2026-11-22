import json
from typing import Optional
from ....config.redis import redis_client

CACHE_TTL = 3600


def get_cached_setting(store_id: int) -> Optional[dict]:
    key = f"grocery:settings:{store_id}"
    raw = redis_client.get(key)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_setting(store_id: int, data: dict):
    key = f"grocery:settings:{store_id}"
    try:
        redis_client.set(key, json.dumps(data), expire=CACHE_TTL)
    except Exception:
        pass


def invalidate_setting_cache(store_id: int):
    key = f"grocery:settings:{store_id}"
    try:
        redis_client.delete(key)
    except Exception:
        pass
