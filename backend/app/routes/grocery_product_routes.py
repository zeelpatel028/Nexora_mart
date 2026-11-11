from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    GroceryProduct,
    GroceryProductDetail,
    GroceryProductBatch,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/grocery/products", tags=["Grocery Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_grocery_products(
    category_id: Optional[int] = None,
    item_type: Optional[str] = None,
    food_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """List grocery products for current authenticated store."""
    query = db.query(GroceryProduct).filter(
        GroceryProduct.store_id == ctx.store_id,
        GroceryProduct.deleted_at.is_(None)
    )

    if category_id:
        query = query.filter(GroceryProduct.category_id == category_id)
    if item_type:
        query = query.filter(GroceryProduct.item_type == item_type)
    if food_type:
        query = query.filter(GroceryProduct.food_type == food_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (GroceryProduct.product_name.ilike(s)) |
            (GroceryProduct.sku.ilike(s)) |
            (GroceryProduct.barcode.ilike(s))
        )

    products = query.order_by(GroceryProduct.created_at.desc()).all()
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "store_id": p.store_id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "product_code": p.product_code,
            "sku": p.sku,
            "barcode": p.barcode,
            "food_type": p.food_type,
            "item_type": p.item_type,
            "packaging_type": p.packaging_type,
            "net_weight": p.net_weight,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return results


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_grocery_product(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create a grocery product with packaging, food specifications and batches."""
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
        prod_code = data.get("product_code") or f"GRO-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        g_prod = GroceryProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=category_id,
            brand_id=brand_id,
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            food_type=data.get("food_type", "Vegetarian"),
            item_type=data.get("item_type", "Packaged Food"),
            packaging_type=data.get("packaging_type", "Packet / Pouch"),
            net_weight=data.get("net_weight"),
            gross_weight=data.get("gross_weight"),
            shelf_life_days=int(data.get("shelf_life_days")) if data.get("shelf_life_days") else None,
            is_vegetarian=bool(data.get("is_vegetarian", True)),
            storage_type=data.get("storage_type", "Cool & Dry Place"),
            fssai_license=data.get("fssai_license"),
            status=data.get("status", "active"),
        )
        db.add(g_prod)

        # Details
        details_data = data.get("details", {}) or data
        g_detail = GroceryProductDetail(
            grocery_product_id=g_prod.id,
            ingredients=details_data.get("ingredients"),
            nutritional_info=details_data.get("nutritional_info") or details_data.get("nutritional_information"),
            allergen_info=details_data.get("allergen_info"),
            country_of_origin=details_data.get("country_of_origin", "India"),
            manufacturer=details_data.get("manufacturer"),
        )
        db.add(g_detail)

        # Core sync
        selling_price = Decimal(str(data.get("selling_price") or 0.0))
        purchase_price = Decimal(str(data.get("purchase_price") or 0.0))
        opening_stock = Decimal(str(data.get("opening_stock") or data.get("current_stock") or 0.0))

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
            product_type="simple",
            status=data.get("status", "active"),
        )
        db.add(core_product)
        db.flush()

        g_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=purchase_price,
            selling_price=selling_price,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 5.0)),
            tax_type=data.get("tax_type", "exclusive"),
        )
        db.add(core_pricing)

        core_inventory = ProductInventory(
            store_id=ctx.store_id,
            product_id=core_product.id,
            opening_stock=opening_stock,
            current_stock=opening_stock,
            minimum_stock=Decimal(str(data.get("min_stock_level") or 5.0)),
        )
        db.add(core_inventory)

        db.commit()
        db.refresh(g_prod)

        return {
            "success": True,
            "message": "Grocery product created successfully.",
            "id": g_prod.id,
            "product_id": core_product.id,
            "product_name": g_prod.product_name,
            "sku": g_prod.sku,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create grocery product: {str(e)}")


@router.get("/{id}")
def get_grocery_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve full grocery product details."""
    prod = db.query(GroceryProduct).filter(
        GroceryProduct.id == id,
        GroceryProduct.store_id == ctx.store_id,
        GroceryProduct.deleted_at.is_(None)
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Grocery product not found.")

    details = prod.details
    return {
        "id": prod.id,
        "store_id": prod.store_id,
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "product_code": prod.product_code,
        "sku": prod.sku,
        "barcode": prod.barcode,
        "description": prod.description,
        "food_type": prod.food_type,
        "item_type": prod.item_type,
        "packaging_type": prod.packaging_type,
        "net_weight": prod.net_weight,
        "gross_weight": prod.gross_weight,
        "shelf_life_days": prod.shelf_life_days,
        "is_vegetarian": prod.is_vegetarian,
        "storage_type": prod.storage_type,
        "fssai_license": prod.fssai_license,
        "status": prod.status,
        "details": {
            "ingredients": details.ingredients if details else None,
            "nutritional_info": details.nutritional_info if details else None,
            "allergen_info": details.allergen_info if details else None,
            "country_of_origin": details.country_of_origin if details else "India",
            "manufacturer": details.manufacturer if details else None,
        } if details else None,
    }

