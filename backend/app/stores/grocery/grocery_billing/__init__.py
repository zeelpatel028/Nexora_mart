from typing import Any

from .models import GroceryBill, GroceryBillItem


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryBillingService":
        from .service import GroceryBillingService

        return GroceryBillingService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryBill", "GroceryBillItem", "GroceryBillingService"]
