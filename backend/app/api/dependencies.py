from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.user import User
from ..models.store import Store

def get_current_store(
    ctx: StoreContext = Depends(get_current_store_context)
) -> Store:
    """Dependency that returns the authenticated user's verified Store model instance."""
    return ctx.store

__all__ = [
    "get_db",
    "get_current_user",
    "get_current_store",
    "get_current_store_context",
    "StoreContext"
]
