import sys
from pathlib import Path

# Ensure the backend root directory is in sys.path so both 'app.*' and relative imports work reliably
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
if str(_CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(_CURRENT_DIR))

from fastapi import FastAPI

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

    @app.get("/", tags=["Root"])
    def root():
        """API Directory: Lists service status and documentation URLs"""
        return {
            "service": settings.PROJECT_NAME,
            "version": "2.0.0",
            "status": "operational",
            "environment": settings.ENVIRONMENT,
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "cache": redis_client.get_status()
        }

    @app.get("/health", tags=["Health"])
    def health_check():
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "redis": redis_client.get_status()
        }

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
