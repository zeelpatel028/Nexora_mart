from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import GroceryBackupResponse, RestoreBackupRequest
from .service import GroceryBackupService

router = APIRouter(prefix="/backup", tags=["Grocery Store Backup"])


@router.get("/export")
def export_backup(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Generate complete JSON backup containing all store data isolated to the authenticated user."""
    return GroceryBackupService.export_store_backup(db, store)


@router.get("/history", response_model=List[GroceryBackupResponse])
def list_backups(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List historical backups generated for this store."""
    return GroceryBackupService.list_backups(db, store.id)


@router.post("/restore")
def restore_backup(
    payload: RestoreBackupRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Restore store data from verified backup JSON object."""
    return GroceryBackupService.restore_store_backup(db, store, payload.backup_data)
