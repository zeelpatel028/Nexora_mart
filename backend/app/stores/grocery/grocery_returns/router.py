from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.auth import get_current_user
from ....dependencies.store_access import get_current_store
from ....models.user import User
from ....models.store import Store
from .schemas import GroceryReturnCreate
from .service import GroceryReturnService

router = APIRouter(prefix="/returns", tags=["Grocery Returns & Refunds"])


@router.get("")
def list_returns(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryReturnService.list_returns(db, store.id, limit)


@router.post("", status_code=status.HTTP_201_CREATED)
def process_return(
    payload: GroceryReturnCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user),
):
    return GroceryReturnService.process_return(db, store.id, user.id, payload)
