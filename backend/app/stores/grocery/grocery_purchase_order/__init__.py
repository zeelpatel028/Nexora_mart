from typing import Any

from .models import GroceryPurchaseOrder


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryPurchaseOrderService":
        from .service import GroceryPurchaseOrderService

        return GroceryPurchaseOrderService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryPurchaseOrder", "GroceryPurchaseOrderService"]
