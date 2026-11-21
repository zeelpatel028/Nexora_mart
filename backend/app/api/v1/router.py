from fastapi import APIRouter
from ...routes.auth_routes import router as auth_router
from ...routes.product_routes import router as product_router
from ...routes.inventory_routes import router as inventory_router
from ...routes.finance_routes import router as finance_router
from ...routes.employee_routes import router as employee_router
from .billing_router import router as billing_router
from .orders_router import router as orders_router
from .customers_router import router as customers_router
from .suppliers_router import router as suppliers_router
from .store_prefixes_router import router as store_prefixes_router
from .settings_router import router as settings_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(product_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(suppliers_router)
api_v1_router.include_router(store_prefixes_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(employee_router)

__all__ = ["api_v1_router"]
