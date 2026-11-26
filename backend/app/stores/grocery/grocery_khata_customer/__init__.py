from typing import Any

from .models import GroceryCustomer


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryKhataCustomerService":
        from .service import GroceryKhataCustomerService

        return GroceryKhataCustomerService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryCustomer", "GroceryKhataCustomerService"]
