from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...schemas.invoice_schema import InvoiceCreate, InvoiceResponse
from ...services.billing_service import BillingService
from ...services.sale_service import SaleService

router = APIRouter(prefix="/billing", tags=["Billing & Invoices"])

@router.post("/make-bill", status_code=status.HTTP_201_CREATED)
def make_bill(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """
    Generate customer bill (Walk-in or Khata customer).
    Calculates tax separately for each line item using standard GST formula:
    Taxable = Selling Price / (1 + GST / 100), GST Amount = Selling Price - Taxable.
    Atomically updates stock, logs stock movement, and updates Khata ledger.
    """
    return BillingService.make_bill(db, store, user, data)

@router.get("/invoices")
def list_invoices(
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """List store sales invoices with pagination and search."""
    items, total = SaleService.list_sales(
        db=db,
        store_id=store.id,
        customer_id=customer_id,
        payment_status=payment_status,
        search=search,
        page=page,
        limit=limit
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/invoices/{invoice_id}")
def get_invoice_detail(
    invoice_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Fetch complete invoice data formatted for printable templates, sharing, and PDF generation."""
    return BillingService.get_invoice_detail(db, store.id, invoice_id)
