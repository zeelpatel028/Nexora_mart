import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...models.partner import Customer
from ...models.invoice import Invoice
from ...models.ledger import CustomerLedger
from ...schemas.customer_schema import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerPaymentRequest,
    CustomerStatementResponse
)
from ...services.prefix_service import PrefixService
from ...services.payment_service import PaymentService

router = APIRouter(prefix="/customers", tags=["Customers & Khata"])

@router.get("/dashboard")
def get_customer_dashboard_metrics(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Top-level metrics for Khata Customer Dashboard: Total Customers, Pending Bills, Pending Amount."""
    total_customers = db.query(Customer).filter(Customer.store_id == store.id, Customer.is_active == True).count()
    
    pending_invoices = db.query(Invoice).filter(
        Invoice.store_id == store.id,
        Invoice.customer_id != None,
        Invoice.payment_status.in_(["PARTIAL", "UNPAID"])
    ).all()

    total_pending_bills = len(pending_invoices)
    total_pending_amount = sum(max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0)) for inv in pending_invoices)

    return {
        "total_customers": total_customers,
        "total_pending_bills": total_pending_bills,
        "total_pending_amount": round(total_pending_amount, 2)
    }

@router.get("", response_model=List[CustomerResponse])
def list_customers(
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """List Khata customers with pending bills, total bill count, and current balance."""
    query = db.query(Customer).filter(Customer.store_id == store.id, Customer.is_active == True)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(Customer.name.ilike(term), Customer.phone.ilike(term)))

    offset = (max(page, 1) - 1) * limit
    customers = query.order_by(Customer.name).offset(offset).limit(limit).all()

    results = []
    for c in customers:
        invoices = db.query(Invoice).filter(Invoice.customer_id == c.id, Invoice.store_id == store.id).all()
        pending_invoices = [inv for inv in invoices if inv.payment_status in ("PARTIAL", "UNPAID")]
        pending_amt = sum(max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0)) for inv in pending_invoices)

        res = CustomerResponse(
            id=c.id,
            store_id=c.store_id,
            name=c.name,
            customer_code=getattr(c, "customer_code", None) or f"TM_DC_{str(c.id).zfill(4)}",
            phone=c.phone,
            email=c.email,
            address=c.address,
            gst_number=c.gst_number,
            credit_limit=c.credit_limit or 0.0,
            balance=round(pending_amt if pending_amt > 0 else (c.balance or 0.0), 2),
            is_active=c.is_active,
            total_outstanding=round(pending_amt, 2),
            total_paid=sum(float(inv.paid_amount or 0.0) for inv in invoices),
            total_bills=len(invoices),
            transaction_count=len(invoices)
        )
        results.append(res)
    return results

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Add a new Khata customer with auto-generated ID using store customer prefix (TM_DC_0001)."""
    customer_code = PrefixService.generate_id(db, store.id, "customer")

    customer = Customer(
        store_id=store.id,
        name=data.name.strip(),
        phone=data.phone.strip() if data.phone else None,
        email=data.email.strip() if data.email else None,
        address=data.address.strip() if data.address else None,
        gst_number=data.gst_number.strip() if data.gst_number else None,
        credit_limit=data.credit_limit or 0.0,
        balance=0.0,
        is_active=True
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return CustomerResponse(
        id=customer.id,
        store_id=customer.store_id,
        name=customer.name,
        customer_code=customer_code,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        gst_number=customer.gst_number,
        credit_limit=customer.credit_limit,
        balance=customer.balance,
        is_active=customer.is_active,
        total_outstanding=0.0,
        total_paid=0.0,
        total_bills=0,
        transaction_count=0
    )

@router.get("/{customer_id}/details")
def get_customer_details(
    customer_id: int,
    filter_status: Optional[str] = "ALL",  # ALL, PAID, UNPAID, PARTIAL
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Khata Customer Details view:
    - Summary: Total Bill Count, Total Bill Amount, Pending Bill Count, Pending Bill Amount, Total Paid Amount
    - Filtered Invoice Cards
    """
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.store_id == store.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    invoices = db.query(Invoice).filter(Invoice.customer_id == customer.id, Invoice.store_id == store.id).order_by(Invoice.id.desc()).all()

    total_bill_count = len(invoices)
    total_bill_amount = sum(float(inv.total_amount or 0.0) for inv in invoices)
    total_paid_amount = sum(float(inv.paid_amount or 0.0) for inv in invoices)

    pending_invoices = [inv for inv in invoices if inv.payment_status in ("PARTIAL", "UNPAID")]
    pending_bill_count = len(pending_invoices)
    pending_bill_amount = sum(max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0)) for inv in pending_invoices)

    filtered_invoices = invoices
    if filter_status and filter_status.upper() != "ALL":
        fs = filter_status.upper()
        if fs == "PAID":
            filtered_invoices = [inv for inv in invoices if inv.payment_status == "PAID"]
        elif fs == "UNPAID":
            filtered_invoices = [inv for inv in invoices if inv.payment_status == "UNPAID"]
        elif fs == "PARTIAL":
            filtered_invoices = [inv for inv in invoices if inv.payment_status == "PARTIAL"]

    invoice_cards = [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "date": inv.invoice_date.strftime("%d %b %Y"),
            "total_amount": float(inv.total_amount or 0.0),
            "paid_amount": float(inv.paid_amount or 0.0),
            "pending_amount": max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0)),
            "payment_status": inv.payment_status or "PAID"
        }
        for inv in filtered_invoices
    ]

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "balance": round(pending_bill_amount, 2)
        },
        "summary": {
            "total_bill_count": total_bill_count,
            "total_bill_amount": round(total_bill_amount, 2),
            "pending_bill_count": pending_bill_count,
            "pending_bill_amount": round(pending_bill_amount, 2),
            "total_paid_amount": round(total_paid_amount, 2)
        },
        "invoices": invoice_cards
    }

@router.post("/{customer_id}/receive-payment")
def receive_customer_payment(
    customer_id: int,
    data: CustomerPaymentRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Receive payment against customer Khata and update ledger."""
    return PaymentService.record_customer_payment(
        db=db,
        store=store,
        user=user,
        customer_id=customer_id,
        amount=data.amount,
        payment_method=data.payment_method,
        notes=data.notes
    )

@router.get("/{customer_id}/statement")
def get_customer_statement(
    customer_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Generate comprehensive customer statement formatted for WhatsApp and printable sharing."""
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.store_id == store.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    invoices = db.query(Invoice).filter(Invoice.customer_id == customer.id, Invoice.store_id == store.id).all()
    ledgers = db.query(CustomerLedger).filter(CustomerLedger.customer_id == customer.id, CustomerLedger.store_id == store.id).order_by(CustomerLedger.id.desc()).all()

    total_billed = sum(float(inv.total_amount or 0.0) for inv in invoices)
    total_paid = sum(float(inv.paid_amount or 0.0) for inv in invoices)
    pending = max(0.0, total_billed - total_paid)

    return {
        "store_name": store.name,
        "store_phone": store.owner.phone if store.owner else "",
        "customer_name": customer.name,
        "customer_phone": customer.phone,
        "statement_date": datetime.date.today().strftime("%d %b %Y"),
        "total_bills": len(invoices),
        "total_billed_amount": round(total_billed, 2),
        "total_paid_amount": round(total_paid, 2),
        "pending_amount": round(pending, 2),
        "bills": [
            {
                "invoice_number": inv.invoice_number,
                "date": inv.invoice_date.strftime("%d-%m-%Y"),
                "total_amount": inv.total_amount,
                "paid_amount": inv.paid_amount,
                "pending_amount": max(0.0, inv.total_amount - inv.paid_amount),
                "status": inv.payment_status
            }
            for inv in invoices
        ],
        "ledger_entries": [
            {
                "date": l.transaction_date.strftime("%d-%m-%Y"),
                "type": l.transaction_type,
                "ref": l.reference_id,
                "debit": l.debit,
                "credit": l.credit,
                "balance": l.balance,
                "description": l.description
            }
            for l in ledgers
        ]
    }
