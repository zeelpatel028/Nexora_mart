from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.sale_schema import (
    SaleCreate,
    SaleResponse,
    SaleDetailResponse
)
from ..services.sale_service import SaleService
from ..services.store_service import StoreService

router = APIRouter(prefix="/bills", tags=["Bills & POS Invoices"])

@router.get("", response_model=List[SaleResponse])
@router.get("/", response_model=List[SaleResponse], include_in_schema=False)
def list_bills(
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List bills/invoices for current merchant's store"""
    store = StoreService.get_user_store(db, current_user)
    sales, _ = SaleService.list_sales(
        db=db,
        store_id=store.id,
        customer_id=customer_id,
        payment_status=payment_status,
        page=page,
        limit=limit
    )
    return sales

@router.post("", response_model=SaleDetailResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SaleDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_bill(
    request: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new point-of-sale bill/invoice with inventory deduction"""
    store = StoreService.get_user_store(db, current_user)
    return SaleService.create_sale(db, store, current_user, request)

@router.get("/{id}", response_model=SaleDetailResponse)
def get_bill(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View a bill by ID, strictly isolated to the authenticated user's store"""
    store = StoreService.get_user_store(db, current_user)
    return SaleService.get_sale_detail(db, store.id, id)

