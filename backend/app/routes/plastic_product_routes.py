from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    PlasticProduct,
    PlasticProductDetail,
    PlasticProductVariant,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/plastic/products", tags=["Plastic Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_plastic_products(
    plastic_type: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    query = db.query(PlasticProduct).filter(
        PlasticProduct.store_id == ctx.store_id,
        PlasticProduct.deleted_at.is_(None)
    )
    if plastic_type:
        query = query.filter(PlasticProduct.plastic_type == plastic_type)
    if category_id:
        query = query.filter(PlasticProduct.category_id == category_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (PlasticProduct.product_name.ilike(s)) |
            (PlasticProduct.sku.ilike(s)) |
            (PlasticProduct.barcode.ilike(s))
        )
    products = query.order_by(PlasticProduct.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "plastic_type": p.plastic_type,
            "material_grade": p.material_grade,
            "capacity": p.capacity,
            "capacity_unit": p.capacity_unit,
            "food_grade": p.food_grade,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in products
    ]


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_plastic_product(
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
        prod_code = data.get("product_code") or f"PLS-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        pl_prod = PlasticProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            plastic_type=data.get("plastic_type", "Polypropylene (PP)"),
            material_grade=data.get("material_grade", "100% Virgin Grade"),
            color=data.get("color"),
            shape=data.get("shape", "Round"),
            capacity=data.get("capacity"),
            capacity_unit=data.get("capacity_unit", "L"),
            length=data.get("length"),
            width=data.get("width"),
            height=data.get("height"),
            thickness=data.get("thickness"),
            weight=data.get("weight"),
            food_grade=bool(data.get("food_grade", False)),
            recyclable=bool(data.get("recyclable", True)),
            uv_resistant=bool(data.get("uv_resistant", False)),
            status=data.get("status", "active"),
        )
        db.add(pl_prod)

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

        pl_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=purchase_price,
            selling_price=selling_price,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 18.0)),
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
        db.refresh(pl_prod)
        return {
            "success": True,
            "message": "Plastic product created successfully.",
            "id": pl_prod.id,
            "product_id": core_product.id,
            "product_name": pl_prod.product_name,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create plastic product: {str(e)}")

