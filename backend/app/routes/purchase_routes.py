from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.purchase_schema import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseDetailResponse
)
from ..services.purchase_service import PurchaseService
from ..services.store_service import StoreService

router = APIRouter(prefix="/purchases", tags=["Purchases"])

@router.get("", response_model=List[PurchaseResponse], include_in_schema=False)
@router.get("/", response_model=List[PurchaseResponse])
def list_purchases(
    supplier_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List purchase orders and stock inward invoices"""
    store = StoreService.get_user_store(db, current_user)
    purchases, _ = PurchaseService.list_purchases(
        db=db,
        store_id=store.id,
        supplier_id=supplier_id,
        page=page,
        limit=limit
    )
    return purchases

@router.post("", response_model=PurchaseDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=PurchaseDetailResponse, status_code=status.HTTP_201_CREATED)
def create_purchase(
    request: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record incoming purchase invoice and automatically increase inventory stock"""
    store = StoreService.get_user_store(db, current_user)
    return PurchaseService.create_purchase(db, store, current_user, request)

@router.get("/{id}", response_model=PurchaseDetailResponse)
def get_purchase_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full purchase details and line items"""
    store = StoreService.get_user_store(db, current_user)
    return PurchaseService.get_purchase_detail(db, store.id, id)

