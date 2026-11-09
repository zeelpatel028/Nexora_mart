from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.store import (
    Store,
    ShopCategory,
    StoreOwnerDetails,
    StoreAddress,
    StoreBusinessDetails,
    StoreConfiguration,
    DocumentSequence,
)
from ..models.user import User

class StoreService:
    @staticmethod
    def get_user_stores(db: Session, user: User) -> List[Store]:
        """
        Retrieves all active stores owned by the user.
        """
        stores = db.query(Store).filter(Store.user_id == user.id, Store.is_active == True).all()
        if not stores:
            # Auto-provision primary store if none exists
            primary = StoreService.get_user_store(db, user)
            return [primary]
        return stores

    @staticmethod
    def get_user_store(db: Session, user: User, store_id: Optional[int] = None) -> Store:
        """
        Retrieves active store for user. If store_id is provided, strictly validates ownership/access.
        Otherwise returns the primary store owned by user.
        Rejects cross-store access with 403 Forbidden.
        """
        if store_id is not None:
            store = db.query(Store).filter(Store.id == store_id).first()
            if not store:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Store not found."
                )
            if store.user_id != user.id and getattr(user, "role", None) != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to requested store."
                )
            return store

        store = db.query(Store).filter(Store.user_id == user.id, Store.is_active == True).first()

        if not store:
            # Auto-provision primary store
            category = None
            if user.store_type:
                st_lower = user.store_type.lower()
                for c in db.query(ShopCategory).all():
                    if c.name.lower() in st_lower or c.code.lower() in st_lower or st_lower in c.name.lower():
                        category = c
                        break
            if not category:
                category = db.query(ShopCategory).first()

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Store categories not initialized."
                )

            store = Store(
                name=f"{user.first_name}'s {category.name}",
                shop_category_id=category.id,
                user_id=user.id,
                code=f"STORE-{user.id:03d}",
                currency="INR",
                currency_symbol="₹",
                is_active=True
            )
            db.add(store)
            db.commit()
            db.refresh(store)

            # Store owner details
            owner_details = StoreOwnerDetails(
                store_id=store.id,
                owner_name=user.full_name,
                contact_phone=user.phone,
                contact_email=user.email
            )
            db.add(owner_details)

            # Store address
            addr = StoreAddress(
                store_id=store.id,
                address_line1="Main Market Commercial Complex",
                city="Mumbai",
                state="Maharashtra",
                country="India",
                postal_code="400001",
                is_primary=True
            )
            db.add(addr)

            # Business details
            biz = StoreBusinessDetails(
                store_id=store.id,
                legal_name=store.name,
                business_type="Retail",
                tax_type="GST"
            )
            db.add(biz)

            # Configuration
            cfg = StoreConfiguration(
                store_id=store.id,
                enable_barcode_scanner=True,
                low_stock_threshold=5,
                tax_rate=0.0,
                invoice_prefix="INV",
                allow_negative_stock=False,
                dark_mode_default=False
            )
            db.add(cfg)

            # Document sequences
            for doc_type, prefix in [('INVOICE', 'INV'), ('ORDER', 'ORD'), ('PURCHASE', 'PUR'), ('RETURN', 'RET'), ('REFUND', 'REF')]:
                seq = DocumentSequence(
                    store_id=store.id,
                    document_type=doc_type,
                    prefix=prefix,
                    next_number=1001,
                    padding=4
                )
                db.add(seq)

            db.commit()
            db.refresh(store)

        return store

    @staticmethod
    def verify_store_access(user: User, store_id: int, db: Session):
        """
        Enforces strict multi-tenant store isolation:
        Verifies that the user actually owns or manages store_id.
        """
        store = db.query(Store).filter(Store.id == store_id, Store.is_active == True).first()
        if not store or store.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to access another store's records."
            )
        return store
