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
from .grocery_finance.models import GroceryExpense

router = APIRouter(prefix="/dashboard", tags=["Grocery Dashboard"])


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

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

    all_agg = db.query(
        func.count(GroceryBill.id),
        func.coalesce(func.sum(GroceryBill.grand_total), 0.0),
    ).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.is_deleted == False
    ).first()

    pending_khata_val = db.query(func.sum(GroceryBill.grand_total)).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.customer_type == "khata",
        GroceryBill.payment_status == "unpaid",
        GroceryBill.is_deleted == False
    ).scalar() or 0.0

    pending_khata_bills = db.query(func.count(GroceryBill.id)).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.customer_type == "khata",
        GroceryBill.payment_status == "unpaid",
        GroceryBill.is_deleted == False
    ).scalar() or 0

    low_stock_rows = db.query(GroceryProduct).filter(
        GroceryProduct.store_id == store.id,
        GroceryProduct.low_stock_enabled == True,
        GroceryProduct.available_stock <= GroceryProduct.low_stock_qty,
        GroceryProduct.is_deleted == False
    ).limit(20).all()

    thirty_days_later = now + datetime.timedelta(days=30)
    expiring_rows = db.query(GroceryProductBatch, GroceryProduct.name).join(
        GroceryProduct, GroceryProductBatch.product_id == GroceryProduct.id
    ).filter(
        GroceryProductBatch.store_id == store.id,
        GroceryProductBatch.expiry_date != None,
        GroceryProductBatch.expiry_date <= thirty_days_later,
        GroceryProductBatch.remaining_qty > 0,
        GroceryProductBatch.is_deleted == False
    ).order_by(GroceryProductBatch.expiry_date.asc()).limit(20).all()

    total_expenses = db.query(func.coalesce(func.sum(GroceryExpense.amount), 0.0)).filter(
        GroceryExpense.store_id == store.id,
        GroceryExpense.is_deleted == False,
    ).scalar() or 0.0

    return {
        "today_sales": round(float(today_sales_val), 2),
        "today_bills_count": today_bills_count,
        "total_bills_count": int(all_agg[0] or 0) if all_agg else 0,
        "total_revenue": round(float(all_agg[1] or 0.0), 2) if all_agg else 0.0,
        "pending_khata_amount": round(float(pending_khata_val), 2),
        "pending_khata_bills": pending_khata_bills,
        "low_stock_count": len(low_stock_rows),
        "expiring_soon_count": len(expiring_rows),
        "total_expenses": round(float(total_expenses), 2),
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "product_code": p.product_code,
                "available_stock": p.available_stock,
                "low_stock_qty": p.low_stock_qty,
                "unit": p.selling_unit,
            }
            for p in low_stock_rows
        ],
        "expiring_batches": [
            {
                "id": b.id,
                "product_id": b.product_id,
                "product_name": pname,
                "remaining_qty": b.remaining_qty,
                "expiry_date": str(b.expiry_date)[:10] if b.expiry_date else None,
            }
            for b, pname in expiring_rows
        ],
    }


@router.get("/reports/sales")
def get_sales_report(
    period: str = Query("daily", description="daily | weekly | monthly | yearly"),
    days: int = Query(7, ge=1, le=365),
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store)
):
    now = datetime.datetime.now(datetime.timezone.utc)
    cutoff = now - datetime.timedelta(days=days)

    agg = db.query(
        func.coalesce(func.sum(GroceryBill.grand_total), 0.0),
        func.coalesce(func.sum(GroceryBill.total_tax), 0.0),
        func.count(GroceryBill.id),
    ).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.created_at >= cutoff,
        GroceryBill.is_deleted == False
    ).first()

    recent_bills = db.query(GroceryBill).filter(
        GroceryBill.store_id == store.id,
        GroceryBill.created_at >= cutoff,
        GroceryBill.is_deleted == False
    ).order_by(GroceryBill.created_at.desc()).limit(50).all()

    daily_map = {}
    for b in recent_bills:
        day_str = str(b.created_at)[:10]
        if day_str not in daily_map:
            daily_map[day_str] = {"date": day_str, "sales": 0.0, "orders": 0}
        daily_map[day_str]["sales"] = round(daily_map[day_str]["sales"] + float(b.grand_total or 0.0), 2)
        daily_map[day_str]["orders"] += 1

    return {
        "period": period,
        "total_revenue": round(float(agg[0] or 0.0), 2) if agg else 0.0,
        "total_tax_collected": round(float(agg[1] or 0.0), 2) if agg else 0.0,
        "bills_count": int(agg[2] or 0) if agg else 0,
        "daily_trends": sorted(daily_map.values(), key=lambda x: x["date"]),
        "recent_bills": [
            {
                "id": b.id,
                "invoice_code": b.invoice_code,
                "created_at": str(b.created_at),
                "grand_total": b.grand_total,
                "total_tax": b.total_tax,
                "payment_status": b.payment_status,
                "payment_method": b.payment_method,
            } for b in recent_bills[:20]
        ]
    }


@router.get("/reports/valuation")
def get_inventory_valuation(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
):
    prods = db.query(GroceryProduct).filter(
        GroceryProduct.store_id == store.id,
        GroceryProduct.is_deleted == False,
    ).all()
    cost_val = sum(float(p.available_stock or 0) * float(p.purchase_price_with_tax or 0) for p in prods)
    retail_val = sum(float(p.available_stock or 0) * float(p.selling_price_with_tax or 0) for p in prods)
    total_units = sum(float(p.available_stock or 0) for p in prods)
    margin = retail_val - cost_val
    margin_pct = round((margin / retail_val) * 100.0, 2) if retail_val > 0 else 0.0
    return {
        "total_items": len(prods),
        "total_units": round(total_units, 2),
        "total_cost_value": round(cost_val, 2),
        "total_retail_value": round(retail_val, 2),
        "potential_margin_value": round(margin, 2),
        "margin_percentage": margin_pct,
    }
