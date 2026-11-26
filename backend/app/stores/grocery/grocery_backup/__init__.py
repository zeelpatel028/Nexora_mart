from typing import Any

from .models import GroceryBackup


def __getattr__(name: str) -> Any:
    if name == "router":
        from .router import router

        return router
    if name == "GroceryBackupService":
        from .service import GroceryBackupService

        return GroceryBackupService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["router", "GroceryBackup", "GroceryBackupService"]
