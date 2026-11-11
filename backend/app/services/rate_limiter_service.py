import time
import threading
from typing import Tuple, Dict, List
from ..core.redis_client import redis_client
from ..core.config import settings

class RateLimiterService:
    """
    Production-grade Login Rate Limiter.
    Enforces maximum 5 login requests per email within a 5-minute (300s) sliding window.
    Also enforces IP-based brute-force protection (maximum 20 requests per IP in 5 minutes).
    Uses Redis when connected, with an in-memory thread-safe sliding window fallback.
    """
    MAX_EMAIL_ATTEMPTS = 5
    EMAIL_WINDOW_SECONDS = 300  # 5 minutes

    MAX_IP_ATTEMPTS = 20
    IP_WINDOW_SECONDS = 300     # 5 minutes

    _lock = threading.Lock()
    _in_memory_email_attempts: Dict[str, List[float]] = {}
    _in_memory_ip_attempts: Dict[str, List[float]] = {}

    @classmethod
    def check_login_rate_limit(cls, email: str, client_ip: str = "127.0.0.1") -> Tuple[bool, int]:
        """
        Check whether the login attempt is allowed.
        Returns:
            (is_allowed: bool, retry_after_seconds: int)
        """
        norm_email = email.strip().lower()
        norm_ip = client_ip.strip() if client_ip else "127.0.0.1"
        now = time.time()

        # 1. Try Redis first if connected
        redis = redis_client.get_client()
        if redis:
            try:
                email_key = f"rate:login:email:{norm_email}"
                ip_key = f"rate:login:ip:{norm_ip}"

                # Check email attempts
                email_count = redis.get(email_key)
                if email_count is not None and int(email_count) >= cls.MAX_EMAIL_ATTEMPTS:
                    ttl = redis.ttl(email_key)
                    retry_after = max(1, ttl if ttl > 0 else cls.EMAIL_WINDOW_SECONDS)
                    return False, retry_after

                # Check IP attempts
                ip_count = redis.get(ip_key)
                if ip_count is not None and int(ip_count) >= cls.MAX_IP_ATTEMPTS:
                    ttl = redis.ttl(ip_key)
                    retry_after = max(1, ttl if ttl > 0 else cls.IP_WINDOW_SECONDS)
                    return False, retry_after

                # Increment counts
                pipe = redis.pipeline()
                pipe.incr(email_key)
                pipe.expire(email_key, cls.EMAIL_WINDOW_SECONDS)
                pipe.incr(ip_key)
                pipe.expire(ip_key, cls.IP_WINDOW_SECONDS)
                results = pipe.execute()

                new_email_count = results[0]
                if new_email_count > cls.MAX_EMAIL_ATTEMPTS:
                    ttl = redis.ttl(email_key)
                    retry_after = max(1, ttl if ttl > 0 else cls.EMAIL_WINDOW_SECONDS)
                    return False, retry_after

                return True, 0
            except Exception:
                # Redis failure: seamlessly fall back to in-memory sliding window
                pass

        # 2. In-Memory Thread-Safe Sliding Window Fallback
        with cls._lock:
            # Clean expired email attempts
            if norm_email in cls._in_memory_email_attempts:
                cls._in_memory_email_attempts[norm_email] = [
                    t for t in cls._in_memory_email_attempts[norm_email]
                    if (now - t) < cls.EMAIL_WINDOW_SECONDS
                ]
            else:
                cls._in_memory_email_attempts[norm_email] = []

            # Clean expired IP attempts
            if norm_ip in cls._in_memory_ip_attempts:
                cls._in_memory_ip_attempts[norm_ip] = [
                    t for t in cls._in_memory_ip_attempts[norm_ip]
                    if (now - t) < cls.IP_WINDOW_SECONDS
                ]
            else:
                cls._in_memory_ip_attempts[norm_ip] = []

            # Check email limit
            email_history = cls._in_memory_email_attempts[norm_email]
            if len(email_history) >= cls.MAX_EMAIL_ATTEMPTS:
                oldest_attempt = min(email_history)
                elapsed = now - oldest_attempt
                retry_after = max(1, int(cls.EMAIL_WINDOW_SECONDS - elapsed))
                return False, retry_after

            # Check IP limit
            ip_history = cls._in_memory_ip_attempts[norm_ip]
            if len(ip_history) >= cls.MAX_IP_ATTEMPTS:
                oldest_attempt = min(ip_history)
                elapsed = now - oldest_attempt
                retry_after = max(1, int(cls.IP_WINDOW_SECONDS - elapsed))
                return False, retry_after

            # Record this attempt
            cls._in_memory_email_attempts[norm_email].append(now)
            cls._in_memory_ip_attempts[norm_ip].append(now)

            return True, 0

    @classmethod
    def clear_login_rate_limit(cls, email: str, client_ip: str = "127.0.0.1") -> None:
        """
        Clears the rate limit counters upon successful login.
        Ensures legitimate authenticated users are never blocked on subsequent visits.
        """
        norm_email = email.strip().lower()
        norm_ip = client_ip.strip() if client_ip else "127.0.0.1"

        redis = redis_client.get_client()
        if redis:
            try:
                redis.delete(f"rate:login:email:{norm_email}")
            except Exception:
                pass

        with cls._lock:
            cls._in_memory_email_attempts.pop(norm_email, None)

    @classmethod
    def reset_all(cls) -> None:
        """Testing utility to clear all in-memory rate limiting counters"""
        with cls._lock:
            cls._in_memory_email_attempts.clear()
            cls._in_memory_ip_attempts.clear()

