import os
import sys
import threading
from pathlib import Path

# Ensure the backend root directory is in sys.path so 'app.*' imports work reliably
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
if str(_CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(_CURRENT_DIR))

from contextlib import asynccontextmanager
import logging
import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.gzip import GZipMiddleware
from sqlalchemy import inspect, text

logger = logging.getLogger("nmart.api")

from app.core.config import settings
from app.core.redis_client import redis_client
from app.database.connection import Base, engine, SessionLocal
from app.middleware.cors_middleware import setup_cors
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.security_headers_middleware import SecurityHeadersMiddleware
from app.models import *  # Import all models so Base.metadata knows about them
from app.models.user import User
from app.utils.security import get_password_hash
from app.services.seed_service import seed_categories_and_fields
from app.routes import (
    auth_router,
    store_type_router,
    store_router,
    category_router,
    brand_router,
    product_router,
    clothing_product_router,
    agro_product_router,
    medical_product_router,
    electronics_product_router,
    plastic_product_router,
    handloom_product_router,
    furniture_product_router,
    common_product_router,
    inventory_router,
    sale_router,
    bill_router,
    order_router,
    purchase_router,
    partner_router,
    finance_router,
    report_router,
    account_router,
    unit_router,
    employee_router,
    return_router,
    cart_router,
    wishlist_router
)
from app.api.v1.billing_router import router as v1_billing_router
from app.api.v1.orders_router import router as v1_orders_router
from app.api.v1.customers_router import router as v1_customers_router
from app.api.v1.suppliers_router import router as v1_suppliers_router
from app.api.v1.store_prefixes_router import router as v1_store_prefixes_router
from app.api.v1.settings_router import router as v1_settings_router
from app.stores.grocery.router import router as grocery_v1_router


def run_db_migrations():
    """
    Automatically applies pending Alembic database migrations on startup.
    Guarantees schema synchronization for production deployments (Render, Docker, local).
    """
    try:
        from alembic.config import Config
        from alembic import command
        alembic_ini = _BACKEND_DIR / "alembic.ini"
        if alembic_ini.exists():
            alembic_cfg = Config(str(alembic_ini))
            alembic_cfg.set_main_option("script_location", str(_BACKEND_DIR / "alembic"))
            logger.info("Applying pending Alembic database migrations...")
            command.upgrade(alembic_cfg, "head")
            logger.info("Alembic database migrations up to date.")
    except Exception as e:
        logger.warning(f"Notice: Automatic migration runner encountered ({e})")
    try:
        from app.migrations import ensure_grocery_schema
        ensure_grocery_schema(engine)
    except Exception as e:
        logger.warning(f"Notice: Grocery schema sync encountered ({e})")


def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed standardized categories, category fields, units
        seed_categories_and_fields(db)

        # Seed or sync demo user (only when explicitly enabled or in development mode)
        if settings.SEED_DEMO_DATA or settings.is_dev:
            demo_user = db.query(User).filter(User.email == "demo@nmart.com").first()
            if not demo_user:
                demo = User(
                    first_name="Alex",
                    surname="Morgan",
                    email="demo@nmart.com",
                    phone="+1-555-0199",
                    store_type="Grocery Store",
                    shop_category="Grocery Store",
                    shop_category_id=1,
                    hashed_password=get_password_hash("password123"),
                    is_active=True
                )
                db.add(demo)
                db.commit()
            else:
                updated = False
                if not demo_user.shop_category:
                    demo_user.shop_category = "Grocery Store"
                    updated = True
                if not demo_user.shop_category_id:
                    demo_user.shop_category_id = 1
                    updated = True
                if updated:
                    db.commit()

        # Seed 14-day demo data ONLY for empty Grocery stores
        from app.models.store import Store
        from app.stores.grocery.seed_demo import is_grocery_store, seed_grocery_14_days_demo
        active_stores = db.query(Store).filter(Store.is_active == True).all()
        for gs in active_stores:
            if is_grocery_store(gs):
                seed_grocery_14_days_demo(db, gs)
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial data: {e}", exc_info=True)
    finally:
        db.close()


def initialize_database():
    try:
        # Never use create_all as a replacement for Alembic on populated production DBs
        if engine.dialect.name == "sqlite" or not inspect(engine).has_table("users"):
            Base.metadata.create_all(bind=engine)
        seed_initial_data()
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Run initial seeding in a background daemon thread so Uvicorn binds $PORT immediately
    threading.Thread(target=initialize_database, name="startup-seed", daemon=True).start()
    yield


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="2.0.0",
        description="Tulsi Mart All-in-One Multi-Category Store Management API",
        lifespan=lifespan,
    )

    # Setup Cross-Origin Resource Sharing
    setup_cors(app)

    # Global sliding-window rate limiter backed by Redis with in-memory fallback
    app.add_middleware(RateLimiterMiddleware, max_requests=settings.GLOBAL_RATE_LIMIT_PER_MINUTE, window_seconds=60)

    # Starlette GZip compression for high-performance payload delivery
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Setup Helmet-equivalent Security Headers and Request Size Limit Protection
    app.add_middleware(SecurityHeadersMiddleware)

    # Structured request logging without exposing sensitive tokens or credentials
    @app.middleware("http")
    async def request_logging_middleware(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        # Exclude passwords and authorization tokens from logs
        if not request.url.path.startswith("/docs") and not request.url.path.startswith("/openapi"):
            logger.info(f"HTTP {request.method} {request.url.path} - Status {response.status_code} ({duration_ms}ms)")
        return response

    # Register centralized exception handlers for production error responses
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

        # If 429 Too Many Requests, extract and propagate retry-after duration
        if exc.status_code == 429:
            retry_header = headers.get("Retry-After") or headers.get("retry-after") or "300"
            try:
                content["retryAfter"] = int(retry_header)
            except Exception:
                content["retryAfter"] = 300

        return JSONResponse(
            status_code=exc.status_code,
            content=content,
            headers=headers
        )

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
        origin = request.headers.get("origin")
        cors_hdrs = {
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "detail": "Server response validation error",
                "errors": [str(e) for e in exc.errors()],
                "path": request.url.path,
            },
            headers=cors_hdrs
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
        origin = request.headers.get("origin")
        cors_hdrs = {
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "detail": "Internal server error occurred",
                "path": request.url.path,
            },
            headers=cors_hdrs
        )

    # Mount API routers under /api and /api/v1
    # Note: v1_* routers are mounted before legacy partner/order routers so
    # static routes like /customers/dashboard and /suppliers/dashboard match before /{id}.
    all_routers = [
        auth_router,
        store_type_router,
        store_router,
        category_router,
        brand_router,
        product_router,
        clothing_product_router,
        agro_product_router,
        medical_product_router,
        electronics_product_router,
        plastic_product_router,
        handloom_product_router,
        furniture_product_router,
        common_product_router,
        inventory_router,
        sale_router,
        bill_router,
        v1_billing_router,
        v1_orders_router,
        v1_customers_router,
        v1_suppliers_router,
        v1_store_prefixes_router,
        v1_settings_router,
        order_router,
        purchase_router,
        partner_router,
        finance_router,
        report_router,
        account_router,
        unit_router,
        employee_router,
        return_router,
        cart_router,
        wishlist_router,
    ]
    for r in all_routers:
        app.include_router(r, prefix=settings.API_V1_PREFIX)
        if settings.API_V1_PREFIX != "/api/v1":
            app.include_router(r, prefix="/api/v1")

    # Store-Wise V1 Grocery Modular Sub-Application
    app.include_router(grocery_v1_router, prefix="/api/v1/grocery")
    app.include_router(grocery_v1_router, prefix="/api/grocery")

    @app.get("/", tags=["Root"], operation_id="root_get")
    def root():
        """API Root & Health Check: Supports GET and HEAD requests for Render deployment health checks"""
        return {
            "status": "success",
            "message": "Tulsi Mart API Running",
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
        db_ok = False
        db_dialect = engine.dialect.name
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_ok = True
        except Exception:
            db_ok = False
        return {
            "status": "success" if db_ok else "degraded",
            "message": "Tulsi Mart API Healthy" if db_ok else "Tulsi Mart API Degraded",
            "service": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "database": {"connected": db_ok, "dialect": db_dialect},
            "redis": redis_client.get_status()
        }

    @app.head("/health", include_in_schema=False)
    def health_check_head():
        return health_check()

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", settings.HOST),
        port=int(os.getenv("PORT", settings.PORT)),
        reload=settings.is_dev
    )
