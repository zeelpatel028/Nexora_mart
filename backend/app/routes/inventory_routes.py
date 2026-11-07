from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.inventory_schema import (
    InventoryResponse,
    StockInRequest,
    StockOutRequest,
    StockAdjustRequest,
    StockMovementResponse
)
from ..services.inventory_service import InventoryService
from ..services.store_service import StoreService

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryResponse], include_in_schema=False)
@router.get("/", response_model=List[InventoryResponse])
def get_inventory(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full store inventory levels with batch and expiry details"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.list_inventory(db, store.id, search=search)

@router.post("/stock-in")
def stock_in(
    request: StockInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add incoming stock quantity to product inventory"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.stock_in(db, store, current_user, request)

@router.post("/stock-out")
def stock_out(
    request: StockOutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deduct damaged, expired, or removed stock from inventory"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.stock_out(db, store, current_user, request)

@router.post("/adjust")
def adjust_stock(
    request: StockAdjustRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reconcile inventory based on physical audit counts"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.adjust_stock(db, store, current_user, request)

@router.get("/low-stock", response_model=List[InventoryResponse])
def get_low_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get products that have fallen below their reorder threshold"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.list_inventory(db, store.id, low_stock_only=True)

@router.get("/expiry-alerts", response_model=List[InventoryResponse])
def get_expiry_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get items expiring within 30 days or already expired (Medical & Grocery items)"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.list_inventory(db, store.id, expiring_only=True)

@router.get("/history", response_model=List[StockMovementResponse])
def get_stock_history(
    product_id: Optional[int] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Audit trail log of all inventory movements (Sales, Purchases, Adjustments, In, Out)"""
    store = StoreService.get_user_store(db, current_user)
    return InventoryService.get_stock_movements(db, store.id, product_id=product_id, limit=limit)

