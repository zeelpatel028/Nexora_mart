from typing import Optional
from fastapi import HTTPException, status
from ..models.user import User
from ..models.store import Store

def check_store_access(user: User, store: Optional[Store]) -> bool:
    """
    Enforce strict tenant data isolation.
    Validates that the authenticated user owns or is authorized to access the requested store.
    """
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found."
        )
    if store.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to access or modify this store's records."
        )
    return True
