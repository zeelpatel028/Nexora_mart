from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid
import datetime

from ..database.connection import get_db
from ..middleware.store_auth import get_current_store_context, StoreContext
from ..models.store_specific_products import (
    AgroProduct,
    AgroMedicineDetail,
    AgroCropDetail,
    AgroFertilizerDetail,
    AgroSeedDetail,
)
from ..models.product import Product, ProductPricing, ProductInventory
from ..services.product_validation_service import ProductValidationService

router = APIRouter(prefix="/agro/products", tags=["Agro Products"])


@router.get("", response_model=List[Dict[str, Any]], include_in_schema=False)
@router.get("/", response_model=List[Dict[str, Any]])
def list_agro_products(
    agro_product_type: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """List agro products for current authenticated store."""
    query = db.query(AgroProduct).filter(
        AgroProduct.store_id == ctx.store_id,
        AgroProduct.deleted_at.is_(None)
    )

    if agro_product_type:
        query = query.filter(AgroProduct.agro_product_type == agro_product_type)
    if category_id:
        query = query.filter(AgroProduct.category_id == category_id)
    if brand_id:
        query = query.filter(AgroProduct.brand_id == brand_id)
    if status_filter:
        query = query.filter(AgroProduct.status == status_filter)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (AgroProduct.product_name.ilike(s)) |
            (AgroProduct.sku.ilike(s)) |
            (AgroProduct.barcode.ilike(s))
        )

    products = query.order_by(AgroProduct.created_at.desc()).all()
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
            "agro_product_type": p.agro_product_type,
            "category_id": p.category_id,
            "brand_id": p.brand_id,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return results


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_agro_product(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Create an Agro Product supporting 4 product types: Medicine, Crop, Fertilizer, Seed."""
    ctx.require_permission("create_product")

    p_name = data.get("product_name") or data.get("name")
    if not p_name or not str(p_name).strip():
        raise HTTPException(status_code=422, detail="Product name is required.")

    sku = data.get("sku")
    barcode = data.get("barcode")
    category_id = data.get("category_id")
    brand_id = data.get("brand_id")
    agro_type = data.get("agro_product_type") or data.get("product_type") or "Crop Medicine"

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
        prod_code = data.get("product_code") or f"AGR-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

        # 1. Main Agro Product
        agro_prod = AgroProduct(
            id=new_id,
            store_id=ctx.store_id,
            category_id=category_id,
            brand_id=brand_id,
            product_name=p_name.strip(),
            product_code=prod_code,
            sku=sku.strip() if sku else None,
            barcode=barcode.strip() if barcode else None,
            description=data.get("description"),
            agro_product_type=agro_type,
            status=data.get("status", "active"),
        )
        db.add(agro_prod)

        # 2. Dynamic Details based on Agro Product Type
        details_data = data.get("details", {}) or data

        if agro_type == "Crop Medicine":
            med = AgroMedicineDetail(
                agro_product_id=agro_prod.id,
                medicine_type=details_data.get("medicine_type", "Insecticide"),
                active_ingredient=details_data.get("active_ingredient"),
                chemical_composition=details_data.get("chemical_composition"),
                concentration=details_data.get("concentration"),
                formulation_type=details_data.get("formulation_type", "EC"),
                target_pest=details_data.get("target_pest"),
                suitable_crops=details_data.get("suitable_crops"),
                application_method=details_data.get("application_method", "Spray"),
                recommended_dosage=details_data.get("recommended_dosage"),
                dosage_unit=details_data.get("dosage_unit", "ml / Litre"),
                waiting_period_phi=details_data.get("waiting_period_phi"),
                re_entry_interval=details_data.get("re_entry_interval"),
                toxicity_class=details_data.get("toxicity_class"),
                registration_number=details_data.get("registration_number"),
                label_instructions=details_data.get("label_instructions"),
                safety_instructions=details_data.get("safety_instructions"),
            )
            db.add(med)

        elif agro_type == "Crop":
            crop = AgroCropDetail(
                agro_product_id=agro_prod.id,
                crop_category=details_data.get("crop_category", "Cereals"),
                crop_variety=details_data.get("crop_variety"),
                crop_season=details_data.get("crop_season", "Kharif"),
                crop_duration=details_data.get("crop_duration"),
                growing_region=details_data.get("growing_region"),
                grade=details_data.get("grade", "Grade A"),
                moisture_content=details_data.get("moisture_content"),
                organic_certified=details_data.get("organic_certified", False),
                harvest_year=details_data.get("harvest_year"),
            )
            db.add(crop)

        elif agro_type == "Fertilizer":
            fert = AgroFertilizerDetail(
                agro_product_id=agro_prod.id,
                fertilizer_type=details_data.get("fertilizer_type", "Chemical Fertilizer"),
                nitrogen_pct=Decimal(str(details_data.get("nitrogen_pct") or 0.0)),
                phosphorus_pct=Decimal(str(details_data.get("phosphorus_pct") or 0.0)),
                potassium_pct=Decimal(str(details_data.get("potassium_pct") or 0.0)),
                sulphur_pct=Decimal(str(details_data.get("sulphur_pct") or 0.0)),
                zinc_pct=Decimal(str(details_data.get("zinc_pct") or 0.0)),
                boron_pct=Decimal(str(details_data.get("boron_pct") or 0.0)),
                physical_form=details_data.get("physical_form", "Granules"),
                application_method=details_data.get("application_method", "Soil Application"),
                suitable_crops=details_data.get("suitable_crops"),
            )
            db.add(fert)

        elif agro_type == "Seeds":
            seed = AgroSeedDetail(
                agro_product_id=agro_prod.id,
                seed_type=details_data.get("seed_type", "Vegetable Seeds"),
                crop_name=details_data.get("crop_name"),
                seed_variety=details_data.get("seed_variety"),
                hybrid_type=details_data.get("hybrid_type", "Hybrid"),
                seed_class=details_data.get("seed_class", "Certified Seed"),
                germination_rate=Decimal(str(details_data.get("germination_rate") or 85.0)),
                physical_purity=Decimal(str(details_data.get("physical_purity") or 98.0)),
                genetic_purity=Decimal(str(details_data.get("genetic_purity") or 99.0)),
                seed_certification_number=details_data.get("seed_certification_number"),
                lot_number=details_data.get("lot_number"),
                days_to_maturity=int(details_data.get("days_to_maturity") or 90) if details_data.get("days_to_maturity") else None,
            )
            db.add(seed)

        # 3. Synchronize with core products for POS/Billing/Invoicing
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

        agro_prod.product_id = core_product.id

        core_pricing = ProductPricing(
            store_id=ctx.store_id,
            product_id=core_product.id,
            purchase_price=purchase_price,
            selling_price=selling_price,
            mrp=Decimal(str(data.get("mrp"))) if data.get("mrp") is not None else None,
            gst_rate=Decimal(str(data.get("gst_rate") or 18.0)),
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
        db.refresh(agro_prod)

        return {
            "success": True,
            "message": "Agro product created successfully.",
            "id": agro_prod.id,
            "product_id": core_product.id,
            "product_name": agro_prod.product_name,
            "agro_product_type": agro_prod.agro_product_type,
            "sku": agro_prod.sku,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create agro product: {str(e)}")


@router.get("/{id}")
def get_agro_product(
    id: str,
    db: Session = Depends(get_db),
    ctx: StoreContext = Depends(get_current_store_context)
):
    """Retrieve full agro product with specific type details."""
    prod = db.query(AgroProduct).filter(
        AgroProduct.id == id,
        AgroProduct.store_id == ctx.store_id,
        AgroProduct.deleted_at.is_(None)
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Agro product not found.")

    res = {
        "id": prod.id,
        "store_id": prod.store_id,
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "product_code": prod.product_code,
        "sku": prod.sku,
        "barcode": prod.barcode,
        "description": prod.description,
        "agro_product_type": prod.agro_product_type,
        "category_id": prod.category_id,
        "brand_id": prod.brand_id,
        "status": prod.status,
    }

    if prod.agro_product_type == "Crop Medicine" and prod.medicine_details:
        m = prod.medicine_details
        res["medicine_details"] = {
            "medicine_type": m.medicine_type,
            "active_ingredient": m.active_ingredient,
            "chemical_composition": m.chemical_composition,
            "concentration": m.concentration,
            "formulation_type": m.formulation_type,
            "target_pest": m.target_pest,
            "suitable_crops": m.suitable_crops,
            "application_method": m.application_method,
            "recommended_dosage": m.recommended_dosage,
            "dosage_unit": m.dosage_unit,
            "waiting_period_phi": m.waiting_period_phi,
            "toxicity_class": m.toxicity_class,
            "registration_number": m.registration_number,
        }
    elif prod.agro_product_type == "Crop" and prod.crop_details:
        c = prod.crop_details
        res["crop_details"] = {
            "crop_category": c.crop_category,
            "crop_variety": c.crop_variety,
            "crop_season": c.crop_season,
            "crop_duration": c.crop_duration,
            "growing_region": c.growing_region,
            "grade": c.grade,
            "moisture_content": c.moisture_content,
            "organic_certified": c.organic_certified,
            "harvest_year": c.harvest_year,
        }
    elif prod.agro_product_type == "Fertilizer" and prod.fertilizer_details:
        f = prod.fertilizer_details
        res["fertilizer_details"] = {
            "fertilizer_type": f.fertilizer_type,
            "nitrogen_pct": float(f.nitrogen_pct or 0),
            "phosphorus_pct": float(f.phosphorus_pct or 0),
            "potassium_pct": float(f.potassium_pct or 0),
            "physical_form": f.physical_form,
            "application_method": f.application_method,
            "suitable_crops": f.suitable_crops,
        }
    elif prod.agro_product_type == "Seeds" and prod.seed_details:
        s = prod.seed_details
        res["seed_details"] = {
            "seed_type": s.seed_type,
            "crop_name": s.crop_name,
            "seed_variety": s.seed_variety,
            "hybrid_type": s.hybrid_type,
            "seed_class": s.seed_class,
            "germination_rate": float(s.germination_rate or 0),
            "physical_purity": float(s.physical_purity or 0),
            "genetic_purity": float(s.genetic_purity or 0),
            "seed_certification_number": s.seed_certification_number,
            "lot_number": s.lot_number,
        }

    return res

