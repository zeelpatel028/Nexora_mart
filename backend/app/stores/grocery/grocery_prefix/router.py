from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import GroceryPrefixesResponse, GroceryPrefixesUpdateRequest, IdPreviewResponse
from .service import GroceryPrefixService

router = APIRouter(prefix="/prefixes", tags=["Grocery Prefixes"])


@router.get("", response_model=GroceryPrefixesResponse)
def get_prefixes(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Retrieve all 10 document prefixes configured for the store."""
    prefixes = GroceryPrefixService.get_or_create_prefixes(db, store.id)
    return {"store_id": store.id, "prefixes": prefixes}


@router.put("", response_model=GroceryPrefixesResponse)
def update_prefixes(
    payload: GroceryPrefixesUpdateRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Update prefixes for the store (2-5 uppercase alphanumeric chars)."""
    updated = GroceryPrefixService.update_prefixes(db, store.id, payload.prefixes)
    return {"store_id": store.id, "prefixes": updated}


@router.get("/preview/{key}", response_model=IdPreviewResponse)
def preview_id(
    key: str,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Preview next sequential ID without incrementing."""
    return GroceryPrefixService.preview_id(db, store.id, key)
