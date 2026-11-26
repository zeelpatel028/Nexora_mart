import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.partner import Customer, Supplier, DebitCustomer
from ..models.finance import Payment
from ..models.invoice import Invoice
from ..schemas.partner_schema import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerPaymentRequest,
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
    customers = q.order_by(Customer.name).all()
    cust_ids = [c.id for c in customers]
    inv_map = {}
    if cust_ids:
        rows = db.query(
            Invoice.customer_id,
            func.count(Invoice.id),
            func.coalesce(func.sum(Invoice.paid_amount), 0.0),
            func.max(Invoice.invoice_date),
        ).filter(
            Invoice.store_id == store.id,
            Invoice.customer_id.in_(cust_ids),
        ).group_by(Invoice.customer_id).all()
        for cid, cnt, paid_sum, max_dt in rows:
            inv_map[cid] = (int(cnt or 0), float(paid_sum or 0.0), max_dt)

    for cust in customers:
        total_bills, total_paid, last_dt = inv_map.get(cust.id, (0, 0.0, None))
        cust.total_outstanding = max(0.0, float(cust.balance or 0.0))
        cust.total_paid = total_paid
        cust.total_bills = total_bills
        cust.transaction_count = total_bills
        cust.last_transaction_date = last_dt.isoformat() if last_dt else None
    return customers

@router.get("/customers/{id}")
def get_customer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = db.query(Customer).filter(Customer.id == id, Customer.store_id == store.id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")

    invoices = db.query(Invoice).filter(Invoice.customer_id == cust.id, Invoice.store_id == store.id).all()
    payments = db.query(Payment).filter(
        Payment.store_id == store.id,
        Payment.reference_type.in_(["CUSTOMER_PAYMENT", "DEBIT_CUSTOMER", "INVOICE"]),
        Payment.reference_id == cust.id
    ).all()

    total_bills = len(invoices)
    total_paid = sum(float(inv.paid_amount or 0.0) for inv in invoices)
    total_outstanding = max(0.0, float(cust.balance or 0.0))
    transaction_count = total_bills + len(payments)

    last_date = None
    if invoices:
        last_inv = max(invoices, key=lambda i: i.invoice_date or datetime.datetime.min)
        last_date = last_inv.invoice_date.isoformat() if last_inv.invoice_date else None

    return {
        "id": cust.id,
        "store_id": cust.store_id,
        "name": cust.name,
        "phone": cust.phone,
        "email": cust.email,
        "address": cust.address,
        "gst_number": cust.gst_number,
        "credit_limit": cust.credit_limit,
        "balance": cust.balance,
        "is_active": cust.is_active,
        "total_outstanding": total_outstanding,
        "total_paid": total_paid,
        "total_bills": total_bills,
        "transaction_count": transaction_count,
        "last_transaction_date": last_date
    }

@router.get("/customers/{id}/ledger")
def get_customer_ledger(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = db.query(Customer).filter(Customer.id == id, Customer.store_id == store.id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")

    invoices = db.query(Invoice).filter(Invoice.customer_id == cust.id, Invoice.store_id == store.id).order_by(Invoice.id.desc()).all()

    deb = db.query(DebitCustomer).filter(DebitCustomer.customer_id == cust.id, DebitCustomer.store_id == store.id).first()
    deb_id = deb.id if deb else None

    pay_query = db.query(Payment).filter(
        Payment.store_id == store.id,
        (
            (Payment.reference_type == "CUSTOMER_PAYMENT") & (Payment.reference_id == cust.id)
            | (Payment.reference_type == "DEBIT_CUSTOMER") & (Payment.reference_id == deb_id)
        )
    ).order_by(Payment.id.desc()).all() if deb_id else db.query(Payment).filter(
        Payment.store_id == store.id,
        Payment.reference_type == "CUSTOMER_PAYMENT",
        Payment.reference_id == cust.id
    ).order_by(Payment.id.desc()).all()

    bills_data = []
    total_billed = 0.0
    total_paid_bills = 0.0
    for inv in invoices:
        tot = float(inv.total_amount or 0.0)
        pd = float(inv.paid_amount or 0.0)
        rem = max(0.0, tot - pd)
        total_billed += tot
        total_paid_bills += pd
        bills_data.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat() if inv.invoice_date else None,
            "total_amount": tot,
            "paid_amount": pd,
            "remaining_amount": rem,
            "payment_status": inv.payment_status or "PAID",
            "payment_method": inv.payment_method or "CASH",
            "notes": inv.notes,
            "items_count": len(inv.items)
        })

    payments_data = []
    for p in pay_query:
        amt = float(p.amount or 0.0)
        p_date = p.transaction_date or p.created_at or datetime.datetime.now(datetime.timezone.utc)
        payments_data.append({
            "id": p.id,
            "reference_type": p.reference_type,
            "reference_id": p.reference_id,
            "amount": amt,
            "payment_method": p.payment_method or "CASH",
            "transaction_date": p_date.isoformat() if hasattr(p_date, 'isoformat') else str(p_date),
            "notes": p.notes
        })

    total_outstanding = max(0.0, float(cust.balance or 0.0))

    return {
        "customer": {
            "id": cust.id,
            "store_id": cust.store_id,
            "name": cust.name,
            "phone": cust.phone,
            "email": cust.email,
            "address": cust.address,
            "gst_number": cust.gst_number,
            "credit_limit": cust.credit_limit,
            "balance": cust.balance
        },
        "summary": {
            "total_outstanding": total_outstanding,
            "total_paid": total_paid_bills,
            "total_billed": total_billed,
            "total_bills": len(bills_data),
            "total_payments": len(payments_data),
            "total_transactions": len(bills_data) + len(payments_data)
        },
        "bills": bills_data,
        "payments": payments_data
    }

@router.post("/customers/{id}/payment")
def record_customer_payment(
    id: int,
    request: CustomerPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    cust = db.query(Customer).filter(Customer.id == id, Customer.store_id == store.id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

    amount = float(request.amount)
    now = datetime.datetime.now(datetime.timezone.utc)
    if request.payment_date:
        try:
            now = datetime.datetime.fromisoformat(request.payment_date.replace('Z', '+00:00'))
        except Exception:
            pass

    previous_balance = float(cust.balance or 0.0)
    cust.balance = max(0.0, previous_balance - amount)

    deb = db.query(DebitCustomer).filter(DebitCustomer.customer_id == cust.id, DebitCustomer.store_id == store.id).first()
    if deb:
        deb.outstanding_balance = max(0.0, float(deb.outstanding_balance or 0.0) - amount)
        deb.last_payment_date = now
        if deb.outstanding_balance <= 0:
            deb.status = "CLEARED"

    unpaid_invoices = db.query(Invoice).filter(
        Invoice.customer_id == cust.id,
        Invoice.store_id == store.id,
        Invoice.payment_status.in_(["UNPAID", "PARTIAL", "DEBIT"])
    ).order_by(Invoice.id.asc()).all()

    remaining_payment = amount
    allocated_bills = []
    for inv in unpaid_invoices:
        tot = float(inv.total_amount or 0.0)
        pd = float(inv.paid_amount or 0.0)
        unpaid = max(0.0, tot - pd)
        if unpaid <= 0:
            continue

        allocation = min(remaining_payment, unpaid)
        inv.paid_amount = pd + allocation
        if inv.paid_amount >= tot:
            inv.payment_status = "PAID"
        elif inv.paid_amount > 0:
            inv.payment_status = "PARTIAL"

        allocated_bills.append({
            "bill_id": inv.id,
            "invoice_number": inv.invoice_number,
            "allocated_amount": allocation,
            "new_paid_amount": inv.paid_amount,
            "new_status": inv.payment_status
        })

        remaining_payment -= allocation
        if remaining_payment <= 0:
            break

    pay = Payment(
        store_id=store.id,
        reference_type="CUSTOMER_PAYMENT",
        reference_id=cust.id,
        amount=amount,
        payment_method=(request.payment_method or "CASH").upper(),
        transaction_date=now,
        notes=request.notes or f"Customer payment from {cust.name}"
    )
    db.add(pay)
    db.commit()
    db.refresh(cust)

    return {
        "success": True,
        "message": f"Successfully received payment of ₹ {amount:,.2f} from {cust.name}",
        "payment_id": pay.id,
        "amount_paid": amount,
        "previous_balance": previous_balance,
        "remaining_balance": cust.balance,
        "allocated_bills": allocated_bills
    }


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

@router.get("/suppliers/{id}", response_model=SupplierResponse)
def get_supplier(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = StoreService.get_user_store(db, current_user)
    supp = db.query(Supplier).filter(Supplier.id == id, Supplier.store_id == store.id).first()
    if not supp:
        raise HTTPException(status_code=404, detail="Supplier not found.")
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


