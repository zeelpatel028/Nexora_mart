import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.partner import Customer, Supplier, DebitCustomer
from ..models.finance import Payment
from ..schemas.partner_schema import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse
)
from ..services.store_service import StoreService

router = APIRouter(tags=["Partners"])

# --- Customer Endpoints ---

@router.get("/customers", response_model=List[CustomerResponse])
@router.get("/customers/", response_model=List[CustomerResponse], include_in_schema=False)
def list_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    q = db.query(Customer).filter(Customer.store_id == store.id, Customer.is_active == True)
    if search:
        p = f"%{search.strip()}%"
        q = q.filter((Customer.name.ilike(p)) | (Customer.phone.ilike(p)))
    return q.order_by(Customer.name).all()

@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
@router.post("/customers/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_customer(
    request: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = Customer(
        store_id=store.id,
        name=request.name.strip(),
        phone=request.phone,
        email=request.email,
        address=request.address,
        gst_number=request.gst_number,
        credit_limit=request.credit_limit or 0.0,
        balance=0.0,
        is_active=True
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

@router.put("/customers/{id}", response_model=CustomerResponse)
def update_customer(
    id: int,
    request: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = db.query(Customer).filter(Customer.id == id, Customer.store_id == store.id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")
    if request.name is not None:
        cust.name = request.name.strip()
    if request.phone is not None:
        cust.phone = request.phone
    if request.email is not None:
        cust.email = request.email
    if request.address is not None:
        cust.address = request.address
    if request.credit_limit is not None:
        cust.credit_limit = request.credit_limit
    if request.is_active is not None:
        cust.is_active = request.is_active
    db.commit()
    db.refresh(cust)
    return cust

@router.delete("/customers/{id}")
def delete_customer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = db.query(Customer).filter(Customer.id == id, Customer.store_id == store.id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")
    cust.is_active = False
    db.commit()
    return {"message": "Customer deactivated successfully."}


# --- Supplier Endpoints ---

@router.get("/suppliers", response_model=List[SupplierResponse])
@router.get("/suppliers/", response_model=List[SupplierResponse], include_in_schema=False)
def list_suppliers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    q = db.query(Supplier).filter(Supplier.store_id == store.id, Supplier.is_active == True)
    if search:
        p = f"%{search.strip()}%"
        q = q.filter((Supplier.name.ilike(p)) | (Supplier.company_name.ilike(p)) | (Supplier.phone.ilike(p)))
    return q.order_by(Supplier.name).all()

@router.post("/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
@router.post("/suppliers/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_supplier(
    request: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    supp = Supplier(
        store_id=store.id,
        name=request.name.strip(),
        company_name=request.company_name,
        phone=request.phone,
        email=request.email,
        address=request.address,
        gst_number=request.gst_number,
        balance=0.0,
        is_active=True
    )
    db.add(supp)
    db.commit()
    db.refresh(supp)
    return supp

@router.put("/suppliers/{id}", response_model=SupplierResponse)
def update_supplier(
    id: int,
    request: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    supp = db.query(Supplier).filter(Supplier.id == id, Supplier.store_id == store.id).first()
    if not supp:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    if request.name is not None:
        supp.name = request.name.strip()
    if request.company_name is not None:
        supp.company_name = request.company_name
    if request.phone is not None:
        supp.phone = request.phone
    if request.email is not None:
        supp.email = request.email
    if request.address is not None:
        supp.address = request.address
    if request.is_active is not None:
        supp.is_active = request.is_active
    db.commit()
    db.refresh(supp)
    return supp

@router.delete("/suppliers/{id}")
def delete_supplier(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    supp = db.query(Supplier).filter(Supplier.id == id, Supplier.store_id == store.id).first()
    if not supp:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    supp.is_active = False
    db.commit()
    return {"message": "Supplier deactivated successfully."}


# --- Debit Customer Endpoints ---

@router.get("/debit-customers")
@router.get("/debit-customers/", include_in_schema=False)
def list_debit_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    query = db.query(DebitCustomer, Customer).join(Customer, DebitCustomer.customer_id == Customer.id).filter(
        DebitCustomer.store_id == store.id
    )
    if search:
        p = f"%{search.strip()}%"
        query = query.filter((Customer.name.ilike(p)) | (Customer.phone.ilike(p)))

    results = []
    for deb, cust in query.all():
        results.append({
            "id": deb.id,
            "store_id": deb.store_id,
            "customer_id": deb.customer_id,
            "customer_name": cust.name,
            "customer_phone": cust.phone,
            "customer_email": cust.email,
            "customer_address": cust.address,
            "total_credit_limit": deb.total_credit_limit,
            "outstanding_balance": deb.outstanding_balance,
            "last_payment_date": deb.last_payment_date,
            "due_date": deb.due_date,
            "status": deb.status,
            "notes": deb.notes
        })
    return results

@router.post("/debit-customers/{id}/payment")
def record_debit_payment(
    id: int,
    amount: float,
    payment_method: str = "CASH",
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    deb = db.query(DebitCustomer).filter(DebitCustomer.id == id, DebitCustomer.store_id == store.id).first()
    if not deb:
        raise HTTPException(status_code=404, detail="Debit customer record not found.")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

    deb.outstanding_balance = max(0.0, deb.outstanding_balance - amount)
    deb.last_payment_date = datetime.datetime.now(datetime.timezone.utc)
    if deb.outstanding_balance == 0:
        deb.status = "CLEARED"

    cust = db.query(Customer).filter(Customer.id == deb.customer_id).first()
    if cust:
        cust.balance = max(0.0, cust.balance - amount)

    pay = Payment(
        store_id=store.id,
        reference_type="DEBIT_CUSTOMER",
        reference_id=deb.id,
        amount=amount,
        payment_method=payment_method.upper(),
        notes=notes or f"Debit repayment for {cust.name if cust else 'customer'}"
    )
    db.add(pay)
    db.commit()
    return {
        "success": True,
        "message": f"Recorded payment of ₹ {amount:.2f}",
        "remaining_balance": deb.outstanding_balance
    }


