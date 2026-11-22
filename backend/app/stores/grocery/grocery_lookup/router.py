from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.auth import get_current_user
from ....models.user import User
from .schemas import GSTRateResponse, UnitResponse
from .service import GroceryLookupService

router = APIRouter(prefix="/lookup", tags=["Grocery Lookup"])


@router.get("/gst-rates", response_model=List[GSTRateResponse])
def get_gst_rates(db: Session = Depends(get_db)):
    """Retrieve standard GST rates (0%, 5%, 12%, 18%, 28%)."""
    return GroceryLookupService.get_gst_rates(db)


@router.get("/units", response_model=List[UnitResponse])
def get_units(db: Session = Depends(get_db)):
    """Retrieve standard measurement units (kg, g, litre, ml, piece, packet, box, dozen)."""
    return GroceryLookupService.get_units(db)
