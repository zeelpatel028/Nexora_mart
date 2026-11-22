from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import (
    PurchaseOrderCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest,
    PurchaseOrderResponse
)
from .service import GroceryPurchaseOrderService

router = APIRouter(prefix="/orders", tags=["Grocery Purchase Orders"])


@router.get("", response_model=List[PurchaseOrderResponse])
def list_orders(
    supplier_id: Optional[int] = None,
    order_status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List purchase orders with status, expected delivery, and payment tracking."""
    items, total = GroceryPurchaseOrderService.list_orders(
        db, store.id, supplier_id, order_status, payment_status, search, page, limit
    )
    return items


@router.post("", status_code=status.HTTP_201_CREATED)
def place_order(
    payload: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Place a purchase order with custom purchase price for this order only."""
    return GroceryPurchaseOrderService.place_order(db, store.id, payload)


@router.post("/{order_id}/receive")
def receive_order(
    order_id: int,
    payload: PurchaseOrderReceiveRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Confirm receiving purchase order, updates stock, creates batch if expiry alert enabled."""
    return GroceryPurchaseOrderService.receive_order(db, store.id, order_id, payload)


@router.post("/{order_id}/pay")
def pay_order(
    order_id: int,
    payload: PurchaseOrderPaymentRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Mark purchase order as paid."""
    return GroceryPurchaseOrderService.pay_order(db, store.id, order_id, payload)
