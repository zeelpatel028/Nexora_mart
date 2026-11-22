import json
from typing import Optional
from ....config.redis import redis_client

CACHE_TTL = 1800


def invalidate_orders_cache(store_id: int):
    try:
        redis_client.delete_pattern(f"grocery:orders:{store_id}:*")
        redis_client.delete_pattern(f"grocery:suppliers:{store_id}:*")
        redis_client.delete_pattern(f"grocery:products:{store_id}:*")
    except Exception:
        pass
