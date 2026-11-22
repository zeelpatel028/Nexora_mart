from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import (
    GroceryProductCreate,
    GroceryProductUpdate,
    GroceryProductResponse,
    GroceryProductListResponse
)
from .service import GroceryProductService

router = APIRouter(prefix="/products", tags=["Grocery Products"])


@router.get("/preview-id")
def preview_id(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Preview next product ID: {store_code}_PRD_0001."""
    next_id = GroceryProductService.preview_id(db, store.id)
    return {"next_id": next_id}


@router.get("", response_model=GroceryProductListResponse)
def list_products(
    search: Optional[str] = None,
    low_stock_only: bool = False,
    expiring_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List grocery products with search, pagination, and stock alert indicators."""
    items, total = GroceryProductService.list_products(
        db, store.id, search, low_stock_only, expiring_only, page, limit
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.post("", response_model=GroceryProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: GroceryProductCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Add a new grocery product with auto-generated ID: {store_code}_PRD_0001."""
    prod = GroceryProductService.create_product(db, store.id, payload)
    detail = GroceryProductService.get_product_detail(db, store.id, prod.id)
    return detail


@router.get("/{product_id}")
def get_product_detail(
    product_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Get single product details with batches and supplier info."""
    return GroceryProductService.get_product_detail(db, store.id, product_id)


@router.put("/{product_id}", response_model=GroceryProductResponse)
def update_product(
    product_id: int,
    payload: GroceryProductUpdate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Update grocery product."""
    prod = GroceryProductService.update_product(db, store.id, product_id, payload)
    return GroceryProductService.get_product_detail(db, store.id, prod.id)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Soft delete grocery product."""
    return GroceryProductService.delete_product(db, store.id, product_id)
