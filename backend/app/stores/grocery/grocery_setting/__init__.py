from typing import Any

from .models import GrocerySetting


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GrocerySettingService":
        from .service import GrocerySettingService

        return GrocerySettingService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GrocerySetting", "GrocerySettingService"]
