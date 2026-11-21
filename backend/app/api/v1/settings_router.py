from typing import Dict, Any
from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...services.backup_service import BackupService

router = APIRouter(prefix="/settings", tags=["Shop Settings & Backup"])

@router.get("/shop")
def get_shop_settings(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Fetch shop configuration including currency, invoice template, sound settings, and preferences."""
    setting = store.store_settings
    return {
        "store_id": store.id,
        "store_name": store.name,
        "currency": store.currency or "INR",
        "currency_symbol": store.currency_symbol or "₹",
        "theme": setting.theme if setting and hasattr(setting, "theme") else "system",
        "language": setting.language if setting and hasattr(setting, "language") else "en",
        "bill_sound_enabled": True,
        "invoice_template": "modern_orange",
        "low_stock_notification": True
    }

@router.put("/shop")
def update_shop_settings(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Update shop appearance, currency, and template preferences."""
    if "currency" in data:
        store.currency = data["currency"]
        if data["currency"] == "USD":
            store.currency_symbol = "$"
        elif data["currency"] == "EUR":
            store.currency_symbol = "€"
        else:
            store.currency_symbol = "₹"

    db.commit()
    db.refresh(store)
    return {
        "success": True,
        "message": "Shop settings updated successfully.",
        "currency": store.currency,
        "currency_symbol": store.currency_symbol
    }

@router.get("/backup")
def export_backup(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Generate complete JSON backup containing all store data isolated to the authenticated user."""
    return BackupService.export_store_backup(db, store)

@router.post("/restore")
def restore_backup(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Restore store data from verified backup JSON object."""
    return BackupService.restore_store_backup(db, store, payload)
