from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import (
    GroceryCustomerCreate,
    GroceryCustomerUpdate,
    GroceryCustomerResponse,
    GroceryCustomerDashboard,
    CustomerPaymentPayload
)
from .service import GroceryKhataCustomerService

router = APIRouter(prefix="/customers", tags=["Grocery Khata Customers"])


@router.get("/dashboard", response_model=GroceryCustomerDashboard)
def get_customer_dashboard(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Khata Customer Dashboard metrics: Total Customers, Pending Bills, Pending Amount."""
    return GroceryKhataCustomerService.get_dashboard_metrics(db, store.id)


@router.get("", response_model=List[GroceryCustomerResponse])
def list_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List Khata customers with search, pagination, pending bill count and balance."""
    items, total = GroceryKhataCustomerService.list_customers(db, store.id, search, page, limit)
    return items


@router.post("", response_model=GroceryCustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: GroceryCustomerCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Add a new Khata customer with auto ID: {store_code}_KHT_0001."""
    return GroceryKhataCustomerService.create_customer(db, store.id, payload)


@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: int,
    tab: Optional[str] = Query(None, description="All | paid | unpaid"),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Fetch complete customer detail with filter tabs: All / Paid / Unpaid."""
    return GroceryKhataCustomerService.get_customer_detail(db, store.id, customer_id, tab)


@router.post("/{customer_id}/pay")
def record_customer_payment(
    customer_id: int,
    payload: CustomerPaymentPayload,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Record payment against customer unpaid bills."""
    return GroceryKhataCustomerService.record_payment(db, store.id, customer_id, payload)


@router.get("/{customer_id}/statement/pdf")
def get_customer_statement_pdf(
    customer_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Generate customer statement PDF for WhatsApp / sharing."""
    pdf_bytes = GroceryKhataCustomerService.generate_statement_pdf(db, store.id, customer_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=customer_statement_{customer_id}.pdf"}
    )
