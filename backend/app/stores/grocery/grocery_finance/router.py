from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import GroceryExpenseCreate, GroceryPaymentCreate
from .service import GroceryFinanceService

router = APIRouter(tags=["Grocery Expenses & Payments"])


@router.get("/expenses")
def list_expenses(
    category: Optional[str] = None,
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryFinanceService.list_expenses(db, store.id, category, limit)


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: GroceryExpenseCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryFinanceService.create_expense(db, store.id, store.user_id, payload)


@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryFinanceService.delete_expense(db, store.id, expense_id)


@router.get("/payments")
def list_payments(
    reference_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryFinanceService.list_payments(db, store.id, reference_type, limit)


@router.post("/payments", status_code=status.HTTP_201_CREATED)
def record_payment(
    payload: GroceryPaymentCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    return GroceryFinanceService.record_payment(db, store.id, store.user_id, payload)
