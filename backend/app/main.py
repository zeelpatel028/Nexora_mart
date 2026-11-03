import sys
from pathlib import Path

# Ensure the backend root directory is in sys.path so both 'app.*' and relative imports work reliably
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
if str(_CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(_CURRENT_DIR))

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger("nmart.api")

try:
    from .core.config import settings
    from .core.redis_client import redis_client
    from .database.connection import Base, engine, SessionLocal
    from .middleware.cors_middleware import setup_cors
    from .models import *  # Import all 18 models so Base.metadata knows about them
    from .models.user import User
    from .utils.security import get_password_hash
    from .services.seed_service import seed_categories_and_fields
    from .routes import (
        auth_router,
        store_router,
        category_router,
        product_router,
        inventory_router,
        sale_router,
        purchase_router,
        partner_router,
        finance_router,
        report_router,
        unit_router
    )
except (ImportError, ValueError):
    from app.core.config import settings
    from app.core.redis_client import redis_client
    from app.database.connection import Base, engine, SessionLocal
    from app.middleware.cors_middleware import setup_cors
    from app.models import *
    from app.models.user import User
    from app.utils.security import get_password_hash
    from app.services.seed_service import seed_categories_and_fields
    from app.routes import (
        auth_router,
        store_router,
        category_router,
        product_router,
        inventory_router,
        sale_router,
        purchase_router,
        partner_router,
        finance_router,
        report_router,
        unit_router
    )

def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed categories, category fields, units
        seed_categories_and_fields(db)

        # Seed demo user
        demo_user = db.query(User).filter(User.email == "demo@nmart.com").first()
        if not demo_user:
            demo = User(
                first_name="Alex",
                surname="Morgan",
                email="demo@nmart.com",
                phone="+1-555-0199",
                store_type="Supermarket",
                hashed_password=get_password_hash("password123"),
                is_active=True
            )
            db.add(demo)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding initial data: {e}")
    finally:
        db.close()

def initialize_database():
    try:
        Base.metadata.create_all(bind=engine)
        seed_initial_data()
    except Exception as e:
        print(f"Notice: Database connection offline or standby ({e})")

initialize_database()

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="2.0.0",
        description="Nexora All-in-One Multi-Category Store Management API"
    )

    # Setup Cross-Origin Resource Sharing
    setup_cors(app)

    # Register centralized exception handlers for production error responses
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "status_code": exc.status_code,
                "detail": exc.detail,
                "path": request.url.path,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "status_code": 422,
                "detail": "Request validation error",
                "errors": exc.errors(),
                "path": request.url.path,
            },
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
            },
        )

    # Mount API routers under /api
    app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
    app.include_router(store_router, prefix=settings.API_V1_PREFIX)
    app.include_router(category_router, prefix=settings.API_V1_PREFIX)
    app.include_router(product_router, prefix=settings.API_V1_PREFIX)
    app.include_router(inventory_router, prefix=settings.API_V1_PREFIX)
    app.include_router(sale_router, prefix=settings.API_V1_PREFIX)
    app.include_router(purchase_router, prefix=settings.API_V1_PREFIX)
    app.include_router(partner_router, prefix=settings.API_V1_PREFIX)
    app.include_router(finance_router, prefix=settings.API_V1_PREFIX)
    app.include_router(report_router, prefix=settings.API_V1_PREFIX)
    app.include_router(unit_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", tags=["Root"], operation_id="root_get")
    def root():
        """API Root & Health Check: Supports GET and HEAD requests for Render deployment health checks"""
        return {
            "status": "success",
            "message": "Nexora Mart API Running",
            "service": settings.PROJECT_NAME,
            "version": "2.0.0",
            "environment": settings.ENVIRONMENT,
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "cache": redis_client.get_status()
        }

    @app.head("/", include_in_schema=False)
    def root_head():
        """Render container health check HEAD endpoint (resolves HTTP 405 Method Not Allowed)"""
        return root()

    @app.get("/health", tags=["Health"], operation_id="health_check_get")
    def health_check():
        return {
            "status": "success",
            "message": "Nexora Mart API Healthy",
            "service": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "redis": redis_client.get_status()
        }

    @app.head("/health", include_in_schema=False)
    def health_check_head():
        return health_check()

    return app

app = create_application()

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_dev = os.environ.get("ENVIRONMENT", "development") == "development"
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)
