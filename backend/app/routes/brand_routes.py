from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..schemas.brand_schema import BrandResponse, BrandCreate, BrandUpdate
from ..services.brand_service import BrandService

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.get("", response_model=List[BrandResponse])
@router.get("/", response_model=List[BrandResponse], include_in_schema=False)
def list_brands(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """List all active brands belonging strictly to merchant's store."""
    return BrandService.get_brands(db, ctx.store_id)

@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_brand(
    request: BrandCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create a new brand within current store."""
    ctx.require_permission("create_product")
    return BrandService.create_brand(db, ctx.store_id, request)

@router.get("/{id}", response_model=BrandResponse)
def get_brand(
    id: int,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve brand if owned by store."""
    return BrandService.get_brand(db, ctx.store_id, id)

@router.put("/{id}", response_model=BrandResponse)
def update_brand(
    id: int,
    request: BrandUpdate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Update store brand."""
    ctx.require_permission("edit_product")
    return BrandService.update_brand(db, ctx.store_id, id, request)

@router.delete("/{id}")
def delete_brand(
    id: int,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Deactivate store brand."""
    ctx.require_permission("delete_product")
    return BrandService.delete_brand(db, ctx.store_id, id)

