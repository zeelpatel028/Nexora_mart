"""
Grocery Store Sub-Application Central Router
Mounts all grocery features under /api/v1/grocery:
- /products (grocery_product)
- /suppliers (grocery_supplier)
- /orders (grocery_purchase_order)
- /billing (grocery_billing)
- /customers (grocery_khata_customer)
- /prefixes (grocery_prefix)
- /settings (grocery_setting)
- /backup (grocery_backup)
- /lookup (grocery_lookup)
- /dashboard (dashboard & reports)
"""
from fastapi import APIRouter
from .grocery_product.router import router as product_router
from .grocery_supplier.router import router as supplier_router
from .grocery_purchase_order.router import router as purchase_order_router
from .grocery_billing.router import router as billing_router
from .grocery_khata_customer.router import router as customer_router
from .grocery_prefix.router import router as prefix_router
from .grocery_setting.router import router as setting_router
from .grocery_backup.router import router as backup_router
from .grocery_lookup.router import router as lookup_router
from .grocery_finance.router import router as finance_router
from .grocery_returns.router import router as returns_router
from .grocery_employees.router import router as employees_router
from .dashboard_router import router as dashboard_router

router = APIRouter()

router.include_router(product_router)
router.include_router(supplier_router)
router.include_router(purchase_order_router)
router.include_router(billing_router)
router.include_router(customer_router)
router.include_router(prefix_router)
router.include_router(setting_router)
router.include_router(backup_router)
router.include_router(lookup_router)
router.include_router(finance_router)
router.include_router(returns_router)
router.include_router(employees_router)
router.include_router(dashboard_router)
