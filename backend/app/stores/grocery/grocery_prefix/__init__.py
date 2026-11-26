from typing import Any

from .models import GroceryPrefix, GroceryIdCounter


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryPrefixService":
        from .service import GroceryPrefixService

        return GroceryPrefixService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryPrefix", "GroceryIdCounter", "GroceryPrefixService"]
