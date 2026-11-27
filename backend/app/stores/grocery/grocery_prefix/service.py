import datetime
from typing import Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .models import GroceryPrefix, GroceryIdCounter, GroceryStorePrefix
from .cache import get_cached_prefixes, set_cached_prefixes, invalidate_prefixes_cache
from ....utils.id_generator import DEFAULT_PREFIXES, preview_next_id, generate_next_id, get_store_code


_KEY_TO_COLUMN = {
    "invoice": "invoice_prefix",
    "debit_customer": "debit_customer_prefix",
    "walk_in_customer": "walk_in_customer_prefix",
    "supplier": "supplier_prefix",
    "order": "order_prefix",
    "product": "product_prefix",
    "employee": "employee_prefix",
    "return": "return_prefix",
    "refund": "refund_prefix",
    "expense": "expense_prefix",
}


def _sync_store_prefix_row(db: Session, store_id: int, values: Dict[str, str]):
    from ....models.store import Store
    store = db.query(Store).filter(Store.id == store_id).first()
    uid = store.user_id if store else None
    row = db.query(GroceryStorePrefix).filter(GroceryStorePrefix.store_id == store_id).first()
    if not row:
        row = GroceryStorePrefix(store_id=store_id, user_id=uid)
        db.add(row)
    elif row.user_id is None and uid is not None:
        row.user_id = uid
    for k, col in _KEY_TO_COLUMN.items():
        if k in values:
            setattr(row, col, values[k])


class GroceryPrefixService:
    @staticmethod
    def get_or_create_prefixes(db: Session, store_id: int) -> Dict[str, str]:
        cached = get_cached_prefixes(store_id)
        if cached is not None:
            return cached

        from ....models.store import Store
        store = db.query(Store).filter(Store.id == store_id).first()
        uid = store.user_id if store else None

        rows = db.query(GroceryPrefix).filter(
            GroceryPrefix.store_id == store_id,
            GroceryPrefix.is_deleted == False
        ).all()

        current_dict = {r.key: r.prefix_value for r in rows}
        missing = False

        for k, default_val in DEFAULT_PREFIXES.items():
            if k not in current_dict:
                missing = True
                pfx = GroceryPrefix(store_id=store_id, user_id=uid, key=k, prefix_value=default_val)
                db.add(pfx)
                current_dict[k] = default_val

        _sync_store_prefix_row(db, store_id, current_dict)
        if missing:
            db.commit()
        else:
            db.commit()

        set_cached_prefixes(store_id, current_dict)
        return current_dict

    @staticmethod
    def update_prefixes(db: Session, store_id: int, updates: Dict[str, str]) -> Dict[str, str]:
        # Validate prefixes: 2-5 chars, uppercase, alphanumeric, no duplicate values inside same store
        clean_updates = {}
        for k, v in updates.items():
            val = str(v).strip().upper()
            if not (2 <= len(val) <= 5):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prefix '{val}' for '{k}' must be 2 to 5 characters long."
                )
            if not val.isalnum():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prefix '{val}' for '{k}' must contain only letters and numbers."
                )
            clean_updates[k] = val

        # Check for duplicates in values within the same store
        existing = GroceryPrefixService.get_or_create_prefixes(db, store_id)
        merged = {**existing, **clean_updates}
        vals = list(merged.values())
        if len(vals) != len(set(vals)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prefix values must be unique within the store."
            )

        for k, val in clean_updates.items():
            pfx = db.query(GroceryPrefix).filter(
                GroceryPrefix.store_id == store_id,
                GroceryPrefix.key == k
            ).first()
            if pfx:
                pfx.prefix_value = val
                pfx.updated_at = datetime.datetime.now(datetime.timezone.utc)
            else:
                db.add(GroceryPrefix(store_id=store_id, key=k, prefix_value=val))

        _sync_store_prefix_row(db, store_id, merged)
        db.commit()
        invalidate_prefixes_cache(store_id)
        return GroceryPrefixService.get_or_create_prefixes(db, store_id)

    @staticmethod
    def preview_id(db: Session, store_id: int, key: str) -> dict:
        store_code = get_store_code(db, store_id)
        prefixes = GroceryPrefixService.get_or_create_prefixes(db, store_id)
        prefix_val = prefixes.get(key, DEFAULT_PREFIXES.get(key, "DOC"))
        next_id = preview_next_id(db, store_id, key)
        return {
            "store_code": store_code,
            "key": key,
            "prefix": prefix_val,
            "next_id": next_id
        }

    @staticmethod
    def generate_id(db: Session, store_id: int, key: str) -> str:
        return generate_next_id(db, store_id, key)
