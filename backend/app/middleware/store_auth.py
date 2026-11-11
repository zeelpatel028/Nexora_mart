from typing import Optional, List
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.store import Store
from ..models.store_user import StoreUser


class StoreContext:
    def __init__(self, store: Store, user: Optional[User] = None, role: str = "OWNER"):
        self.store = store
        self.store_id = store.id
        self.user = user
        self.user_id = user.id if user else getattr(store, "user_id", None)
        self.role = role.upper() if role else "OWNER"

    @property
    def store_type_code(self) -> str:
        if self.store.store_type_rel and self.store.store_type_rel.code:
            return self.store.store_type_rel.code.lower()
        if self.store.shop_category and self.store.shop_category.code:
            return self.store.shop_category.code.lower()
        if self.store.store_type:
            return self.store.store_type.lower()
        return "grocery"

    @property
    def can_manage_products(self) -> bool:
        return self.role in ("OWNER", "ADMIN", "MANAGER")

    @property
    def can_delete_products(self) -> bool:
        return self.role in ("OWNER", "ADMIN")

    @property
    def can_manage_pricing(self) -> bool:
        return self.role in ("OWNER", "ADMIN", "MANAGER")

    def require_permission(self, action: str):
        if action in ("create_product", "edit_product", "manage_pricing") and not self.can_manage_products:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{self.role}' does not have permission to {action.replace('_', ' ')}."
            )
        if action == "delete_product" and not self.can_delete_products:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{self.role}' does not have permission to delete products."
            )


def get_current_store_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> StoreContext:
    """
    Strict Tenant Security Resolver:
    1. Extracts authenticated user directly from JWT (never trusts client headers or body).
    2. Resolves store membership:
       - Check if user is the store owner
       - Or check if user is an active employee in store_users
    3. Blocks deactivated employees with HTTP 403.
    4. Auto-provisions primary store if new owner registration.
    """
    # 1. Check direct store ownership
    owned_store = db.query(Store).filter(Store.user_id == current_user.id, Store.is_active == True).first()
    if owned_store:
        # Check if an explicit store_user record overrides role
        su = db.query(StoreUser).filter(StoreUser.store_id == owned_store.id, StoreUser.user_id == current_user.id).first()
        role = su.role if su else "OWNER"
        return StoreContext(store=owned_store, user=current_user, role=role)

    # 2. Check store_users membership (e.g. employee / staff / manager)
    store_user = db.query(StoreUser).filter(StoreUser.user_id == current_user.id).first()
    if store_user:
        if not store_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your membership in this store has been deactivated. Access revoked."
            )
        target_store = db.query(Store).filter(Store.id == store_user.store_id, Store.is_active == True).first()
        if not target_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found or inactive."
            )
        return StoreContext(store=target_store, user=current_user, role=store_user.role)

    # 3. Auto-provision primary store if owner has none
    from ..services.store_service import StoreService
    store = StoreService.get_user_store(db, current_user)
    # Ensure store_users entry exists for owner
    existing_su = db.query(StoreUser).filter(StoreUser.store_id == store.id, StoreUser.user_id == current_user.id).first()
    if not existing_su:
        new_su = StoreUser(
            store_id=store.id,
            user_id=current_user.id,
            role="OWNER",
            is_active=True
        )
        db.add(new_su)
        db.commit()

    return StoreContext(store=store, user=current_user, role="OWNER")


def require_store_role(allowed_roles: List[str]):
    """Role-based authorization dependency factory."""
    def role_checker(ctx: StoreContext = Depends(get_current_store_context)) -> StoreContext:
        upper_roles = [r.upper() for r in allowed_roles]
        if ctx.role not in upper_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of roles: {', '.join(upper_roles)}. Current role: '{ctx.role}'."
            )
        return ctx
    return role_checker
