from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from ....dependencies.database import get_db
from ....dependencies.store_access import get_current_store
from ....models.store import Store
from .schemas import (
    GrocerySupplierCreate,
    GrocerySupplierUpdate,
    GrocerySupplierResponse,
    GrocerySupplierDashboard
)
from .service import GrocerySupplierService

router = APIRouter(prefix="/suppliers", tags=["Grocery Suppliers"])


@router.get("/dashboard", response_model=GrocerySupplierDashboard)
def get_supplier_dashboard(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Supplier Dashboard summary: Total Suppliers, Pending Orders, Pending Payments, Total Purchase Amount."""
    return GrocerySupplierService.get_dashboard_metrics(db, store.id)


@router.get("", response_model=List[GrocerySupplierResponse])
def list_suppliers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """List grocery suppliers with search, pagination, order counts, and pending payment amounts."""
    items, total = GrocerySupplierService.list_suppliers(db, store.id, search, page, limit)
    return items


@router.post("", response_model=GrocerySupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: GrocerySupplierCreate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Add a new supplier with auto-generated ID: {store_code}_SUP_0001."""
    return GrocerySupplierService.create_supplier(db, store.id, payload)


@router.get("/{supplier_id}")
def get_supplier_detail(
    supplier_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Fetch complete supplier details and list of purchase orders (All / Paid / Pending)."""
    return GrocerySupplierService.get_supplier_detail(db, store.id, supplier_id)


@router.put("/{supplier_id}", response_model=GrocerySupplierResponse)
def update_supplier(
    supplier_id: int,
    payload: GrocerySupplierUpdate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Update supplier details."""
    return GrocerySupplierService.update_supplier(db, store.id, supplier_id, payload)


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Soft delete supplier."""
    return GrocerySupplierService.delete_supplier(db, store.id, supplier_id)


@router.get("/{supplier_id}/statement/pdf")
def get_supplier_statement_pdf(
    supplier_id: int,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Generate supplier purchase statement as PDF for sharing / WhatsApp."""
    pdf_bytes = GrocerySupplierService.generate_statement_pdf(db, store.id, supplier_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=supplier_statement_{supplier_id}.pdf"}
    )
