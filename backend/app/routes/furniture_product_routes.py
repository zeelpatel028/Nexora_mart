from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    FurnitureProduct,
    FurnitureProductDetail,
    FurnitureProductVariant,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/furniture/products", tags=["Furniture Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_furniture_products(
    furniture_type: Optional[str] = None,
    material: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    query = db.query(FurnitureProduct).filter(
        FurnitureProduct.store_id == ctx.store_id,
        FurnitureProduct.deleted_at.is_(None)
    )
    if furniture_type:
        query = query.filter(FurnitureProduct.furniture_type == furniture_type)
    if material:
        query = query.filter(FurnitureProduct.material == material)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (FurnitureProduct.product_name.ilike(s)) |
            (FurnitureProduct.sku.ilike(s)) |
            (FurnitureProduct.barcode.ilike(s))
        )
    products = query.order_by(FurnitureProduct.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "furniture_type": p.furniture_type,
            "material": p.material,
            "wood_type": p.wood_type,
            "finish_type": p.finish_type,
            "seating_capacity": p.seating_capacity,
            "warranty_period": p.warranty_period,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in products
    ]


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_furniture_product(
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
        prod_code = data.get("product_code") or f"FUR-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        fur_prod = FurnitureProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            furniture_type=data.get("furniture_type", "Sofa & Couch"),
            material=data.get("material", "Solid Teak Wood"),
            wood_type=data.get("wood_type"),
            finish_type=data.get("finish_type", "Walnut Finish"),
            color=data.get("color"),
            seating_capacity=int(data.get("seating_capacity")) if data.get("seating_capacity") else None,
            length=data.get("length"),
            width=data.get("width"),
            height=data.get("height"),
            dimension_unit=data.get("dimension_unit", "inch"),
            weight=data.get("weight"),
            weight_unit=data.get("weight_unit", "kg"),
            assembly_required=bool(data.get("assembly_required", False)),
            storage_available=bool(data.get("storage_available", False)),
            warranty_period=int(data.get("warranty_period", 36)),
            warranty_unit=data.get("warranty_unit", "Months"),
            status=data.get("status", "active"),
        )
        db.add(fur_prod)

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

        fur_prod.product_id = core_product.id

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
        db.refresh(fur_prod)
        return {
            "success": True,
            "message": "Furniture product created successfully.",
            "id": fur_prod.id,
            "product_id": core_product.id,
            "product_name": fur_prod.product_name,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create furniture product: {str(e)}")

