from typing import Any

from .models import GrocerySupplier


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GrocerySupplierService":
        from .service import GrocerySupplierService

        return GrocerySupplierService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GrocerySupplier", "GrocerySupplierService"]
