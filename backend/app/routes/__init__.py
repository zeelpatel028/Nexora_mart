from .auth_routes import router as auth_router
from .store_type_routes import router as store_type_router
from .store_routes import router as store_router
from .category_routes import router as category_router
from .brand_routes import router as brand_router
from .product_routes import router as product_router
from .inventory_routes import router as inventory_router
from .sale_routes import router as sale_router
from .bill_routes import router as bill_router
from .order_routes import router as order_router
from .purchase_routes import router as purchase_router
from .partner_routes import router as partner_router
from .finance_routes import router as finance_router
from .report_routes import router as report_router
from .account_routes import router as account_router
from .unit_routes import router as unit_router
from .employee_routes import router as employee_router
from .return_routes import router as return_router

from .clothing_product_routes import router as clothing_product_router
from .agro_product_routes import router as agro_product_router
from .medical_product_routes import router as medical_product_router
from .grocery_product_routes import router as grocery_product_router
from .electronics_product_routes import router as electronics_product_router
from .plastic_product_routes import router as plastic_product_router
from .handloom_product_routes import router as handloom_product_router
from .furniture_product_routes import router as furniture_product_router
from .common_product_routes import router as common_product_router

__all__ = [
    "auth_router",
    "store_type_router",
    "store_router",
    "category_router",
    "brand_router",
    "product_router",
    "clothing_product_router",
    "agro_product_router",
    "medical_product_router",
    "grocery_product_router",
    "electronics_product_router",
    "plastic_product_router",
    "handloom_product_router",
    "furniture_product_router",
    "common_product_router",
    "inventory_router",
    "sale_router",
    "bill_router",
    "order_router",
    "purchase_router",
    "partner_router",
    "finance_router",
    "report_router",
    "account_router",
    "unit_router",
    "employee_router",
    "return_router",
]
