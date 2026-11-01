from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.category_schema import (
    CategoryResponse,
    CategoryDetailResponse,
    CategoryCreate,
    CategoryUpdate,
    CategoryFieldResponse,
    CategoryFieldCreate,
    CategoryFieldUpdate
)
from ..services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(active_only: bool = True, db: Session = Depends(get_db)):
    """List all available store categories"""
    return CategoryService.get_all_categories(db, active_only=active_only)

@router.post("/", response_model=CategoryDetailResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new store category with optional custom dynamic fields (Admin / Multi-tenant extensible)"""
    return CategoryService.create_category(db, request)

@router.get("/{id}", response_model=CategoryDetailResponse)
def get_category_detail(id: int, db: Session = Depends(get_db)):
    """Get category information including all configured product fields"""
    cat = CategoryService.get_category_by_id(db, id)
    return cat

@router.get("/{id}/fields", response_model=List[CategoryFieldResponse])
def get_category_fields(id: int, db: Session = Depends(get_db)):
    """Fetch field configuration for dynamic product form generation"""
    return CategoryService.get_category_fields(db, id)

@router.put("/{id}", response_model=CategoryResponse)
def update_category(
    id: int,
    request: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update category metadata"""
    return CategoryService.update_category(db, id, request)

@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete or deactivate custom category"""
    return CategoryService.delete_category(db, id)

@router.post("/{id}/fields", response_model=CategoryFieldResponse, status_code=status.HTTP_201_CREATED)
def add_field_to_category(
    id: int,
    request: CategoryFieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new dynamic field to a category"""
    return CategoryService.add_category_field(db, id, request)

@router.put("/fields/{field_id}", response_model=CategoryFieldResponse)
def update_category_field(
    field_id: int,
    request: CategoryFieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update dynamic field configuration"""
    return CategoryService.update_category_field(db, field_id, request)

@router.delete("/fields/{field_id}")
def delete_category_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a field from a category"""
    return CategoryService.delete_category_field(db, field_id)

