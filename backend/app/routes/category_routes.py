from typing import List, Optional, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, get_optional_store_context, StoreContext
from ..schemas.category_schema import (
    CategoryResponse,
    CategoryCreate,
    CategoryUpdate,
    CategoryFieldCreate,
    CategoryFieldResponse,
)
from ..services.category_service import CategoryService

from ..models.category import Category
from ..models.store import ShopCategory
from ..models.product import ProductAttribute
from ..services.cache_service import CacheService

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse], include_in_schema=False)
@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    active_only: bool = True,
    db: Session = Depends(get_db),
    ctx: Optional[StoreContext] = Depends(get_optional_store_context)
):
    """List all categories belonging to current merchant's store, or global shop categories if public."""
    store_id = ctx.store_id if isinstance(ctx, StoreContext) else None
    cached = CacheService.get_categories(store_id)
    if cached is not None:
        return cached

    if isinstance(ctx, StoreContext) and ctx.store_id:
        store_cats = CategoryService.get_all_categories(db, store_id=ctx.store_id, active_only=active_only)
        if not store_cats:
            for c_name in ["General", "Premium", "Special"]:
                db.add(Category(store_id=ctx.store_id, name=c_name, code=c_name.lower(), is_active=True))
            db.commit()
            store_cats = CategoryService.get_all_categories(db, store_id=ctx.store_id, active_only=active_only)
        try:
            CacheService.set_categories([c.to_dict() if hasattr(c, 'to_dict') else c for c in store_cats], store_id=store_id)
        except Exception:
            pass
        return store_cats
    # Fallback to ShopCategory master list
    query = db.query(ShopCategory)
    if active_only:
        query = query.filter(ShopCategory.is_active == True)
    res = query.order_by(ShopCategory.name.asc()).all()
    return res

@router.get("/{id}/fields")
def get_category_fields(id: int, db: Session = Depends(get_db)):
    """Fetch field configuration for dynamic product form generation (legacy compatibility)."""
    return db.query(ProductAttribute).filter(
        ProductAttribute.shop_category_id == id
    ).order_by(ProductAttribute.display_order.asc()).all()

@router.post("/{id}/fields", response_model=CategoryFieldResponse, status_code=status.HTTP_201_CREATED)
def add_field_to_category(
    id: int,
    request: CategoryFieldCreate,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = None,
    ctx: Optional[StoreContext] = Depends(get_optional_store_context)
):
    """Add a dynamic field to a category (admin / future-proofing compatibility)."""
    attr = ProductAttribute(
        shop_category_id=id,
        name=request.field_label or request.field_name,
        code=request.field_name,
        field_type=request.field_type or "text",
        is_required=request.is_required or False,
        display_order=request.display_order or 0,
        options=request.options
    )
    db.add(attr)
    db.commit()
    db.refresh(attr)
    return CategoryFieldResponse(
        id=attr.id,
        category_id=id,
        field_name=request.field_name,
        field_label=request.field_label,
        field_type=request.field_type,
        is_required=request.is_required,
        options=request.options,
        display_order=request.display_order or 0
    )

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Add a new category scoped strictly to current merchant store."""
    ctx.require_permission("create_product")
    res = CategoryService.create_category(db, ctx.store_id, request)
    CacheService.invalidate_products_cache()
    return res

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
    res = CategoryService.update_category(db, ctx.store_id, id, request)
    CacheService.invalidate_products_cache()
    return res

@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Deactivate category in store."""
    ctx.require_permission("delete_product")
    res = CategoryService.delete_category(db, ctx.store_id, id)
    CacheService.invalidate_products_cache()
    return res
