"""
Centralized Error Handlers for FastAPI
Formats HTTP exceptions, Pydantic validation errors, and 500 server errors into standard JSON.
"""
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("nmart.error_handler")


def register_error_handlers(app: FastAPI):
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        headers = dict(exc.headers) if exc.headers else {}
        origin = request.headers.get("origin")
        if origin:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"

        content = {
            "success": False,
            "status_code": exc.status_code,
            "statusCode": exc.status_code,
            "detail": exc.detail,
            "message": exc.detail if isinstance(exc.detail, str) else "Request error",
            "path": request.url.path,
        }

        if exc.status_code == 429:
            retry_header = headers.get("Retry-After") or headers.get("retry-after") or "300"
            try:
                content["retryAfter"] = int(retry_header)
            except Exception:
                content["retryAfter"] = 300

        return JSONResponse(status_code=exc.status_code, content=content, headers=headers)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        first_error_msg = "Request validation error"
        if exc.errors():
            first_err = exc.errors()[0]
            loc = " -> ".join([str(l) for l in first_err.get("loc", []) if l != "body"])
            msg = first_err.get("msg", "Invalid value")
            first_error_msg = f"{loc}: {msg}" if loc else msg

        origin = request.headers.get("origin")
        cors_hdrs = {}
        if origin:
            cors_hdrs["Access-Control-Allow-Origin"] = origin
            cors_hdrs["Access-Control-Allow-Credentials"] = "true"

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "status_code": 422,
                "statusCode": 422,
                "detail": first_error_msg,
                "message": first_error_msg,
                "errors": exc.errors(),
                "path": request.url.path,
            },
            headers=cors_hdrs
        )

    @app.exception_handler(ResponseValidationError)
    async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
        logger.error(f"Response validation error on {request.method} {request.url.path}: {exc.errors()}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "detail": "Server response validation error",
                "errors": [str(e) for e in exc.errors()],
                "path": request.url.path,
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "detail": "Internal server error occurred",
                "path": request.url.path,
            }
        )
