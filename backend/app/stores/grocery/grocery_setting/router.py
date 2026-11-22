from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import GrocerySettingResponse, GrocerySettingUpdate
from .service import GrocerySettingService

router = APIRouter(prefix="/settings", tags=["Grocery Shop Settings"])


@router.get("", response_model=GrocerySettingResponse)
def get_settings(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Fetch shop settings: Theme, Language, Currency, Invoice template, Bill Sound."""
    return GrocerySettingService.get_or_create_settings(db, store.id)


@router.put("", response_model=GrocerySettingResponse)
def update_settings(
    payload: GrocerySettingUpdate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Update shop settings."""
    return GrocerySettingService.update_settings(db, store.id, payload)
