import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...models.partner import Supplier
from ...models.purchase import Purchase
from ...models.ledger import SupplierLedger
from ...schemas.supplier_schema import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierPaymentRequest
)
from ...services.prefix_service import PrefixService
from ...services.payment_service import PaymentService

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("/dashboard")
def get_supplier_dashboard_metrics(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Supplier Dashboard Metrics: Total Suppliers, Pending Orders, Pending Payments, Total Purchase Amount."""
    total_suppliers = db.query(Supplier).filter(Supplier.store_id == store.id, Supplier.is_active == True).count()
    
    purchases = db.query(Purchase).filter(Purchase.store_id == store.id).all()
    pending_orders = [p for p in purchases if not (p.notes and "RECEIVED" in p.notes)]
    pending_payments = [p for p in purchases if p.payment_status in ("Pending", "Partially Paid", "UNPAID", "PARTIAL")]

    total_purchase_amount = sum(float(p.total_amount or 0.0) for p in purchases)
    total_pending_payments = sum(max(0.0, float(p.total_amount or 0.0) - float(p.paid_amount or 0.0)) for p in pending_payments)

    return {
        "total_suppliers": total_suppliers,
        "total_pending_orders": len(pending_orders),
        "total_pending_payments": round(total_pending_payments, 2),
        "total_purchase_amount": round(total_purchase_amount, 2)
    }

@router.get("", response_model=List[SupplierResponse])
def list_suppliers(
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """List suppliers with order counts and pending payable balance."""
    query = db.query(Supplier).filter(Supplier.store_id == store.id, Supplier.is_active == True)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(Supplier.name.ilike(term), Supplier.company_name.ilike(term), Supplier.phone.ilike(term)))

    offset = (max(page, 1) - 1) * limit
    suppliers = query.order_by(Supplier.name).offset(offset).limit(limit).all()

    results = []
    for s in suppliers:
        purchases = db.query(Purchase).filter(Purchase.supplier_id == s.id, Purchase.store_id == store.id).all()
        pending_amt = sum(max(0.0, float(p.total_amount or 0.0) - float(p.paid_amount or 0.0)) for p in purchases)

        res = SupplierResponse(
            id=s.id,
            store_id=s.store_id,
            name=s.name,
            supplier_code=getattr(s, "supplier_code", None) or f"TM_SUP_{str(s.id).zfill(4)}",
            company_name=s.company_name,
            phone=s.phone,
            email=s.email,
            address=s.address,
            gst_number=s.gst_number,
            balance=round(pending_amt if pending_amt > 0 else (s.balance or 0.0), 2),
            is_active=s.is_active,
            total_orders_count=len(purchases),
            total_purchase_amount=sum(float(p.total_amount or 0.0) for p in purchases),
            pending_payment_amount=round(pending_amt, 2)
        )
        results.append(res)
    return results

@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Add a new supplier with auto-generated ID using store supplier prefix (TM_SUP_0001)."""
    supplier_code = PrefixService.generate_id(db, store.id, "supplier")

    supplier = Supplier(
        store_id=store.id,
        name=data.name.strip(),
        company_name=data.company_name.strip() if data.company_name else None,
        phone=data.phone.strip() if data.phone else None,
        email=data.email.strip() if data.email else None,
        address=data.address.strip() if data.address else None,
        gst_number=data.gst_number.strip() if data.gst_number else None,
        balance=0.0,
        is_active=True
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return SupplierResponse(
        id=supplier.id,
        store_id=supplier.store_id,
        name=supplier.name,
        supplier_code=supplier_code,
        company_name=supplier.company_name,
        phone=supplier.phone,
        email=supplier.email,
        address=supplier.address,
        gst_number=supplier.gst_number,
        balance=supplier.balance,
        is_active=supplier.is_active,
        total_orders_count=0,
        total_purchase_amount=0.0,
        pending_payment_amount=0.0
    )

@router.get("/{supplier_id}/details")
def get_supplier_details(
    supplier_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Supplier details with purchase history and payment history."""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.store_id == store.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    purchases = db.query(Purchase).filter(Purchase.supplier_id == supplier.id, Purchase.store_id == store.id).order_by(Purchase.id.desc()).all()
    ledgers = db.query(SupplierLedger).filter(SupplierLedger.supplier_id == supplier.id, SupplierLedger.store_id == store.id).order_by(SupplierLedger.id.desc()).all()

    total_purchase = sum(float(p.total_amount or 0.0) for p in purchases)
    total_paid = sum(float(p.paid_amount or 0.0) for p in purchases)
    pending = max(0.0, total_purchase - total_paid)

    return {
        "supplier": {
            "id": supplier.id,
            "name": supplier.name,
            "company_name": supplier.company_name,
            "phone": supplier.phone,
            "email": supplier.email,
            "address": supplier.address,
            "gst_number": supplier.gst_number,
            "balance": round(pending, 2)
        },
        "summary": {
            "total_purchase_amount": round(total_purchase, 2),
            "total_paid_amount": round(total_paid, 2),
            "pending_amount": round(pending, 2),
            "orders_count": len(purchases)
        },
        "orders": [
            {
                "id": p.id,
                "order_number": p.invoice_number,
                "date": p.purchase_date.strftime("%d %b %Y"),
                "total_amount": p.total_amount,
                "paid_amount": p.paid_amount,
                "pending_amount": max(0.0, p.total_amount - p.paid_amount),
                "order_status": "Received" if (p.notes and "RECEIVED" in p.notes) else "Pending",
                "payment_status": p.payment_status
            }
            for p in purchases
        ],
        "ledger": [
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

@router.post("/{supplier_id}/pay")
def pay_supplier(
    supplier_id: int,
    data: SupplierPaymentRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Record payment to supplier and reduce pending balance."""
    return PaymentService.record_supplier_payment(
        db=db,
        store=store,
        user=user,
        supplier_id=supplier_id,
        amount=data.amount,
        payment_method=data.payment_method,
        notes=data.notes
    )

@router.get("/{supplier_id}/statement")
def get_supplier_statement(
    supplier_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Generate supplier account statement for WhatsApp and download."""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.store_id == store.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    purchases = db.query(Purchase).filter(Purchase.supplier_id == supplier.id, Purchase.store_id == store.id).all()
    ledgers = db.query(SupplierLedger).filter(SupplierLedger.supplier_id == supplier.id, SupplierLedger.store_id == store.id).order_by(SupplierLedger.id.desc()).all()

    total_purchase = sum(float(p.total_amount or 0.0) for p in purchases)
    total_paid = sum(float(p.paid_amount or 0.0) for p in purchases)
    pending = max(0.0, total_purchase - total_paid)

    return {
        "store_name": store.name,
        "store_phone": store.owner.phone if store.owner else "",
        "supplier_name": supplier.name,
        "company_name": supplier.company_name,
        "phone": supplier.phone,
        "statement_date": datetime.date.today().strftime("%d %b %Y"),
        "total_purchase_amount": round(total_purchase, 2),
        "total_paid_amount": round(total_paid, 2),
        "pending_balance": round(pending, 2),
        "orders": [
            {
                "order_number": p.invoice_number,
                "date": p.purchase_date.strftime("%d-%m-%Y"),
                "total_amount": p.total_amount,
                "paid_amount": p.paid_amount,
                "pending_amount": max(0.0, p.total_amount - p.paid_amount),
                "status": p.payment_status
            }
            for p in purchases
        ],
        "ledger": [
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
