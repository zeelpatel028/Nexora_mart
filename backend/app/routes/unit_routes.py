from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.unit import Unit
from ..schemas.unit_schema import UnitResponse
from ..services.store_service import StoreService

router = APIRouter(prefix="/units", tags=["Units"])

@router.get("/", response_model=List[UnitResponse])
def get_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns available measurement units for products (e.g. kg, g, pcs, box, meter, pack).
    Includes system defaults and store-custom units.
    """
    store = StoreService.get_user_store(db, current_user)
    units = db.query(Unit).filter(
        or_(Unit.store_id == None, Unit.store_id == store.id)
    ).all()
    return units

