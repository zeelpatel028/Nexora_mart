"""
Grocery Store Owner Dashboard Metrics & Reports
"""
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...dependencies.database import get_db
from ...dependencies.store_access import get_current_store
from ...models.store import Store
from .grocery_billing.models import GroceryBill
from .grocery_product.models import GroceryProduct, GroceryProductBatch
from .grocery_khata_customer.models import GroceryCustomer
from .grocery_purchase_order.models import GroceryPurchaseOrder

router = APIRouter(prefix="/dashboard", tags=["Grocery Dashboard"])


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """
    Dashboard high-level metrics for grocery store owner:
    - Today's sales
    - Pending khata amount
    - Low-stock items count
    - Items expiring soon
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # 1. Today's sales
    today_sales_val = db.query(func.sum(GroceryBill.grand_total)).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.created_at >= today_start,
        GroceryBill.is_deleted == False
    ).scalar() or 0.0

    today_bills_count = db.query(func.count(GroceryBill.id)).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.created_at >= today_start,
        GroceryBill.is_deleted == False
    ).scalar() or 0

    # 2. Pending Khata Amount
    pending_khata_val = db.query(func.sum(GroceryBill.grand_total)).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.customer_type == "khata",
        GroceryBill.payment_status == "unpaid",
        GroceryBill.is_deleted == False
    ).scalar() or 0.0

    # 3. Low-stock items
    low_stock_count = db.query(func.count(GroceryProduct.id)).filter(
        GroceryProduct.store_id == store.id,
        GroceryProduct.low_stock_enabled == True,
        GroceryProduct.available_stock <= GroceryProduct.low_stock_qty,
        GroceryProduct.is_deleted == False
    ).scalar() or 0

    # 4. Items expiring soon (next 30 days)
    thirty_days_later = now + datetime.timedelta(days=30)
    expiring_soon_count = db.query(func.count(GroceryProductBatch.id)).filter(
        GroceryProductBatch.store_id == store.id,
        GroceryProductBatch.expiry_date != None,
        GroceryProductBatch.expiry_date <= thirty_days_later,
        GroceryProductBatch.remaining_qty > 0,
        GroceryProductBatch.is_deleted == False
    ).scalar() or 0

    return {
        "today_sales": round(float(today_sales_val), 2),
        "today_bills_count": today_bills_count,
        "pending_khata_amount": round(float(pending_khata_val), 2),
        "low_stock_count": low_stock_count,
        "expiring_soon_count": expiring_soon_count
    }


@router.get("/reports/sales")
def get_sales_report(
    period: str = Query("daily", description="daily | monthly"),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    """Sales report for grocery store."""
    bills = db.query(GroceryBill).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.is_deleted == False
    ).order_by(GroceryBill.created_at.desc()).limit(100).all()

    total_revenue = sum(float(b.grand_total or 0.0) for b in bills)
    total_tax = sum(float(b.total_tax or 0.0) for b in bills)

    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "total_tax_collected": round(total_tax, 2),
        "bills_count": len(bills),
        "recent_bills": [
            {
                "invoice_code": b.invoice_code,
                "created_at": str(b.created_at),
                "grand_total": b.grand_total,
                "total_tax": b.total_tax,
                "payment_status": b.payment_status
            } for b in bills[:20]
        ]
    }
