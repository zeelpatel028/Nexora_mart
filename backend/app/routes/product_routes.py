from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse,
    FormConfigResponse,
    BatchCreate,
    BatchResponse,
    VariantCreate,
    VariantResponse,
    PricingResponse,
    InventoryResponse,
    AlertResponse,
    ImageResponse,
)
from ..models.product import ProductBatch, ProductVariant
from ..services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


def _serialize_product(p) -> ProductResponse:
    stock_val = float(p.current_stock or 0.0)
    min_stock = float(p.min_stock_level or 0.0)
    cat_name = p.category.name if getattr(p, 'category', None) else None
    brand_name = p.brand.name if getattr(p, 'brand', None) else None
    tax_type = p.pricing.tax_type if getattr(p, 'pricing', None) else "exclusive"
    gst_rate = float(p.pricing.gst_rate) if getattr(p, 'pricing', None) and p.pricing.gst_rate is not None else 0.0

    return ProductResponse(
        id=str(p.id),
        store_id=str(p.store_id),
        product_name=p.product_name or "",
        name=p.product_name or "",
        product_code=p.product_code,
        sku=p.sku or "",
        barcode=p.barcode,
        category_id=p.category_id,
        category_name=cat_name,
        brand_id=p.brand_id,
        brand_name=brand_name,
        unit=p.unit or "pcs",
        selling_price=float(p.selling_price or 0.0),
        purchase_price=float(p.purchase_price or 0.0),
        mrp=float(p.mrp) if p.mrp is not None else None,
        tax_type=tax_type,
        gst_rate=gst_rate,
        current_stock=stock_val,
        min_stock_level=min_stock,
        is_low_stock=(stock_val > 0 and stock_val <= min_stock),
        is_out_of_stock=(stock_val <= 0),
        status=str(p.status or "ACTIVE"),
        is_active=bool(p.is_active if p.is_active is not None else True),
        is_featured=bool(p.is_featured or False),
        has_variants=bool(p.has_variants or False),
        image_url=p.image_url,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _serialize_product_detail(p) -> ProductDetailResponse:
    base = _serialize_product(p)
    pricing_resp = None
    if p.pricing:
        pricing_resp = PricingResponse(
            id=p.pricing.id,
            store_id=p.pricing.store_id,
            product_id=p.pricing.product_id,
            purchase_price=float(p.pricing.purchase_price or 0.0),
            selling_price=float(p.pricing.selling_price or 0.0),
            mrp=float(p.pricing.mrp) if p.pricing.mrp is not None else None,
            wholesale_price=float(p.pricing.wholesale_price) if p.pricing.wholesale_price is not None else None,
            discount_type=p.pricing.discount_type,
            discount_value=float(p.pricing.discount_value or 0.0),
            tax_type=p.pricing.tax_type,
            gst_rate=float(p.pricing.gst_rate or 0.0),
            cgst_rate=float(p.pricing.cgst_rate or 0.0),
            sgst_rate=float(p.pricing.sgst_rate or 0.0),
            igst_rate=float(p.pricing.igst_rate or 0.0),
            cess_rate=float(p.pricing.cess_rate or 0.0),
        )

    inventory_resp = None
    if p.inventory_record:
        inventory_resp = InventoryResponse(
            id=p.inventory_record.id,
            store_id=p.inventory_record.store_id,
            product_id=p.inventory_record.product_id,
            opening_stock=float(p.inventory_record.opening_stock or 0.0),
            current_stock=float(p.inventory_record.current_stock or 0.0),
            reserved_stock=float(p.inventory_record.reserved_stock or 0.0),
            minimum_stock=float(p.inventory_record.minimum_stock or 5.0),
            maximum_stock=float(p.inventory_record.maximum_stock) if p.inventory_record.maximum_stock is not None else None,
            reorder_level=float(p.inventory_record.reorder_level or 10.0),
            warehouse_location=p.inventory_record.warehouse_location,
            last_stock_update=p.inventory_record.last_stock_update,
        )

    alerts_list = [
        AlertResponse(
            id=a.id,
            product_id=a.product_id,
            alert_type=a.alert_type,
            threshold_value=float(a.threshold_value) if a.threshold_value is not None else None,
            alert_days_before=a.alert_days_before,
            is_enabled=a.is_enabled,
            notify_email=a.notify_email,
            notify_sms=a.notify_sms,
        )
        for a in (p.alerts or [])
    ]

    images_list = [
        ImageResponse(
            id=img.id,
            product_id=img.product_id,
            image_url=img.image_url,
            alt_text=img.alt_text,
            is_primary=img.is_primary,
            display_order=img.display_order,
        )
        for img in (p.images or [])
    ]

    variants_list = [
        VariantResponse(
            id=v.id,
            product_id=v.product_id,
            variant_name=v.variant_name,
            sku=v.sku,
            barcode=v.barcode,
            attributes=v.attributes or {},
            purchase_price=float(v.purchase_price or 0.0),
            selling_price=float(v.selling_price or 0.0),
            mrp=float(v.mrp) if v.mrp is not None else None,
            stock_quantity=float(v.stock_quantity or 0.0),
            is_active=v.is_active,
        )
        for v in (p.variants or [])
    ]

    batches_list = [
        BatchResponse(
            id=b.id,
            product_id=b.product_id,
            batch_number=b.batch_number,
            manufacturing_date=b.manufacturing_date,
            expiry_date=b.expiry_date,
            purchase_price=float(b.purchase_price or 0.0),
            selling_price=float(b.selling_price or 0.0),
            mrp=float(b.mrp) if b.mrp is not None else None,
            initial_quantity=float(b.initial_quantity or 0.0),
            current_quantity=float(b.current_quantity or 0.0),
            supplier_id=b.supplier_id,
            is_active=b.is_active,
        )
        for b in (p.batches or [])
    ]

    store_details = p.get_store_details_dict()

    return ProductDetailResponse(
        **base.model_dump(),
        description=p.description,
        short_description=p.short_description,
        product_type=p.product_type,
        hsn_code=p.hsn_code,
        pricing=pricing_resp,
        inventory=inventory_resp,
        alerts=alerts_list,
        images=images_list,
        variants=variants_list,
        batches=batches_list,
        serial_numbers=[],
        store_details=store_details,
        attributes=store_details,
    )


# --- 1. DYNAMIC FORM CONFIGURATION ---
@router.get("/form-config", response_model=FormConfigResponse)
def get_product_form_config(
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    Returns store-type customized form config for dynamic Add Product page.
    Automatically identifies merchant's store type and provides only relevant fields.
    """
    return ProductService.get_form_config(db, ctx)


# --- 2. LIST PRODUCTS (Strict Store Isolation) ---
@router.get("", response_model=List[ProductResponse], include_in_schema=False)
@router.get("/", response_model=List[ProductResponse])
def list_products(
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    barcode: Optional[str] = None,
    status_filter: Optional[str] = None,
    stock_filter: Optional[str] = None,
    is_active: Optional[bool] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    List products in current merchant's store.
    Strictly isolated: Store A cannot view Store B products.
    """
    products, _ = ProductService.list_products(
        db=db,
        ctx=ctx,
        category_id=category_id,
        brand_id=brand_id,
        search=search,
        barcode=barcode,
        status_filter=status_filter,
        stock_filter=stock_filter,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    return [_serialize_product(p) for p in products]


# --- 3. CREATE PRODUCT (Atomic Transaction) ---
@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    Atomically creates a product and all child records (pricing, inventory, alerts, store-specific details, variants, batches).
    Rolls back completely if any step fails.
    """
    product = ProductService.create_product(db, ctx, request)
    return _serialize_product_detail(product)


# --- 4. GET PRODUCT DETAILS ---
@router.get("/{id}", response_model=ProductDetailResponse)
def get_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    Retrieve complete product details.
    Denies access with 403 or 404 if product does not belong to user's store.
    """
    product = ProductService.get_product(db, ctx, id)
    return _serialize_product_detail(product)


# --- 5. UPDATE PRODUCT ---
@router.put("/{id}", response_model=ProductDetailResponse)
@router.patch("/{id}", response_model=ProductDetailResponse)
def update_product(
    id: str,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    Updates product and child tables atomically.
    Validates ownership of product, category, and brand.
    """
    product = ProductService.update_product(db, ctx, id, request)
    return _serialize_product_detail(product)


# --- 6. SAFE SOFT DELETE PRODUCT ---
@router.delete("/{id}")
def delete_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """
    Soft-deletes product.
    Strictly verifies ownership before deletion.
    """
    return ProductService.delete_product(db, ctx, id)


# --- 7. BATCH SUB-RESOURCES ---
@router.get("/{id}/batches", response_model=List[BatchResponse])
def get_product_batches(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Get batches for a product, verifying store ownership."""
    product = ProductService.get_product(db, ctx, id)
    return [
        BatchResponse(
            id=b.id,
            product_id=b.product_id,
            batch_number=b.batch_number,
            manufacturing_date=b.manufacturing_date,
            expiry_date=b.expiry_date,
            purchase_price=float(b.purchase_price or 0.0),
            selling_price=float(b.selling_price or 0.0),
            mrp=float(b.mrp) if b.mrp is not None else None,
            initial_quantity=float(b.initial_quantity or 0.0),
            current_quantity=float(b.current_quantity or 0.0),
            supplier_id=b.supplier_id,
            is_active=b.is_active,
        )
        for b in (product.batches or [])
    ]


@router.post("/{id}/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_product_batch(
    id: str,
    request: BatchCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Add a new batch to a product, verifying store ownership."""
    ctx.require_permission("create_product")
    product = ProductService.get_product(db, ctx, id)

    mfg = request.manufacturing_date if isinstance(request.manufacturing_date, datetime.datetime) else (
        datetime.datetime.combine(request.manufacturing_date, datetime.time.min) if isinstance(request.manufacturing_date, datetime.date) else None
    )
    exp = request.expiry_date if isinstance(request.expiry_date, datetime.datetime) else (
        datetime.datetime.combine(request.expiry_date, datetime.time.min) if isinstance(request.expiry_date, datetime.date) else None
    )

    batch = ProductBatch(
        store_id=ctx.store_id,
        product_id=product.id,
        batch_number=request.batch_number,
        manufacturing_date=mfg,
        expiry_date=exp,
        purchase_price=Decimal(str(request.purchase_price or 0.0)),
        selling_price=Decimal(str(request.selling_price or 0.0)),
        mrp=Decimal(str(request.mrp)) if request.mrp is not None else None,
        initial_quantity=Decimal(str(request.initial_quantity or 0.0)),
        current_quantity=Decimal(str(request.current_quantity or request.initial_quantity or 0.0)),
        supplier_id=request.supplier_id,
        is_active=request.is_active,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return BatchResponse(
        id=batch.id,
        product_id=batch.product_id,
        batch_number=batch.batch_number,
        manufacturing_date=batch.manufacturing_date,
        expiry_date=batch.expiry_date,
        purchase_price=float(batch.purchase_price or 0.0),
        selling_price=float(batch.selling_price or 0.0),
        mrp=float(batch.mrp) if batch.mrp is not None else None,
        initial_quantity=float(batch.initial_quantity or 0.0),
        current_quantity=float(batch.current_quantity or 0.0),
        supplier_id=batch.supplier_id,
        is_active=batch.is_active,
    )


# --- 8. VARIANT SUB-RESOURCES ---
@router.get("/{id}/variants", response_model=List[VariantResponse])
def get_product_variants(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Get variants for a product, verifying store ownership."""
    product = ProductService.get_product(db, ctx, id)
    return [
        VariantResponse(
            id=v.id,
            product_id=v.product_id,
            variant_name=v.variant_name,
            sku=v.sku,
            barcode=v.barcode,
            attributes=v.attributes or {},
            purchase_price=float(v.purchase_price or 0.0),
            selling_price=float(v.selling_price or 0.0),
            mrp=float(v.mrp) if v.mrp is not None else None,
            stock_quantity=float(v.stock_quantity or 0.0),
            is_active=v.is_active,
        )
        for v in (product.variants or [])
    ]


@router.post("/{id}/variants", response_model=VariantResponse, status_code=status.HTTP_201_CREATED)
def create_product_variant(
    id: str,
    request: VariantCreate,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Add a new variant to a product, verifying store ownership."""
    ctx.require_permission("create_product")
    product = ProductService.get_product(db, ctx, id)

    variant = ProductVariant(
        store_id=ctx.store_id,
        product_id=product.id,
        variant_name=request.variant_name,
        sku=request.sku,
        barcode=request.barcode,
        attributes=request.attributes or {},
        purchase_price=Decimal(str(request.purchase_price or 0.0)),
        selling_price=Decimal(str(request.selling_price or 0.0)),
        mrp=Decimal(str(request.mrp)) if request.mrp is not None else None,
        stock_quantity=Decimal(str(request.stock_quantity or 0.0)),
        is_active=request.is_active,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return VariantResponse(
        id=variant.id,
        product_id=variant.product_id,
        variant_name=variant.variant_name,
        sku=variant.sku,
        barcode=variant.barcode,
        attributes=variant.attributes or {},
        purchase_price=float(variant.purchase_price or 0.0),
        selling_price=float(variant.selling_price or 0.0),
        mrp=float(variant.mrp) if variant.mrp is not None else None,
        stock_quantity=float(variant.stock_quantity or 0.0),
        is_active=variant.is_active,
    )
