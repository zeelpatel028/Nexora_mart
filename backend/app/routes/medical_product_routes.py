from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    MedicalProduct,
    MedicalProductDetail,
    MedicalProductBatch,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/medical/products", tags=["Medical / Pharmacy Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_medical_products(
    medicine_type: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """List pharmacy medicines for current authenticated store."""
    query = db.query(MedicalProduct).filter(
        MedicalProduct.store_id == ctx.store_id,
        MedicalProduct.deleted_at.is_(None)
    )

    if medicine_type:
        query = query.filter(MedicalProduct.medicine_type == medicine_type)
    if category_id:
        query = query.filter(MedicalProduct.category_id == category_id)
    if brand_id:
        query = query.filter(MedicalProduct.brand_id == brand_id)
    if status_filter:
        query = query.filter(MedicalProduct.status == status_filter)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (MedicalProduct.product_name.ilike(s)) |
            (MedicalProduct.generic_name.ilike(s)) |
            (MedicalProduct.sku.ilike(s)) |
            (MedicalProduct.barcode.ilike(s))
        )

    products = query.order_by(MedicalProduct.created_at.desc()).all()
    results = []
    for p in products:
        batch_count = len(p.batches) if p.batches else 0
        total_stock = sum(float(b.current_quantity or 0) for b in p.batches) if p.batches else 0.0
        results.append({
            "id": p.id,
            "store_id": p.store_id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "generic_name": p.generic_name,
            "sku": p.sku,
            "barcode": p.barcode,
            "medicine_type": p.medicine_type,
            "dosage_form": p.dosage_form,
            "strength": p.strength,
            "strength_unit": p.strength_unit,
            "prescription_required": p.prescription_required,
            "schedule_type": p.schedule_type,
            "status": p.status,
            "batch_count": batch_count,
            "total_stock": total_stock,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return results


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_medical_product(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create a Medical / Pharmacy product with details and batches."""
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
        prod_code = data.get("product_code") or f"MED-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        med_prod = MedicalProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=category_id,
            brand_id=brand_id,
            product_name=p_name.strip(),
            generic_name=data.get("generic_name"),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            medicine_type=data.get("medicine_type", "Prescription Medicine"),
            composition=data.get("composition") or data.get("salt_composition"),
            strength=data.get("strength"),
            strength_unit=data.get("strength_unit", "mg"),
            dosage_form=data.get("dosage_form", "Tablet"),
            route_of_administration=data.get("route_of_administration", "Oral"),
            prescription_required=bool(data.get("prescription_required", False)),
            schedule_type=data.get("schedule_type", "Schedule H"),
            therapeutic_category=data.get("therapeutic_category"),
            drug_license_number=data.get("drug_license_number"),
            storage_condition=data.get("storage_condition", "Cool & Dry Place"),
            status=data.get("status", "active"),
        )
        db.add(med_prod)

        # Details
        details_data = data.get("details", {}) or data
        med_detail = MedicalProductDetail(
            medical_product_id=med_prod.id,
            pack_size=details_data.get("pack_size"),
            strips_per_box=int(details_data.get("strips_per_box", 10)),
            tablets_per_strip=int(details_data.get("tablets_per_strip", 10)),
            side_effects=details_data.get("side_effects"),
            precautions=details_data.get("precautions"),
            temperature_range=details_data.get("temperature_range"),
            keep_refrigerated=bool(details_data.get("keep_refrigerated", False)),
            light_sensitive=bool(details_data.get("light_sensitive", False)),
            manufacturer=details_data.get("manufacturer"),
            country_of_origin=details_data.get("country_of_origin", "India"),
        )
        db.add(med_detail)

        # Batches
        batches_data = data.get("batches", [])
        total_batch_stock = Decimal("0.000")
        min_selling = Decimal(str(data.get("selling_price") or 0.0))
        min_purchase = Decimal(str(data.get("purchase_price") or 0.0))

        for b in batches_data:
            b_qty = Decimal(str(b.get("current_quantity") or b.get("initial_quantity") or 0.0))
            total_batch_stock += b_qty
            mfg = b.get("manufacturing_date")
            exp = b.get("expiry_date") or datetime.datetime.now() + datetime.timedelta(days=365)

            if isinstance(mfg, str) and mfg.strip():
                try:
                    mfg = datetime.datetime.fromisoformat(mfg.strip())
                except Exception:
                    mfg = None
            if isinstance(exp, str) and exp.strip():
                try:
                    exp = datetime.datetime.fromisoformat(exp.strip())
                except Exception:
                    exp = datetime.datetime.now() + datetime.timedelta(days=365)

            batch = MedicalProductBatch(
                medical_product_id=med_prod.id,
                batch_number=b.get("batch_number", "BATCH-001"),
                manufacturing_date=mfg,
                expiry_date=exp,
                purchase_price=Decimal(str(b.get("purchase_price") or min_purchase)),
                selling_price=Decimal(str(b.get("selling_price") or min_selling)),
                mrp=Decimal(str(b.get("mrp"))) if b.get("mrp") is not None else None,
                initial_quantity=Decimal(str(b.get("initial_quantity") or b_qty)),
                current_quantity=b_qty,
                rack_location=b.get("rack_location"),
                is_active=b.get("is_active", True),
            )
            db.add(batch)

        # Core product sync
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

        med_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=min_purchase,
            selling_price=min_selling,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 12.0)),
            tax_type=data.get("tax_type", "exclusive"),
        )
        db.add(core_pricing)

        core_inventory = ProductInventory(
            store_id=ctx.store_id,
            product_id=core_product.id,
            opening_stock=total_batch_stock,
            current_stock=total_batch_stock,
            minimum_stock=Decimal(str(data.get("min_stock_level") or 5.0)),
        )
        db.add(core_inventory)

        db.commit()
        db.refresh(med_prod)

        return {
            "success": True,
            "message": "Medical product created successfully.",
            "id": med_prod.id,
            "product_id": core_product.id,
            "product_name": med_prod.product_name,
            "sku": med_prod.sku,
            "batch_count": len(batches_data),
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create medical product: {str(e)}")


@router.get("/{id}")
def get_medical_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve full medical product with batches and expiry information."""
    prod = db.query(MedicalProduct).filter(
        MedicalProduct.id == id,
        MedicalProduct.store_id == ctx.store_id,
        MedicalProduct.deleted_at.is_(None)
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Medical product not found.")

    details = prod.details
    batches = prod.batches or []

    return {
        "id": prod.id,
        "store_id": prod.store_id,
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "generic_name": prod.generic_name,
        "product_code": prod.product_code,
        "sku": prod.sku,
        "barcode": prod.barcode,
        "description": prod.description,
        "medicine_type": prod.medicine_type,
        "composition": prod.composition,
        "strength": prod.strength,
        "strength_unit": prod.strength_unit,
        "dosage_form": prod.dosage_form,
        "route_of_administration": prod.route_of_administration,
        "prescription_required": prod.prescription_required,
        "schedule_type": prod.schedule_type,
        "therapeutic_category": prod.therapeutic_category,
        "drug_license_number": prod.drug_license_number,
        "storage_condition": prod.storage_condition,
        "status": prod.status,
        "details": {
            "pack_size": details.pack_size if details else None,
            "strips_per_box": details.strips_per_box if details else 10,
            "tablets_per_strip": details.tablets_per_strip if details else 10,
            "side_effects": details.side_effects if details else None,
            "precautions": details.precautions if details else None,
            "temperature_range": details.temperature_range if details else None,
            "keep_refrigerated": details.keep_refrigerated if details else False,
            "light_sensitive": details.light_sensitive if details else False,
            "manufacturer": details.manufacturer if details else None,
            "country_of_origin": details.country_of_origin if details else "India",
        } if details else None,
        "batches": [
            {
                "id": b.id,
                "batch_number": b.batch_number,
                "manufacturing_date": b.manufacturing_date.isoformat() if b.manufacturing_date else None,
                "expiry_date": b.expiry_date.isoformat() if b.expiry_date else None,
                "purchase_price": float(b.purchase_price or 0),
                "selling_price": float(b.selling_price or 0),
                "mrp": float(b.mrp) if b.mrp is not None else None,
                "initial_quantity": float(b.initial_quantity or 0),
                "current_quantity": float(b.current_quantity or 0),
                "rack_location": b.rack_location,
                "is_active": b.is_active,
                "is_expired": bool(b.expiry_date and b.expiry_date < datetime.datetime.now(datetime.timezone.utc)),
            }
            for b in batches
        ],
    }

