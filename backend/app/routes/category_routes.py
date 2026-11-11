from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..schemas.category_schema import (
    CategoryResponse,
    CategoryCreate,
    CategoryUpdate,
)
from ..services.category_service import CategoryService

from ..models.store import ShopCategory
from ..models.product import ProductAttribute

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse], include_in_schema=False)
@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    active_only: bool = True,
    db: Session = Depends(get_db),
    ctx: Optional[StoreContext] = Depends(lambda: None)
):
    """List all categories belonging to current merchant's store, or global shop categories if public."""
    if isinstance(ctx, StoreContext) and ctx.store_id:
        store_cats = CategoryService.get_all_categories(db, store_id=ctx.store_id, active_only=active_only)
        if store_cats:
            return store_cats
    # Fallback to ShopCategory master list
    query = db.query(ShopCategory)
    if active_only:
        query = query.filter(ShopCategory.is_active == True)
    return query.order_by(ShopCategory.name.asc()).all()

@router.get("/{id}/fields")
def get_category_fields(id: int, db: Session = Depends(get_db)):
    """Fetch field configuration for dynamic product form generation (legacy compatibility)."""
    return db.query(ProductAttribute).filter(
        ProductAttribute.shop_category_id == id
    ).order_by(ProductAttribute.display_order.asc()).all()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Add a new category scoped strictly to current merchant store."""
    ctx.require_permission("create_product")
    return CategoryService.create_category(db, ctx.store_id, request)

@router.get("/{id}", response_model=CategoryResponse)
def get_category_detail(
    id: int,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Get category information checking store ownership."""
    return CategoryService.get_category_by_id(db, id, store_id=ctx.store_id)

@router.put("/{id}", response_model=CategoryResponse)
def update_category(
    id: int,
    request: CategoryUpdate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Update store category metadata."""
    ctx.require_permission("edit_product")
    return CategoryService.update_category(db, ctx.store_id, id, request)

@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Deactivate category in store."""
    ctx.require_permission("delete_product")
    return CategoryService.delete_category(db, ctx.store_id, id)
