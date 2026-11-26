from typing import Any

from .models import GroceryGSTRate, GroceryUnit


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryLookupService":
        from .service import GroceryLookupService

        return GroceryLookupService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryGSTRate", "GroceryUnit", "GroceryLookupService"]
