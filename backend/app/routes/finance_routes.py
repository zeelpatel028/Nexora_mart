import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.finance import Expense, Payment
from ..schemas.finance_schema import (
    ExpenseCreate,
    ExpenseResponse,
    PaymentCreate,
    PaymentResponse
)
from ..services.store_service import StoreService

router = APIRouter(tags=["Finance"])

@router.get("/expenses", response_model=List[ExpenseResponse])
@router.get("/expenses/", response_model=List[ExpenseResponse], include_in_schema=False)
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    return db.query(Expense).filter(Expense.store_id == store.id).order_by(Expense.id.desc()).all()

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
@router.post("/expenses/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_expense(
    request: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    exp_date = datetime.datetime.now(datetime.timezone.utc)
    if request.expense_date:
        try:
            exp_date = datetime.datetime.strptime(request.expense_date[:10], "%Y-%m-%d")
        except Exception:
            pass

    exp = Expense(
        store_id=store.id,
        category=request.category.strip(),
        amount=request.amount,
        payment_method=request.payment_method.upper(),
        expense_date=exp_date,
        description=request.description,
        receipt_url=request.receipt_url
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/expenses/{id}")
def delete_expense(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    exp = db.query(Expense).filter(Expense.id == id, Expense.store_id == store.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found.")
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted successfully."}

@router.get("/payments", response_model=List[PaymentResponse])
@router.get("/payments/", response_model=List[PaymentResponse], include_in_schema=False)
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    return db.query(Payment).filter(Payment.store_id == store.id).order_by(Payment.id.desc()).all()

@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def record_payment(
    request: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    pay = Payment(
        store_id=store.id,
        reference_type=request.reference_type.upper(),
        reference_id=request.reference_id,
        amount=request.amount,
        payment_method=request.payment_method.upper(),
        notes=request.notes
    )
    db.add(pay)
    db.commit()
    db.refresh(pay)
    return pay

