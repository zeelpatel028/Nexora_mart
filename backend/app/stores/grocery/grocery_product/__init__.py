from typing import Any

from .models import GroceryProduct, GroceryProductBatch, GroceryStockMovement


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryProductService":
        from .service import GroceryProductService

        return GroceryProductService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "router",
    "GroceryProduct",
    "GroceryProductBatch",
    "GroceryStockMovement",
    "GroceryProductService",
]
