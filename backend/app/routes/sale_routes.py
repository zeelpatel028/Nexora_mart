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

router = APIRouter(prefix="/sales", tags=["Sales & Billing"])

@router.get("", response_model=List[SaleResponse], include_in_schema=False)
@router.get("/", response_model=List[SaleResponse])
def list_sales(
    date: Optional[str] = Query(None, description="Filter bills for a specific date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search by invoice number or customer name/phone"),
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    payment_method: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List store sales orders and invoices with date filtering and search"""
    store = StoreService.get_user_store(db, current_user)
    sales, _ = SaleService.list_sales(
        db=db,
        store_id=store.id,
        date_str=date,
        start_date_str=start_date,
        end_date_str=end_date,
        search=search,
        customer_id=customer_id,
        payment_status=payment_status,
        payment_method=payment_method,
        page=page,
        limit=limit
    )
    return sales

@router.post("", response_model=SaleDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=SaleDetailResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    request: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a point-of-sale checkout: creates bill, deducts inventory, and writes stock movement"""
    store = StoreService.get_user_store(db, current_user)
    return SaleService.create_sale(db, store, current_user, request)

@router.get("/{id}", response_model=SaleDetailResponse)
def get_sale_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full sale invoice with line items and customer details"""
    store = StoreService.get_user_store(db, current_user)
    return SaleService.get_sale_detail(db, store.id, id)

