from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.store_schema import StoreResponse, StoreUpdate
from ..services.store_service import StoreService
from ..services.category_service import CategoryService

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("/my-store", response_model=StoreResponse)
def get_my_store(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active store details for authenticated merchant"""
    return StoreService.get_user_store(db, current_user)

@router.put("/my-store", response_model=StoreResponse)
def update_my_store(
    request: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update store profile, name, category, or address"""
    store = StoreService.get_user_store(db, current_user)
    if request.name is not None:
        store.name = request.name.strip()
    if request.category_id is not None:
        # Validate category exists
        CategoryService.get_category_by_id(db, request.category_id)
        store.category_id = request.category_id
        # Update user's store_type string for backward compatibility
        cat = CategoryService.get_category_by_id(db, request.category_id)
        current_user.store_type = cat.name
    if request.phone is not None:
        store.phone = request.phone
    if request.email is not None:
        store.email = request.email
    if request.address is not None:
        store.address = request.address
    if request.city is not None:
        store.city = request.city
    if request.tax_number is not None:
        store.tax_number = request.tax_number
    if request.currency is not None:
        store.currency = request.currency.upper()

    db.commit()
    db.refresh(store)
    return store

