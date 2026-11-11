from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    HandloomProduct,
    HandloomProductDetail,
    HandloomProductVariant,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/handloom/products", tags=["Handloom Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_handloom_products(
    product_type: Optional[str] = None,
    fabric_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    query = db.query(HandloomProduct).filter(
        HandloomProduct.store_id == ctx.store_id,
        HandloomProduct.deleted_at.is_(None)
    )
    if product_type:
        query = query.filter(HandloomProduct.product_type == product_type)
    if fabric_type:
        query = query.filter(HandloomProduct.fabric_type == fabric_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (HandloomProduct.product_name.ilike(s)) |
            (HandloomProduct.sku.ilike(s)) |
            (HandloomProduct.barcode.ilike(s))
        )
    products = query.order_by(HandloomProduct.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "product_type": p.product_type,
            "fabric_type": p.fabric_type,
            "weaving_technique": p.weaving_technique,
            "craft_type": p.craft_type,
            "origin_region": p.origin_region,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in products
    ]


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_handloom_product(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    ctx.require_permission("create_product")
    p_name = data.get("product_name") or data.get("name")
    if not p_name or not str(p_name).strip():
        raise HTTPException(status_code=422, detail="Product name is required.")

    sku = data.get("sku")
    barcode = data.get("barcode")
    if sku:
        ProductValidationService.validate_sku_uniqueness(db, ctx.store_id, sku)
    if barcode:
        ProductValidationService.validate_barcode_uniqueness(db, ctx.store_id, barcode)

    try:
        new_id = str(uuid.uuid4())
        prod_code = data.get("product_code") or f"HLM-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        hl_prod = HandloomProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            product_type=data.get("product_type", "Saree"),
            fabric_type=data.get("fabric_type", "Pure Khadi Cotton"),
            weaving_technique=data.get("weaving_technique", "Traditional Pit Loom"),
            craft_type=data.get("craft_type", "Zari Brocade"),
            material=data.get("material"),
            design_pattern=data.get("design_pattern", "Traditional"),
            origin_region=data.get("origin_region"),
            artisan_name=data.get("artisan_name"),
            handwoven=bool(data.get("handwoven", True)),
            status=data.get("status", "active"),
        )
        db.add(hl_prod)

        # Core sync
        selling_price = Decimal(str(data.get("selling_price") or 0.0))
        purchase_price = Decimal(str(data.get("purchase_price") or 0.0))
        opening_stock = Decimal(str(data.get("opening_stock") or 0.0))

        core_product = Product(
            id=str(uuid.uuid4()),
            store_id=ctx.store_id,
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            status=data.get("status", "active"),
        )
        db.add(core_product)
        db.flush()

        hl_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=purchase_price,
            selling_price=selling_price,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 5.0)),
        )
        db.add(core_pricing)

        core_inventory = ProductInventory(
            store_id=ctx.store_id,
            product_id=core_product.id,
            opening_stock=opening_stock,
            current_stock=opening_stock,
        )
        db.add(core_inventory)

        db.commit()
        db.refresh(hl_prod)
        return {
            "success": True,
            "message": "Handloom product created successfully.",
            "id": hl_prod.id,
            "product_id": core_product.id,
            "product_name": hl_prod.product_name,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create handloom product: {str(e)}")

