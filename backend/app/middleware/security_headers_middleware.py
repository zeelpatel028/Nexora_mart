from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from ..services.rate_limiter_service import RateLimiterService

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Production Security Headers Middleware (Helmet equivalent for FastAPI/Starlette).
    Injects standard security headers to protect against clickjacking, MIME-type sniffing,
    cross-site scripting (XSS), and enforces secure transport.
    Guards against Denial-of-Service via request size limiting (max 10MB) and global IP rate limiting.
    """
    MAX_REQUEST_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

    async def dispatch(self, request: Request, call_next):
        # 1. Skip global rate limiting for health and root endpoints
        path = request.url.path
        is_health = path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]

        if not is_health and not request.method == "OPTIONS":
            client_ip = request.client.host if request.client else "127.0.0.1"
            allowed, retry_after = RateLimiterService.check_global_rate_limit(client_ip)
            if not allowed:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "success": False,
                        "statusCode": 429,
                        "status_code": 429,
                        "detail": "Global rate limit exceeded (100 req/min). Please slow down.",
                        "message": "Global rate limit exceeded (100 req/min). Please slow down.",
                        "retryAfter": retry_after,
                        "path": path
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        # 2. Enforce Request Body Size Limit
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                if length > self.MAX_REQUEST_SIZE_BYTES:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "success": False,
                            "statusCode": 413,
                            "status_code": 413,
                            "detail": "Request payload exceeds the maximum allowed size (10MB).",
                            "message": "Request payload exceeds the maximum allowed size (10MB).",
                            "path": request.url.path
                        }
                    )
            except ValueError:
                pass

        # 3. Process Request
        response = await call_next(request)

        # 4. Inject Production Security Headers (Helmet Equivalent)
        headers = response.headers
        headers["X-Content-Type-Options"] = "nosniff"
        headers["X-Frame-Options"] = "DENY"
        headers["X-XSS-Protection"] = "1; mode=block"
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # Only inject Strict-Transport-Security if connection is HTTPS or behind SSL proxy
        forwarded_proto = request.headers.get("x-forwarded-proto", "")
        if request.url.scheme == "https" or forwarded_proto.lower() == "https":
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        return response

