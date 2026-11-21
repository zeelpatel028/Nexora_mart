from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...schemas.purchase_order_schema import (
    PurchaseOrderCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest
)
from ...services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Purchase Orders"])

@router.get("")
def list_purchase_orders(
    supplier_id: Optional[int] = None,
    order_status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """List purchase orders with order status (Pending/Ordered/Received) and payment status."""
    items, total = OrderService.list_orders(
        db=db,
        store_id=store.id,
        supplier_id=supplier_id,
        order_status=order_status,
        payment_status=payment_status,
        search=search,
        page=page,
        limit=limit
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def place_purchase_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Place a new purchase order.
    Saves edited purchase price in purchase order item without changing main product purchase price.
    Stock is NOT increased here; stock increases only when order is received.
    """
    return OrderService.place_order(db, store, user, data)

@router.post("/{order_id}/receive")
def receive_purchase_order(
    order_id: int,
    data: PurchaseOrderReceiveRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Confirm receipt of purchase order.
    Transactionally:
    1. Increases product stock.
    2. Creates product batch record.
    3. Saves expiry date if enabled.
    4. Logs stock movement record.
    5. Updates order status.
    6. Updates supplier ledger.
    Prevents duplicate receiving!
    """
    return OrderService.receive_order(db, store, user, order_id, data)

@router.post("/{order_id}/pay")
def pay_purchase_order(
    order_id: int,
    data: PurchaseOrderPaymentRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Record full or partial payment against received purchase order.
    Updates order payment status and creates supplier ledger entry.
    """
    return OrderService.pay_order(db, store, user, order_id, data)
