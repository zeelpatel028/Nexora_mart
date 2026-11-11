from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.category import Category
from ..models.brand import Brand
from ..models.product import Product
from ..schemas.product_schema import ProductCreate, ProductUpdate


STORE_TYPE_DETAIL_MAP = {
    "grocery": "grocery_details",
    "clothing": "clothing_details",
    "medical": "medicine_details",
    "mobile_electronics": "electronics_details",
    "electronics": "electronics_details",
    "plastic": "plastic_details",
    "handloom": "handloom_details",
    "furniture": "furniture_details",
    "agro": "agro_details",
}

# Signatures for cross-store detail validation
DISALLOWED_FIELDS_BY_STORE_TYPE = {
    "clothing": ["salt_composition", "generic_name", "schedule_type", "dosage_form", "prescription_required", "fssai_license", "seed_variety", "crop_name"],
    "grocery": ["clothing_type", "fabric_type", "salt_composition", "ram", "processor", "screen_size", "seed_variety"],
    "medical": ["clothing_type", "fabric_type", "ram", "processor", "screen_size", "agro_category", "furniture_type"],
    "mobile_electronics": ["salt_composition", "clothing_type", "fabric_type", "food_type", "fssai_license", "seed_variety"],
    "plastic": ["salt_composition", "clothing_type", "ram", "processor", "seed_variety"],
    "handloom": ["salt_composition", "ram", "processor", "food_type", "seed_variety"],
    "furniture": ["salt_composition", "food_type", "seed_variety", "fssai_license"],
    "agro": ["clothing_type", "fabric_type", "ram", "processor", "dosage_form"],
}


class ProductValidationService:
    @staticmethod
    def validate_category_ownership(db: Session, store_id: int, category_id: Optional[int]):
        """Ensure category belongs to the authenticated store."""
        if not category_id:
            return
        cat = db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {category_id} not found."
            )
        if cat.store_id != store_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Category {category_id} belongs to another store."
            )

    @staticmethod
    def validate_brand_ownership(db: Session, store_id: int, brand_id: Optional[int]):
        """Ensure brand belongs to the authenticated store."""
        if not brand_id:
            return
        brand = db.query(Brand).filter(Brand.id == brand_id).first()
        if not brand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Brand {brand_id} not found."
            )
        if brand.store_id != store_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Brand {brand_id} belongs to another store."
            )

    @staticmethod
    def validate_sku_uniqueness(db: Session, store_id: int, sku: Optional[str], exclude_product_id: Optional[str] = None):
        """SKU must be unique within the current store, but can exist in other stores."""
        if not sku or not sku.strip():
            return
        query = db.query(Product).filter(
            Product.store_id == store_id,
            Product.sku == sku.strip(),
            Product.deleted_at.is_(None)
        )
        if exclude_product_id:
            query = query.filter(Product.id != exclude_product_id)
        existing = query.first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{sku}' already exists in your store."
            )

    @staticmethod
    def validate_barcode_uniqueness(db: Session, store_id: int, barcode: Optional[str], exclude_product_id: Optional[str] = None):
        """Barcode must be unique within current store."""
        if not barcode or not barcode.strip():
            return
        query = db.query(Product).filter(
            Product.store_id == store_id,
            Product.barcode == barcode.strip(),
            Product.deleted_at.is_(None)
        )
        if exclude_product_id:
            query = query.filter(Product.id != exclude_product_id)
        existing = query.first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Barcode '{barcode}' already exists in your store."
            )

    @staticmethod
    def validate_store_type_details(store_type_code: str, request: Any):
        """
        Validates that submitted product details match the current store type.
        Prevents e.g. a clothing store from submitting medicine details (TEST 9).
        """
        code = store_type_code.lower()
        if "grocery" in code:
            normalized_type = "grocery"
        elif "clothing" in code:
            normalized_type = "clothing"
        elif "medical" in code or "pharmacy" in code:
            normalized_type = "medical"
        elif "electronic" in code or "mobile" in code:
            normalized_type = "mobile_electronics"
        elif "plastic" in code:
            normalized_type = "plastic"
        elif "handloom" in code:
            normalized_type = "handloom"
        elif "furniture" in code:
            normalized_type = "furniture"
        elif "agro" in code:
            normalized_type = "agro"
        else:
            normalized_type = "grocery"

        allowed_detail_attr = STORE_TYPE_DETAIL_MAP.get(normalized_type)

        # Check explicit detail schemas
        detail_fields = [
            ("grocery_details", "Grocery"),
            ("clothing_details", "Clothing"),
            ("medicine_details", "Medical / Pharmacy"),
            ("electronics_details", "Mobile & Electronics"),
            ("plastic_details", "Plastic"),
            ("handloom_details", "Handloom"),
            ("furniture_details", "Furniture"),
            ("agro_details", "Agro"),
        ]

        for attr, label in detail_fields:
            val = getattr(request, attr, None)
            if val is not None and attr != allowed_detail_attr:
                # If non-empty dict or model
                d = val.model_dump(exclude_unset=True) if hasattr(val, "model_dump") else (val if isinstance(val, dict) else {})
                if any(v is not None and v != "" for v in d.values()):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Invalid payload: Store type '{normalized_type}' cannot submit {label} details."
                    )

        # Check generic store_details or attributes dict for disallowed keys
        disallowed = DISALLOWED_FIELDS_BY_STORE_TYPE.get(normalized_type, [])
        dicts_to_check = []
        if getattr(request, "store_details", None):
            dicts_to_check.append(request.store_details)
        if getattr(request, "attributes", None):
            dicts_to_check.append(request.attributes)

        for d in dicts_to_check:
            if isinstance(d, dict):
                for k in d.keys():
                    if k in disallowed and d[k]:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Field '{k}' is not permitted for store type '{normalized_type}'."
                        )

