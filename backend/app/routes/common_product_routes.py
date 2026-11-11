from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.product import Unit
from ..models.store_specific_products import (
    ProductSubcategory,
    ProductUnitConversion,
    Warehouse,
    StockLocation,
    TaxRate,
    HsnCode,
)

router = APIRouter(prefix="", tags=["Common Product Masters"])


# --- UNITS & CONVERSIONS ---
@router.get("/product-units")
def list_units(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve shared units master scoped to store and global defaults."""
    units = db.query(Unit).filter(
        (Unit.store_id == ctx.store_id) | (Unit.store_id.is_(None))
    ).order_by(Unit.name.asc()).all()
    return [{"id": u.id, "name": u.name, "symbol": u.symbol, "is_base_unit": u.is_base_unit} for u in units]


@router.get("/unit-conversions")
def list_unit_conversions(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve unit conversion rules for store."""
    convs = db.query(ProductUnitConversion).filter(
        ProductUnitConversion.store_id == ctx.store_id,
        ProductUnitConversion.is_active == True
    ).all()
    return [
        {
            "id": c.id,
            "from_unit": c.from_unit,
            "to_unit": c.to_unit,
            "multiplier": float(c.multiplier),
            "description": c.description,
        }
        for c in convs
    ]


@router.post("/unit-conversions", status_code=status.HTTP_201_CREATED)
def create_unit_conversion(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create a new unit conversion factor."""
    from_u = data.get("from_unit")
    to_u = data.get("to_unit")
    mult = data.get("multiplier")
    if not from_u or not to_u or not mult:
        raise HTTPException(status_code=422, detail="from_unit, to_unit and multiplier are required.")

    conv = ProductUnitConversion(
        store_id=ctx.store_id,
        from_unit=str(from_u).strip().upper(),
        to_unit=str(to_u).strip().upper(),
        multiplier=Decimal(str(mult)),
        description=data.get("description"),
        is_active=True,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {
        "id": conv.id,
        "from_unit": conv.from_unit,
        "to_unit": conv.to_unit,
        "multiplier": float(conv.multiplier),
    }


# --- WAREHOUSES & LOCATIONS ---
@router.get("/warehouses")
def list_warehouses(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve warehouses for authenticated store."""
    whs = db.query(Warehouse).filter(
        Warehouse.store_id == ctx.store_id,
        Warehouse.is_active == True
    ).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "code": w.code,
            "address": w.address,
            "contact_person": w.contact_person,
            "phone": w.phone,
        }
        for w in whs
    ]


@router.post("/warehouses", status_code=status.HTTP_201_CREATED)
def create_warehouse(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create a warehouse for store."""
    name = data.get("name")
    if not name or not str(name).strip():
        raise HTTPException(status_code=422, detail="Warehouse name is required.")

    wh = Warehouse(
        store_id=ctx.store_id,
        name=name.strip(),
        code=data.get("code"),
        address=data.get("address"),
        contact_person=data.get("contact_person"),
        phone=data.get("phone"),
        is_active=True,
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return {"id": wh.id, "name": wh.name, "code": wh.code}


# --- TAX RATES & HSN ---
@router.get("/tax-rates")
def list_tax_rates(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve available GST / Tax rates."""
    rates = db.query(TaxRate).filter(
        (TaxRate.store_id == ctx.store_id) | (TaxRate.store_id.is_(None)),
        TaxRate.is_active == True
    ).all()
    if not rates:
        # Default standard Indian GST slabs
        return [
            {"id": 1, "name": "0% (Exempt)", "rate": 0.0, "is_default": False},
            {"id": 2, "name": "5% GST", "rate": 5.0, "is_default": False},
            {"id": 3, "name": "12% GST", "rate": 12.0, "is_default": False},
            {"id": 4, "name": "18% GST", "rate": 18.0, "is_default": True},
            {"id": 5, "name": "28% GST", "rate": 28.0, "is_default": False},
        ]
    return [{"id": r.id, "name": r.name, "rate": float(r.rate), "is_default": r.is_default} for r in rates]


@router.get("/hsn-codes")
def list_hsn_codes(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search HSN codes."""
    query = db.query(HsnCode)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((HsnCode.code.ilike(s)) | (HsnCode.description.ilike(s)))
    items = query.limit(50).all()
    return [{"id": h.id, "code": h.code, "description": h.description, "default_gst_rate": float(h.default_gst_rate)} for h in items]

