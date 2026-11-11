from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    ClothingProduct,
    ClothingProductDetail,
    ClothingProductVariant,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/clothing/products", tags=["Clothing Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_clothing_products(
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    gender: Optional[str] = None,
    clothing_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """List clothing products for current authenticated store."""
    query = db.query(ClothingProduct).filter(
        ClothingProduct.store_id == ctx.store_id,
        ClothingProduct.deleted_at.is_(None)
    )

    if category_id:
        query = query.filter(ClothingProduct.category_id == category_id)
    if brand_id:
        query = query.filter(ClothingProduct.brand_id == brand_id)
    if gender:
        query = query.filter(ClothingProduct.gender == gender)
    if clothing_type:
        query = query.filter(ClothingProduct.clothing_type == clothing_type)
    if status_filter:
        query = query.filter(ClothingProduct.status == status_filter)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (ClothingProduct.product_name.ilike(s)) |
            (ClothingProduct.sku.ilike(s)) |
            (ClothingProduct.barcode.ilike(s))
        )

    products = query.order_by(ClothingProduct.created_at.desc()).all()
    results = []
    for p in products:
        var_count = len(p.variants) if p.variants else 0
        total_stock = sum(float(v.stock_quantity or 0) for v in p.variants) if p.variants else 0.0
        results.append({
            "id": p.id,
            "store_id": p.store_id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "product_code": p.product_code,
            "sku": p.sku,
            "barcode": p.barcode,
            "category_id": p.category_id,
            "brand_id": p.brand_id,
            "gender": p.gender,
            "clothing_type": p.clothing_type,
            "fabric_type": p.fabric_type,
            "pattern": p.pattern,
            "fit_type": p.fit_type,
            "status": p.status,
            "variant_count": var_count,
            "total_stock": total_stock,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return results


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_clothing_product(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Creates a clothing product with size-color variants atomically."""
    ctx.require_permission("create_product")

    p_name = data.get("product_name") or data.get("name")
    if not p_name or not str(p_name).strip():
        raise HTTPException(status_code=422, detail="Product name is required.")

    sku = data.get("sku")
    barcode = data.get("barcode")
    category_id = data.get("category_id")
    brand_id = data.get("brand_id")

    if category_id:
        ProductValidationService.validate_category_ownership(db, ctx.store_id, category_id)
    if brand_id:
        ProductValidationService.validate_brand_ownership(db, ctx.store_id, brand_id)
    if sku:
        ProductValidationService.validate_sku_uniqueness(db, ctx.store_id, sku)
    if barcode:
        ProductValidationService.validate_barcode_uniqueness(db, ctx.store_id, barcode)

    try:
        new_id = str(uuid.uuid4())
        prod_code = data.get("product_code") or f"CLO-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        # 1. Store-specific ClothingProduct
        clothing_prod = ClothingProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=category_id,
            brand_id=brand_id,
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            gender=data.get("gender", "Men"),
            clothing_type=data.get("clothing_type", "T-Shirt"),
            fabric_type=data.get("fabric_type", "Cotton"),
            pattern=data.get("pattern", "Plain"),
            fit_type=data.get("fit_type", "Regular Fit"),
            sleeve_type=data.get("sleeve_type"),
            neck_type=data.get("neck_type"),
            occasion=data.get("occasion", "Casual"),
            season=data.get("season", "All Season"),
            country_of_origin=data.get("country_of_origin", "India"),
            status=data.get("status", "active"),
        )
        db.add(clothing_prod)

        # 2. Clothing Product Details (Measurements)
        details_data = data.get("details", {})
        if details_data:
            detail = ClothingProductDetail(
                clothing_product_id=clothing_prod.id,
                chest=details_data.get("chest"),
                waist=details_data.get("waist"),
                shoulder=details_data.get("shoulder"),
                sleeve_length=details_data.get("sleeve_length"),
                shirt_length=details_data.get("shirt_length"),
                hip=details_data.get("hip"),
                inseam=details_data.get("inseam"),
                measurement_unit=details_data.get("measurement_unit", "Inches"),
                care_instructions=details_data.get("care_instructions"),
                wash_type=details_data.get("wash_type"),
            )
            db.add(detail)

        # 3. Size-Color Variants
        variants_data = data.get("variants", [])
        total_variant_stock = Decimal("0.000")
        min_selling_price = Decimal(str(data.get("selling_price") or 0.0))
        min_purchase_price = Decimal(str(data.get("purchase_price") or 0.0))

        for v in variants_data:
            v_stock = Decimal(str(v.get("stock_quantity") or v.get("stock") or 0.0))
            v_selling = Decimal(str(v.get("selling_price") or min_selling_price))
            v_purchase = Decimal(str(v.get("purchase_price") or min_purchase_price))
            total_variant_stock += v_stock

            var_rec = ClothingProductVariant(
                clothing_product_id=clothing_prod.id,
                size=str(v.get("size", "M")),
                color=str(v.get("color", "Black")),
                sku=v.get("sku"),
                barcode=v.get("barcode"),
                stock_quantity=v_stock,
                purchase_price=v_purchase,
                selling_price=v_selling,
                mrp=Decimal(str(v.get("mrp"))) if v.get("mrp") is not None else None,
                wholesale_price=Decimal(str(v.get("wholesale_price"))) if v.get("wholesale_price") is not None else None,
                min_stock_alert=Decimal(str(v.get("min_stock_alert", 3.0))),
                variant_image_url=v.get("variant_image_url"),
                is_active=v.get("is_active", True),
            )
            db.add(var_rec)

        # 4. Synchronize with Core Products for universal POS/Billing/Inventory compatibility
        core_product = Product(
            id=str(uuid.uuid4()),
            store_id=ctx.store_id,
            category_id=category_id,
            brand_id=brand_id,
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            product_type="variable" if variants_data else "simple",
            status=data.get("status", "active"),
        )
        db.add(core_product)
        db.flush()

        clothing_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=min_purchase_price,
            selling_price=min_selling_price,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 12.0)),
            tax_type=data.get("tax_type", "exclusive"),
        )
        db.add(core_pricing)

        core_inventory = ProductInventory(
            store_id=ctx.store_id,
            product_id=core_product.id,
            opening_stock=total_variant_stock,
            current_stock=total_variant_stock,
            minimum_stock=Decimal(str(data.get("min_stock_level") or 5.0)),
        )
        db.add(core_inventory)

        db.commit()
        db.refresh(clothing_prod)

        return {
            "success": True,
            "message": "Clothing product created successfully.",
            "id": clothing_prod.id,
            "product_id": core_product.id,
            "product_name": clothing_prod.product_name,
            "sku": clothing_prod.sku,
            "variant_count": len(variants_data),
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create clothing product: {str(e)}")


@router.get("/{id}")
def get_clothing_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve full clothing product with details and variants."""
    prod = db.query(ClothingProduct).filter(
        ClothingProduct.id == id,
        ClothingProduct.store_id == ctx.store_id,
        ClothingProduct.deleted_at.is_(None)
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Clothing product not found.")

    details = prod.details
    variants = prod.variants or []

    return {
        "id": prod.id,
        "store_id": prod.store_id,
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "product_code": prod.product_code,
        "sku": prod.sku,
        "barcode": prod.barcode,
        "description": prod.description,
        "category_id": prod.category_id,
        "brand_id": prod.brand_id,
        "gender": prod.gender,
        "clothing_type": prod.clothing_type,
        "fabric_type": prod.fabric_type,
        "pattern": prod.pattern,
        "fit_type": prod.fit_type,
        "sleeve_type": prod.sleeve_type,
        "neck_type": prod.neck_type,
        "occasion": prod.occasion,
        "season": prod.season,
        "country_of_origin": prod.country_of_origin,
        "status": prod.status,
        "details": {
            "chest": details.chest if details else None,
            "waist": details.waist if details else None,
            "shoulder": details.shoulder if details else None,
            "sleeve_length": details.sleeve_length if details else None,
            "shirt_length": details.shirt_length if details else None,
            "hip": details.hip if details else None,
            "inseam": details.inseam if details else None,
            "measurement_unit": details.measurement_unit if details else "Inches",
            "care_instructions": details.care_instructions if details else None,
            "wash_type": details.wash_type if details else None,
        } if details else None,
        "variants": [
            {
                "id": v.id,
                "size": v.size,
                "color": v.color,
                "sku": v.sku,
                "barcode": v.barcode,
                "stock_quantity": float(v.stock_quantity or 0),
                "purchase_price": float(v.purchase_price or 0),
                "selling_price": float(v.selling_price or 0),
                "mrp": float(v.mrp) if v.mrp is not None else None,
                "wholesale_price": float(v.wholesale_price) if v.wholesale_price is not None else None,
                "min_stock_alert": float(v.min_stock_alert or 3.0),
                "variant_image_url": v.variant_image_url,
                "is_active": v.is_active,
            }
            for v in variants
        ],
    }


@router.delete("/{id}")
def delete_clothing_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Soft delete clothing product."""
    ctx.require_permission("delete_product")
    prod = db.query(ClothingProduct).filter(
        ClothingProduct.id == id,
        ClothingProduct.store_id == ctx.store_id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Clothing product not found.")

    prod.deleted_at = datetime.datetime.now(datetime.timezone.utc)
    prod.status = "deleted"

    if prod.product_id:
        core_p = db.query(Product).filter(Product.id == prod.product_id).first()
        if core_p:
            core_p.deleted_at = datetime.datetime.now(datetime.timezone.utc)
            core_p.status = "deleted"

    db.commit()
    return {"success": True, "message": "Clothing product deleted successfully."}

