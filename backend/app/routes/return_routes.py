from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..services.return_service import ReturnService
from ..services.store_service import StoreService

router = APIRouter(prefix="/returns", tags=["Sales Returns & Refunds"])

class ReturnItemCreate(BaseModel):
    product_id: str = Field(..., description="Product ID or UUID")
    quantity: float = Field(..., gt=0, description="Quantity to return")
    unit_price: Optional[float] = None
    condition_note: Optional[str] = None

class ReturnCreateRequest(BaseModel):
    invoice_id: int
    items: List[ReturnItemCreate]
    reason: Optional[str] = "Customer Return"
    refund_method: Optional[str] = "CASH"

@router.get("", include_in_schema=False)
@router.get("/")
def list_returns(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all sales returns and refunds for authenticated store"""
    store = StoreService.get_user_store(db, current_user)
    returns, total = ReturnService.list_returns(db, store.id, page=page, limit=limit)
    return {"items": returns, "total": total, "page": page, "limit": limit}

@router.get("/{id}")
def get_return_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single return detail by ID, strictly isolated to current store"""
    store = StoreService.get_user_store(db, current_user)
    return ReturnService.get_return_detail(db, store.id, id)

@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_return(
    request: ReturnCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process sales return, restore product stock in inventory, and issue refund"""
    store = StoreService.get_user_store(db, current_user)
    items_dict = [item.model_dump() for item in request.items]
    return ReturnService.process_return(
        db=db,
        store=store,
        user=current_user,
        invoice_id=request.invoice_id,
        items=items_dict,
        reason=request.reason,
        refund_method=request.refund_method or "CASH"
    )

