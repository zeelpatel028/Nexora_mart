"""Grocery Store FastAPI Routers package."""

from app.stores.grocery.router import router as grocery_router
from app.stores.grocery.dashboard_router import router as grocery_dashboard_router
from app.stores.grocery.grocery_product.router import router as grocery_product_router
from app.stores.grocery.grocery_supplier.router import router as grocery_supplier_router
from app.stores.grocery.grocery_khata_customer.router import router as grocery_customer_router
from app.stores.grocery.grocery_purchase_order.router import router as grocery_order_router
from app.stores.grocery.grocery_billing.router import router as grocery_billing_router
from app.stores.grocery.grocery_prefix.router import router as grocery_prefix_router
from app.stores.grocery.grocery_setting.router import router as grocery_setting_router
from app.stores.grocery.grocery_backup.router import router as grocery_backup_router
from app.stores.grocery.grocery_finance.router import router as grocery_finance_router
from app.stores.grocery.grocery_returns.router import router as grocery_returns_router
from app.stores.grocery.grocery_employees.router import router as grocery_employees_router

__all__ = [
    "grocery_router",
    "grocery_dashboard_router",
    "grocery_product_router",
    "grocery_supplier_router",
    "grocery_customer_router",
    "grocery_order_router",
    "grocery_billing_router",
    "grocery_prefix_router",
    "grocery_setting_router",
    "grocery_backup_router",
    "grocery_finance_router",
    "grocery_returns_router",
    "grocery_employees_router",
]
