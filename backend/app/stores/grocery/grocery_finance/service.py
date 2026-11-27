import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .models import GroceryExpense, GroceryPayment
from .schemas import GroceryExpenseCreate, GroceryPaymentCreate
from ....utils.id_generator import generate_next_id


class GroceryFinanceService:
    @staticmethod
    def list_expenses(db: Session, store_id: int, category: Optional[str] = None, limit: int = 100) -> List[dict]:
        q = db.query(GroceryExpense).filter(
            GroceryExpense.store_id == store_id,
            GroceryExpense.is_deleted == False,
        )
        if category and category.upper() != "ALL":
            q = q.filter(GroceryExpense.category.ilike(category.strip()))
        rows = q.order_by(GroceryExpense.expense_date.desc(), GroceryExpense.id.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "store_id": r.store_id,
                "user_id": r.user_id,
                "expense_code": r.expense_code,
                "category": r.category,
                "amount": r.amount,
                "payment_method": r.payment_method,
                "expense_date": r.expense_date.date().isoformat() if r.expense_date else None,
                "description": r.description,
                "receipt_url": r.receipt_url,
                "created_at": str(r.created_at),
            }
            for r in rows
        ]

    @staticmethod
    def create_expense(db: Session, store_id: int, user_id: Optional[int], data: GroceryExpenseCreate) -> dict:
        code = generate_next_id(db, store_id, "expense")
        exp_dt = datetime.datetime.now(datetime.timezone.utc)
        if data.expense_date:
            try:
                exp_dt = datetime.datetime.fromisoformat(data.expense_date.replace("Z", "+00:00"))
            except Exception:
                pass
        row = GroceryExpense(
            store_id=store_id,
            user_id=user_id,
            expense_code=code,
            category=data.category.strip(),
            amount=round(float(data.amount), 2),
            payment_method=(data.payment_method or "CASH").upper(),
            expense_date=exp_dt,
            description=data.description.strip() if data.description else None,
            receipt_url=data.receipt_url,
        )
        db.add(row)
        db.flush()

        db.add(
            GroceryPayment(
                store_id=store_id,
                user_id=user_id,
                reference_type="expense",
                reference_id=row.id,
                reference_code=code,
                amount=row.amount,
                payment_method=row.payment_method,
                payment_date=exp_dt,
                notes=row.category,
            )
        )
        db.commit()
        db.refresh(row)
        return {
            "id": row.id,
            "store_id": row.store_id,
            "user_id": row.user_id,
            "expense_code": row.expense_code,
            "category": row.category,
            "amount": row.amount,
            "payment_method": row.payment_method,
            "expense_date": row.expense_date.date().isoformat() if row.expense_date else None,
            "description": row.description,
            "created_at": str(row.created_at),
        }

    @staticmethod
    def delete_expense(db: Session, store_id: int, expense_id: int) -> dict:
        row = db.query(GroceryExpense).filter(
            GroceryExpense.id == expense_id,
            GroceryExpense.store_id == store_id,
            GroceryExpense.is_deleted == False,
        ).first()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        row.is_deleted = True
        row.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        return {"success": True, "message": "Expense deleted"}

    @staticmethod
    def list_payments(db: Session, store_id: int, reference_type: Optional[str] = None, limit: int = 100) -> List[dict]:
        q = db.query(GroceryPayment).filter(GroceryPayment.store_id == store_id)
        if reference_type:
            q = q.filter(GroceryPayment.reference_type == reference_type)
        rows = q.order_by(GroceryPayment.payment_date.desc(), GroceryPayment.id.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "store_id": r.store_id,
                "user_id": r.user_id,
                "reference_type": r.reference_type,
                "reference_id": r.reference_id,
                "reference_code": r.reference_code,
                "amount": r.amount,
                "payment_method": r.payment_method,
                "payment_date": r.payment_date.date().isoformat() if r.payment_date else None,
                "notes": r.notes,
                "created_at": str(r.created_at),
            }
            for r in rows
        ]

    @staticmethod
    def record_payment(db: Session, store_id: int, user_id: Optional[int], data: GroceryPaymentCreate) -> dict:
        row = GroceryPayment(
            store_id=store_id,
            user_id=user_id,
            reference_type=data.reference_type.strip(),
            reference_id=data.reference_id,
            reference_code=data.reference_code,
            amount=round(float(data.amount), 2),
            payment_method=(data.payment_method or "CASH").upper(),
            notes=data.notes,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return {
            "id": row.id,
            "store_id": row.store_id,
            "user_id": row.user_id,
            "reference_type": row.reference_type,
            "reference_id": row.reference_id,
            "reference_code": row.reference_code,
            "amount": row.amount,
            "payment_method": row.payment_method,
            "payment_date": row.payment_date.date().isoformat() if row.payment_date else None,
            "notes": row.notes,
            "created_at": str(row.created_at),
        }
