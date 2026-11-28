from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.auth import get_current_user
from ....dependencies.store_access import get_current_store
from ....models.user import User
from ....models.store import Store
from .schemas import MakeBillRequest, BillResponse
from .service import GroceryBillingService

router = APIRouter(prefix="/billing", tags=["Grocery Billing & Invoices"])


@router.post("/make-bill", status_code=status.HTTP_201_CREATED)
def make_bill(
    payload: MakeBillRequest,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Generate customer bill (Walk-in or Khata).
    Calculates tax separately for each line item (Base Price without tax + GST).
    Atomically updates stock, logs stock movement, and generates S001_INV_0001 invoice code.
    """
    return GroceryBillingService.make_bill(db, store, user.id, payload)


@router.get("/invoices")
def list_invoices(
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List invoices with search, date filters, and pagination."""
    items, total = GroceryBillingService.list_invoices(
        db, store.id, customer_id, payment_status, search, page, limit, date, start_date, end_date
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/invoices/{bill_id}")
def get_invoice_detail(
    bill_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Fetch invoice detail formatted for receipt display and templates."""
    return GroceryBillingService.get_invoice_detail(db, store.id, bill_id)


@router.get("/invoices/{bill_id}/pdf")
def get_invoice_pdf(
    bill_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Download invoice as PDF with Base price (without tax) and GST amount."""
    pdf_bytes = GroceryBillingService.generate_pdf(db, store.id, bill_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=invoice_{bill_id}.pdf"}
    )
