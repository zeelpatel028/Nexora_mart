from typing import Any


def __getattr__(name: str) -> Any:
    if name == "grocery_router":
        from ..router import router

        return router
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["grocery_router"]
