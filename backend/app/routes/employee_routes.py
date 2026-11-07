from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.employee import Employee
from ..services.store_service import StoreService

router = APIRouter(prefix="/employees", tags=["Employees"])

class EmployeeCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    role: Optional[str] = "staff"
    salary: Optional[float] = 0.0

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None

class EmployeeResponse(BaseModel):
    id: int
    store_id: int
    name: str
    email: Optional[str] = None
    phone: str
    role: str
    salary: float
    is_active: bool

    class Config:
        from_attributes = True

@router.get("", response_model=List[EmployeeResponse], include_in_schema=False)
@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    return db.query(Employee).filter(Employee.store_id == store.id, Employee.is_active == True).all()

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    request: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    emp = Employee(
        store_id=store.id,
        name=request.name.strip(),
        phone=request.phone.strip(),
        email=request.email.strip() if request.email else None,
        role=request.role or "staff",
        salary=request.salary or 0.0,
        is_active=True
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@router.put("/{id}", response_model=EmployeeResponse)
def update_employee(
    id: int,
    request: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    emp = db.query(Employee).filter(Employee.id == id, Employee.store_id == store.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")
    if request.name is not None:
        emp.name = request.name.strip()
    if request.phone is not None:
        emp.phone = request.phone.strip()
    if request.email is not None:
        emp.email = request.email.strip()
    if request.role is not None:
        emp.role = request.role
    if request.salary is not None:
        emp.salary = request.salary
    if request.is_active is not None:
        emp.is_active = request.is_active
    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{id}")
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    emp = db.query(Employee).filter(Employee.id == id, Employee.store_id == store.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")
    emp.is_active = False
    db.commit()
    return {"message": "Employee removed successfully."}

