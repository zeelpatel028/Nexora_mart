import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.order import Order, OrderItem
from ..models.partner import Customer
from ..models.product import Product
from ..schemas.order_schema import OrderCreate, OrderUpdate, OrderResponse, OrderItemResponse
from ..services.store_service import StoreService

router = APIRouter(prefix="/orders", tags=["Orders"])

def _format_order(o: Order) -> OrderResponse:
    item_responses = []
    for it in o.items:
        prod_name = it.product.name if it.product else None
        item_responses.append(
            OrderItemResponse(
                id=it.id,
                product_id=it.product_id,
                product_name=prod_name,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total_price=it.total_price
            )
        )
    cust_name = o.customer.name if o.customer else "Walk-in Customer"
    return OrderResponse(
        id=o.id,
        store_id=o.store_id,
        order_number=o.order_number,
        customer_id=o.customer_id,
        customer_name=cust_name,
        total_amount=o.total_amount,
        status=o.status,
        notes=o.notes,
        created_at=o.created_at,
        items=item_responses
    )

@router.get("", response_model=List[OrderResponse])
@router.get("/", response_model=List[OrderResponse], include_in_schema=False)
def list_orders(
    status_filter: Optional[str] = None,
    customer_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List customer orders for the current store with strict store isolation"""
    store = StoreService.get_user_store(db, current_user)
    query = db.query(Order).filter(Order.store_id == store.id)
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)

    offset = (page - 1) * limit
    orders = query.order_by(Order.id.desc()).offset(offset).limit(limit).all()
    return [_format_order(o) for o in orders]

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_order(
    request: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new customer order under the current store"""
    store = StoreService.get_user_store(db, current_user)
    order_count = db.query(Order).filter(Order.store_id == store.id).count() + 1
    order_num = f"ORD-{store.code or 'STR'}-{order_count:06d}"

    total = 0.0
    order = Order(
        store_id=store.id,
        customer_id=request.customer_id,
        order_number=order_num,
        total_amount=0.0,
        status=request.status or "PENDING",
        notes=request.notes
    )
    db.add(order)
    db.flush()

    for item in request.items:
        line_total = item.quantity * item.unit_price
        total += line_total
        order_item = OrderItem(
            store_id=store.id,
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=line_total
        )
        db.add(order_item)

    order.total_amount = total
    db.commit()
    db.refresh(order)
    return _format_order(order)

@router.get("/{id}", response_model=OrderResponse)
def get_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View an order by ID, strictly isolated to the authenticated user's store"""
    store = StoreService.get_user_store(db, current_user)
    order = db.query(Order).filter(Order.id == id, Order.store_id == store.id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{id} not found in this store."
        )
    return _format_order(order)

@router.patch("/{id}", response_model=OrderResponse)
@router.put("/{id}", response_model=OrderResponse)
def update_order(
    id: int,
    request: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order status or notes"""
    store = StoreService.get_user_store(db, current_user)
    order = db.query(Order).filter(Order.id == id, Order.store_id == store.id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{id} not found in this store."
        )
    if request.status:
        order.status = request.status.upper()
    if request.notes is not None:
        order.notes = request.notes
    db.commit()
    db.refresh(order)
    return _format_order(order)

