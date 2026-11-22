from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from .auth import get_current_user
from ..models.user import User
from ..models.store import Store
from ..models.store_user import StoreUser
from ..middleware.store_auth import StoreContext, get_current_store_context


def get_current_store(
    ctx: StoreContext = Depends(get_current_store_context)
) -> Store:
    """Dependency that returns the verified Store model for the active user session."""
    return ctx.store


def verify_store_access(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Store:
    """
    Validates that the authenticated user owns or is an active employee of the requested store_id.
    Prevents cross-tenant parameter tampering.
    """
    # 1. Direct owner check
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.user_id == current_user.id,
        Store.is_active == True
    ).first()
    if store:
        return store

    # 2. Store user / employee check
    su = db.query(StoreUser).filter(
        StoreUser.store_id == store_id,
        StoreUser.user_id == current_user.id,
        StoreUser.is_active == True
    ).first()
    if su:
        store = db.query(Store).filter(Store.id == store_id, Store.is_active == True).first()
        if store:
            return store

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access data for this store."
    )


__all__ = ["get_current_store", "verify_store_access", "get_current_store_context", "StoreContext"]
