import datetime
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....config.database import Base
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from ....utils.id_generator import generate_next_id


class GroceryEmployee(Base):
    __tablename__ = "grocery_employees"
    __table_args__ = (
        Index("ix_grocery_employees_store_code", "store_id", "employee_code"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_code = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(80), default="Cashier", nullable=False)
    salary = Column(Float, default=0.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)


class GroceryEmployeeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = None
    role: str = "Cashier"
    salary: float = Field(0.0, ge=0)


router = APIRouter(prefix="/employees", tags=["Grocery Employees"])


@router.get("")
def list_employees(db: Session = Depends(get_db), store: Store = Depends(get_current_store)):
    rows = db.query(GroceryEmployee).filter(
        GroceryEmployee.store_id == store.id,
        GroceryEmployee.is_deleted == False,
    ).order_by(GroceryEmployee.id.desc()).all()
    return [
        {
            "id": r.id,
            "store_id": r.store_id,
            "employee_code": r.employee_code,
            "name": r.name,
            "phone": r.phone,
            "role": r.role,
            "salary": r.salary,
            "is_active": r.is_active,
        }
        for r in rows
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_employee(payload: GroceryEmployeeCreate, db: Session = Depends(get_db), store: Store = Depends(get_current_store)):
    code = generate_next_id(db, store.id, "employee")
    emp = GroceryEmployee(
        store_id=store.id,
        user_id=store.user_id,
        employee_code=code,
        name=payload.name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        role=payload.role.strip(),
        salary=float(payload.salary),
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return {
        "id": emp.id,
        "store_id": emp.store_id,
        "employee_code": emp.employee_code,
        "name": emp.name,
        "phone": emp.phone,
        "role": emp.role,
        "salary": emp.salary,
        "is_active": emp.is_active,
    }


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db), store: Store = Depends(get_current_store)):
    emp = db.query(GroceryEmployee).filter(
        GroceryEmployee.id == employee_id,
        GroceryEmployee.store_id == store.id,
        GroceryEmployee.is_deleted == False,
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.is_deleted = True
    db.commit()
    return {"success": True}
