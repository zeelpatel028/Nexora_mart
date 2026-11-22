import json
from typing import List, Optional
from ....config.redis import redis_client

GST_RATES_CACHE_KEY = "grocery:lookup:gst_rates"
UNITS_CACHE_KEY = "grocery:lookup:units"
CACHE_TTL = 86400  # 24 hours


def get_cached_gst_rates() -> Optional[List[dict]]:
    raw = redis_client.get(GST_RATES_CACHE_KEY)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_gst_rates(data: List[dict]):
    try:
        redis_client.set(GST_RATES_CACHE_KEY, json.dumps(data), expire=CACHE_TTL)
    except Exception:
        pass


def get_cached_units() -> Optional[List[dict]]:
    raw = redis_client.get(UNITS_CACHE_KEY)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_cached_units(data: List[dict]):
    try:
        redis_client.set(UNITS_CACHE_KEY, json.dumps(data), expire=CACHE_TTL)
    except Exception:
        pass


def invalidate_lookup_cache():
    try:
        redis_client.delete(GST_RATES_CACHE_KEY, UNITS_CACHE_KEY)
    except Exception:
        pass
