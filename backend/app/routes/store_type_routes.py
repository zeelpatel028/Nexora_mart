from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..models.store_type import StoreType
from ..models.user import User
from ..middleware.auth_middleware import get_current_user
from ..schemas.store_type_schema import (
    StoreTypeResponse,
    StoreTypeCreate,
    StoreTypeUpdate
)

router = APIRouter(prefix="/store-types", tags=["Store Types"])

@router.get("", response_model=List[StoreTypeResponse])
@router.get("/", response_model=List[StoreTypeResponse], include_in_schema=False)
def list_store_types(active_only: bool = True, db: Session = Depends(get_db)):
    """
    List all supported store types from the backend database.
    Used by registration flow and store setup.
    """
    query = db.query(StoreType)
    if active_only:
        query = query.filter(StoreType.is_active == True)
    return query.order_by(StoreType.id.asc()).all()

@router.get("/{id}", response_model=StoreTypeResponse)
def get_store_type(id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single store type by ID"""
    st = db.query(StoreType).filter(StoreType.id == id).first()
    if not st:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store type not found"
        )
    return st

@router.post("", response_model=StoreTypeResponse, status_code=status.HTTP_201_CREATED)
def create_store_type(
    request: StoreTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only: create a new global store type"""
    if getattr(current_user, "role", "owner") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create global store types."
        )
    existing = db.query(StoreType).filter(StoreType.code == request.code.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Store type code already exists.")

    new_st = StoreType(
        code=request.code.strip().lower(),
        name=request.name.strip(),
        description=request.description,
        icon=request.icon,
        is_active=request.is_active
    )
    db.add(new_st)
    db.commit()
    db.refresh(new_st)
    return new_st

@router.patch("/{id}", response_model=StoreTypeResponse)
def update_store_type(
    id: int,
    request: StoreTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only: update an existing global store type"""
    if getattr(current_user, "role", "owner") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify global store types."
        )
    st = db.query(StoreType).filter(StoreType.id == id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Store type not found")

    if request.name is not None:
        st.name = request.name.strip()
    if request.description is not None:
        st.description = request.description
    if request.icon is not None:
        st.icon = request.icon
    if request.is_active is not None:
        st.is_active = request.is_active

    db.commit()
    db.refresh(st)
    return st

