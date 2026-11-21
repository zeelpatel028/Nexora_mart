import time
import threading
from typing import Tuple, Dict, List, Optional
from ..core.redis_client import redis_client
from ..core.config import settings

class RateLimiterService:
    """
    Tulsi Mart Enterprise-Grade Rate Limiting & Brute-Force Defense Service.
    Enforces:
    1. Maximum 3 failed login attempts per email + IP.
    2. 15-minute (900 seconds) lockout with remaining time calculation after 3 wrong attempts.
    3. Global IP rate limiter: 100 requests per minute.
    4. Strict rate limiting for password reset and OTP endpoints.
    5. Seamless high-speed thread-safe in-memory fallback when Redis is offline.
    """
    MAX_FAILED_LOGIN_ATTEMPTS = settings.LOGIN_MAX_FAILED_ATTEMPTS  # 3
    LOGIN_LOCKOUT_SECONDS = settings.LOGIN_LOCKOUT_SECONDS          # 900s (15 min)
    GLOBAL_RATE_LIMIT_PER_MINUTE = settings.GLOBAL_RATE_LIMIT_PER_MINUTE  # 100

    _lock = threading.Lock()
    _in_memory_failed_attempts: Dict[str, List[float]] = {}
    _in_memory_global_requests: Dict[str, List[float]] = {}
    _in_memory_endpoint_requests: Dict[str, List[float]] = {}

    @classmethod
    def _get_login_keys(cls, email: str, client_ip: str) -> Tuple[str, str]:
        norm_email = email.strip().lower()
        norm_ip = client_ip.strip() if client_ip else "127.0.0.1"
        return f"tulsimart:login:failed:email:{norm_email}", f"tulsimart:login:failed:ip:{norm_ip}"

    @classmethod
    def check_login_lockout(cls, email: str, client_ip: str = "127.0.0.1") -> Tuple[bool, int, int]:
        """
        Check if the email or IP is currently locked out from logging in.
        Returns:
            (is_locked: bool, remaining_lock_seconds: int, current_failed_count: int)
        """
        email_key, ip_key = cls._get_login_keys(email, client_ip)
        norm_email = email.strip().lower()
        now = time.time()

        # 1. Check Redis first if enabled
        redis = redis_client.get_client()
        if redis:
            try:
                email_count = redis.get(email_key)
                ip_count = redis.get(ip_key)
                
                count_val = 0
                if email_count is not None:
                    count_val = max(count_val, int(email_count))
                if ip_count is not None:
                    count_val = max(count_val, int(ip_count))

                if count_val >= cls.MAX_FAILED_LOGIN_ATTEMPTS:
                    ttl_email = redis.ttl(email_key)
                    ttl_ip = redis.ttl(ip_key)
                    max_ttl = max(ttl_email, ttl_ip)
                    rem = max(1, max_ttl if max_ttl > 0 else cls.LOGIN_LOCKOUT_SECONDS)
                    return True, rem, count_val

                return False, 0, count_val
            except Exception:
                pass

        # 2. In-Memory Fallback
        with cls._lock:
            history = cls._in_memory_failed_attempts.get(norm_email, [])
            valid_history = [t for t in history if (now - t) < cls.LOGIN_LOCKOUT_SECONDS]
            cls._in_memory_failed_attempts[norm_email] = valid_history

            count_val = len(valid_history)
            if count_val >= cls.MAX_FAILED_LOGIN_ATTEMPTS:
                oldest_relevant = min(valid_history)
                elapsed = int(now - oldest_relevant)
                rem = max(1, cls.LOGIN_LOCKOUT_SECONDS - elapsed)
                return True, rem, count_val

            return False, 0, count_val

    @classmethod
    def record_failed_login(cls, email: str, client_ip: str = "127.0.0.1") -> Tuple[int, int, int]:
        """
        Record a failed login attempt for the email and IP.
        Returns:
            (new_failed_count: int, attempts_left: int, lock_seconds: int)
        """
        email_key, ip_key = cls._get_login_keys(email, client_ip)
        norm_email = email.strip().lower()
        now = time.time()

        # 1. Try Redis
        redis = redis_client.get_client()
        if redis:
            try:
                pipe = redis.pipeline()
                pipe.incr(email_key)
                pipe.expire(email_key, cls.LOGIN_LOCKOUT_SECONDS)
                pipe.incr(ip_key)
                pipe.expire(ip_key, cls.LOGIN_LOCKOUT_SECONDS)
                res = pipe.execute()

                new_count = max(res[0], res[2])
                attempts_left = max(0, cls.MAX_FAILED_LOGIN_ATTEMPTS - new_count)
                lock_seconds = cls.LOGIN_LOCKOUT_SECONDS if new_count >= cls.MAX_FAILED_LOGIN_ATTEMPTS else 0
                return new_count, attempts_left, lock_seconds
            except Exception:
                pass

        # 2. In-Memory Fallback
        with cls._lock:
            history = cls._in_memory_failed_attempts.get(norm_email, [])
            valid_history = [t for t in history if (now - t) < cls.LOGIN_LOCKOUT_SECONDS]
            valid_history.append(now)
            cls._in_memory_failed_attempts[norm_email] = valid_history

            new_count = len(valid_history)
            attempts_left = max(0, cls.MAX_FAILED_LOGIN_ATTEMPTS - new_count)
            lock_seconds = cls.LOGIN_LOCKOUT_SECONDS if new_count >= cls.MAX_FAILED_LOGIN_ATTEMPTS else 0
            return new_count, attempts_left, lock_seconds

    @classmethod
    def clear_failed_logins(cls, email: str, client_ip: str = "127.0.0.1") -> None:
        """
        Reset failed login counter on successful authentication.
        """
        email_key, ip_key = cls._get_login_keys(email, client_ip)
        norm_email = email.strip().lower()

        redis = redis_client.get_client()
        if redis:
            try:
                redis.delete(email_key, ip_key)
            except Exception:
                pass

        with cls._lock:
            cls._in_memory_failed_attempts.pop(norm_email, None)

    @classmethod
    def check_global_rate_limit(cls, client_ip: str = "127.0.0.1") -> Tuple[bool, int]:
        """
        Global rate limiter: max 100 requests/min per IP.
        Returns:
            (is_allowed: bool, retry_after_seconds: int)
        """
        norm_ip = client_ip.strip() if client_ip else "127.0.0.1"
        key = f"tulsimart:ratelimit:global:{norm_ip}"
        now = time.time()
        window = 60

        redis = redis_client.get_client()
        if redis:
            try:
                curr = redis.get(key)
                if curr is not None and int(curr) >= cls.GLOBAL_RATE_LIMIT_PER_MINUTE:
                    ttl = redis.ttl(key)
                    return False, max(1, ttl if ttl > 0 else window)

                pipe = redis.pipeline()
                pipe.incr(key)
                pipe.expire(key, window)
                res = pipe.execute()
                if res[0] > cls.GLOBAL_RATE_LIMIT_PER_MINUTE:
                    ttl = redis.ttl(key)
                    return False, max(1, ttl if ttl > 0 else window)
                return True, 0
            except Exception:
                pass

        with cls._lock:
            history = cls._in_memory_global_requests.get(norm_ip, [])
            valid_history = [t for t in history if (now - t) < window]
            if len(valid_history) >= cls.GLOBAL_RATE_LIMIT_PER_MINUTE:
                oldest = min(valid_history)
                rem = max(1, int(window - (now - oldest)))
                return False, rem
            valid_history.append(now)
            cls._in_memory_global_requests[norm_ip] = valid_history
            return True, 0

    @classmethod
    def check_endpoint_rate_limit(
        cls,
        endpoint_key: str,
        client_ip: str = "127.0.0.1",
        max_requests: int = 10,
        window_seconds: int = 60
    ) -> Tuple[bool, int]:
        """
        Strict rate limiting for sensitive endpoints (e.g. register, forgot-password).
        """
        norm_ip = client_ip.strip() if client_ip else "127.0.0.1"
        key = f"tulsimart:ratelimit:{endpoint_key}:{norm_ip}"
        now = time.time()

        redis = redis_client.get_client()
        if redis:
            try:
                curr = redis.get(key)
                if curr is not None and int(curr) >= max_requests:
                    ttl = redis.ttl(key)
                    return False, max(1, ttl if ttl > 0 else window_seconds)

                pipe = redis.pipeline()
                pipe.incr(key)
                pipe.expire(key, window_seconds)
                res = pipe.execute()
                if res[0] > max_requests:
                    ttl = redis.ttl(key)
                    return False, max(1, ttl if ttl > 0 else window_seconds)
                return True, 0
            except Exception:
                pass

        with cls._lock:
            k = f"{endpoint_key}:{norm_ip}"
            history = cls._in_memory_endpoint_requests.get(k, [])
            valid_history = [t for t in history if (now - t) < window_seconds]
            if len(valid_history) >= max_requests:
                oldest = min(valid_history)
                rem = max(1, int(window_seconds - (now - oldest)))
                return False, rem
            valid_history.append(now)
            cls._in_memory_endpoint_requests[k] = valid_history
            return True, 0

    @classmethod
    def reset_all(cls) -> None:
        """Testing utility to clear all failed attempt counters and rate limits"""
        with cls._lock:
            cls._in_memory_failed_attempts.clear()
            cls._in_memory_global_requests.clear()
            cls._in_memory_endpoint_requests.clear()
