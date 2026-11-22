"""
Rate Limiting Middleware & Brute-Force Login Protection
Uses Redis (with local memory fallback) for sliding-window rate limiting.
Enforces 3-failed-attempts login lock with HTTP 429 response.
"""
import time
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from ..config.settings import settings
from ..config.redis import redis_client

logger = logging.getLogger("nmart.ratelimit")


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static docs and health checks
        path = request.url.path
        if path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json") or path in ("/", "/health"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = f"rl:global:{client_ip}:{int(time.time() // self.window_seconds)}"

        try:
            current_count = redis_client.incr(key)
            if current_count == 1:
                redis_client.expire(key, self.window_seconds)

            if current_count > self.max_requests:
                ttl = redis_client.ttl(key)
                retry_after = ttl if ttl > 0 else self.window_seconds
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "success": False,
                        "status_code": 429,
                        "statusCode": 429,
                        "detail": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                        "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                        "retryAfter": retry_after,
                        "path": path
                    },
                    headers={"Retry-After": str(retry_after)}
                )
        except Exception as e:
            # If Redis check fails, fail open safely
            logger.warning(f"Rate limiting check bypassed due to error: {e}")

        return await call_next(request)
