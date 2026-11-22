import json
from typing import Dict, Optional
from ....config.redis import redis_client

CACHE_TTL = 3600


def get_cached_prefixes(store_id: int) -> Optional[Dict[str, str]]:
    key = f"grocery:prefixes:{store_id}"
    raw = redis_client.get(key)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_prefixes(store_id: int, prefixes: Dict[str, str]):
    key = f"grocery:prefixes:{store_id}"
    try:
        redis_client.set(key, json.dumps(prefixes), expire=CACHE_TTL)
    except Exception:
        pass


def invalidate_prefixes_cache(store_id: int):
    key = f"grocery:prefixes:{store_id}"
    try:
        redis_client.delete(key)
    except Exception:
        pass
