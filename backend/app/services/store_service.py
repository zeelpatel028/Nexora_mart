from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.store import Store
from ..models.user import User
from ..models.category import Category

class StoreService:
    @staticmethod
    def get_user_store(db: Session, user: User) -> Store:
        """
        Retrieves the primary active store for the authenticated user.
        If user has store_id, fetch that store.
        If user is owner of a store, fetch their store.
        If no store exists, automatically creates one matching their user.store_type.
        """
        store = None
        if user.store_id:
            store = db.query(Store).filter(Store.id == user.store_id, Store.is_active == True).first()

        if not store:
            store = db.query(Store).filter(Store.owner_id == user.id, Store.is_active == True).first()

        if not store:
            # Fallback auto-provisioning
            category = None
            if user.store_type:
                st_lower = user.store_type.lower()
                for c in db.query(Category).all():
                    if c.name.lower() in st_lower or c.code in st_lower or st_lower in c.name.lower():
                        category = c
                        break
            if not category:
                category = db.query(Category).first()

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Store categories not initialized."
                )

            store = Store(
                name=f"{user.first_name}'s {category.name}",
                category_id=category.id,
                owner_id=user.id,
                phone=user.phone,
                email=user.email,
                currency="USD",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)

            user.store_id = store.id
            db.commit()

        return store

    @staticmethod
    def verify_store_access(user: User, store_id: int):
        """
        Enforces strict multi-tenant store isolation:
        Verifies that the user actually belongs to or owns store_id.
        """
        if user.store_id != store_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to access another store's records."
            )

