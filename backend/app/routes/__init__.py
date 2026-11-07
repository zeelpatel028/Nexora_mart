from .auth_routes import router as auth_router
from .store_routes import router as store_router
from .category_routes import router as category_router
from .product_routes import router as product_router
from .inventory_routes import router as inventory_router
from .sale_routes import router as sale_router
from .purchase_routes import router as purchase_router
from .partner_routes import router as partner_router
from .finance_routes import router as finance_router
from .report_routes import router as report_router
from .unit_routes import router as unit_router
from .employee_routes import router as employee_router

__all__ = [
    "auth_router",
    "store_router",
    "category_router",
    "product_router",
    "inventory_router",
    "sale_router",
    "purchase_router",
    "partner_router",
    "finance_router",
    "report_router",
    "unit_router",
    "employee_router",
]
