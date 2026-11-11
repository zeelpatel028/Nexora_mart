from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    ElectronicsProduct,
    ElectronicsProductDetail,
    ElectronicsProductSerial,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/electronics/products", tags=["Electronics Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_electronics_products(
    category_id: Optional[int] = None,
    device_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    query = db.query(ElectronicsProduct).filter(
        ElectronicsProduct.store_id == ctx.store_id,
        ElectronicsProduct.deleted_at.is_(None)
    )
    if category_id:
        query = query.filter(ElectronicsProduct.category_id == category_id)
    if device_type:
        query = query.filter(ElectronicsProduct.device_type == device_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (ElectronicsProduct.product_name.ilike(s)) |
            (ElectronicsProduct.model_number.ilike(s)) |
            (ElectronicsProduct.sku.ilike(s)) |
            (ElectronicsProduct.barcode.ilike(s))
        )
    products = query.order_by(ElectronicsProduct.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "device_type": p.device_type,
            "model_number": p.model_number,
            "ram": p.ram,
            "storage_capacity": p.storage_capacity,
            "warranty_months": p.warranty_months,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in products
    ]


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_electronics_product(
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
        prod_code = data.get("product_code") or f"ELE-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        elec_prod = ElectronicsProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=data.get("category_id"),
            brand_id=data.get("brand_id"),
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            device_type=data.get("device_type", "Smartphone"),
            model_number=data.get("model_number"),
            model_name=data.get("model_name"),
            color=data.get("color"),
            ram=data.get("ram"),
            storage_capacity=data.get("storage_capacity"),
            processor=data.get("processor"),
            screen_size=data.get("screen_size"),
            battery_capacity=data.get("battery_capacity"),
            connectivity=data.get("connectivity"),
            warranty_months=int(data.get("warranty_months", 12)),
            warranty_type=data.get("warranty_type", "Brand Carry-In"),
            status=data.get("status", "active"),
        )
        db.add(elec_prod)

        # Serials / IMEI
        serials_data = data.get("serial_numbers", []) or data.get("serials", [])
        for s in serials_data:
            s_rec = ElectronicsProductSerial(
                electronics_product_id=elec_prod.id,
                serial_number=s.get("serial_number", str(uuid.uuid4())[:8]),
                imei_number=s.get("imei_number"),
                status="available",
            )
            db.add(s_rec)

        # Core sync
        selling_price = Decimal(str(data.get("selling_price") or 0.0))
        purchase_price = Decimal(str(data.get("purchase_price") or 0.0))
        opening_stock = Decimal(str(data.get("opening_stock") or len(serials_data) or 0.0))

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

        elec_prod.product_id = core_product.id

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
        db.refresh(elec_prod)
        return {
            "success": True,
            "message": "Electronics product created successfully.",
            "id": elec_prod.id,
            "product_id": core_product.id,
            "product_name": elec_prod.product_name,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create electronics product: {str(e)}")

