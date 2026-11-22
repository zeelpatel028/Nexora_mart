"""
Structured Request Logging Middleware
Times requests, logs status code and duration, and avoids leaking credentials or tokens.
"""
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("nmart.api")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        path = request.url.path
        if not path.startswith("/docs") and not path.startswith("/openapi"):
            logger.info(f"HTTP {request.method} {path} - Status {response.status_code} ({duration_ms}ms)")
            
        return response
