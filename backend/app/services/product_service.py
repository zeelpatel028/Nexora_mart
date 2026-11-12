import uuid
import datetime
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from ..models.product import (
    Product,
    ProductPricing,
    ProductInventory,
    ProductAlert,
    ProductImage,
    ProductVariant,
    ProductBatch,
    ProductSerialNumber,
    ProductGroceryDetail,
    ProductClothingDetail,
    ProductMedicineDetail,
    ProductElectronicsDetail,
    ProductPlasticDetail,
    ProductHandloomDetail,
    ProductFurnitureDetail,
    ProductAgroDetail,
    StoreTypeProductField,
    StoreTypeFieldOption,
    Unit,
)
from ..models.category import Category
from ..models.brand import Brand
from ..models.store import Store
from ..models.store_type import StoreType
from ..models.store_setting import StoreSetting
from ..middleware.store_auth import StoreContext
from ..schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    FormFieldConfig,
    FormFieldOption,
    FormConfigResponse,
)
from .product_validation_service import ProductValidationService


STORE_TYPE_DETAIL_CONFIGS = {
    "grocery": {
        "name": "Grocery Store",
        "model": ProductGroceryDetail,
        "attr": "grocery_details",
        "fields": [
            {"name": "food_type", "label": "Food Type", "type": "select", "options": ["Vegetarian", "Non-Vegetarian", "Vegan", "Egg"], "default": "Vegetarian", "required": False},
            {"name": "item_type", "label": "Item Type", "type": "select", "options": ["Packaged Food", "Staples & Grains", "Fresh Produce", "Dairy Products", "Beverages & Juices", "Snacks & Confectionery", "Personal Care"], "default": "Packaged Food", "required": False},
            {"name": "packaging_type", "label": "Packaging Type", "type": "select", "options": ["Packet / Pouch", "Bottle", "Box / Carton", "Can / Tin", "Glass Jar", "Loose / Bulk", "Tetra Pak"], "default": "Packet / Pouch", "required": False},
            {"name": "net_weight", "label": "Net Weight / Volume", "type": "text", "placeholder": "e.g. 500g, 1 kg, 250ml", "required": False},
        ]
    },
    "clothing": {
        "name": "Clothing Store",
        "model": ProductClothingDetail,
        "attr": "clothing_details",
        "fields": [
            {"name": "clothing_type", "label": "Product Type", "type": "select", "options": ["T-Shirt", "Shirt", "Jeans", "Pants", "Trousers", "Kurti", "Saree", "Dress", "Jacket", "Shorts", "Other"], "default": "T-Shirt", "required": False},
            {"name": "gender", "label": "Gender / Target Group", "type": "select", "options": ["Men", "Women", "Unisex", "Kids", "Boys", "Girls"], "default": "Men", "required": False},
            {"name": "fabric_type", "label": "Fabric Type", "type": "select", "options": ["100% Cotton", "Pure Silk", "Polyester", "Denim", "Linen", "Wool", "Rayon", "Cotton Blend", "Georgette"], "default": "100% Cotton", "required": False},
            {"name": "fit_type", "label": "Fit Type", "type": "select", "options": ["Regular Fit", "Slim Fit", "Oversized Fit", "Relaxed Fit", "Tailored Fit", "Skinny Fit"], "default": "Regular Fit", "required": False},
            {"name": "pattern", "label": "Pattern / Print", "type": "select", "options": ["Solid / Plain", "Striped", "Checked", "Printed", "Embroidered", "Graphic Print"], "default": "Solid / Plain", "required": False},
            {"name": "color", "label": "Color", "type": "text", "placeholder": "e.g. Navy Blue, Jet Black, Maroon", "required": False},
        ]
    },
    "medical": {
        "name": "Medical / Pharmacy Store",
        "model": ProductMedicineDetail,
        "attr": "medicine_details",
        "fields": [
            {"name": "generic_name", "label": "Generic Name / Active Salt", "type": "text", "placeholder": "e.g. Paracetamol Tablets IP, Amoxicillin", "required": False},
            {"name": "dosage_form", "label": "Dosage Form", "type": "select", "options": ["Tablet", "Capsule", "Oral Syrup", "Suspension", "Injection", "Ointment / Cream", "Eye/Ear Drops", "Inhaler", "Powder / Sachet"], "default": "Tablet", "required": False},
            {"name": "strength", "label": "Strength / Potency", "type": "text", "placeholder": "e.g. 500 mg, 10 mg/ml, 250 mcg", "required": False},
            {"name": "prescription_required", "label": "Prescription Required (Rx)", "type": "boolean", "default": "false", "required": False},
            {"name": "schedule_type", "label": "Drug Schedule", "type": "select", "options": ["OTC (Over The Counter)", "Schedule H", "Schedule H1", "Schedule X (Narcotics)"], "default": "OTC (Over The Counter)", "required": False},
            {"name": "pack_size", "label": "Packaging Size", "type": "text", "placeholder": "e.g. 10 Tablets / Strip, 100ml Bottle", "required": False},
        ]
    },
    "mobile_electronics": {
        "name": "Mobile & Electronics Store",
        "model": ProductElectronicsDetail,
        "attr": "electronics_details",
        "fields": [
            {"name": "device_type", "label": "Device Category", "type": "select", "options": ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Smart TV", "Audio & Earbuds", "Gaming Console", "Computer Peripheral", "Home Appliance", "Mobile Accessory"], "default": "Smartphone", "required": False},
            {"name": "model_name", "label": "Model Name / Commercial Name", "type": "text", "placeholder": "e.g. Galaxy S24 Ultra, MacBook Air M3, iPhone 15", "required": False},
            {"name": "color", "label": "Color / Finish", "type": "text", "placeholder": "e.g. Titanium Black, Midnight Blue", "required": False},
            {"name": "ram", "label": "System RAM", "type": "select", "options": ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "64 GB", "N/A"], "default": "8 GB", "required": False},
            {"name": "storage_capacity", "label": "Internal Storage / ROM", "type": "select", "options": ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB SSD", "2 TB SSD", "N/A"], "default": "128 GB", "required": False},
            {"name": "warranty_months", "label": "Warranty Period (Months)", "type": "number", "default": "12", "required": False},
        ]
    },
    "plastic": {
        "name": "Plastic Store",
        "model": ProductPlasticDetail,
        "attr": "plastic_details",
        "fields": [
            {"name": "plastic_type", "label": "Polymer / Plastic Type", "type": "select", "options": ["Polypropylene (PP)", "High Density Polyethylene (HDPE)", "PET", "Low Density Polyethylene (LDPE)", "PVC", "100% Virgin Grade"], "default": "Polypropylene (PP)", "required": False},
            {"name": "capacity", "label": "Storage Capacity", "type": "text", "placeholder": "e.g. 5, 20, 500", "required": False},
            {"name": "capacity_unit", "label": "Capacity Unit", "type": "select", "options": ["Liters", "ml", "Kilograms", "Gallons"], "default": "Liters", "required": False},
            {"name": "color", "label": "Product Color", "type": "text", "placeholder": "e.g. Transparent, Blue, Red, Ivory", "required": False},
            {"name": "food_grade", "label": "Food Grade Certified (BPA Free)", "type": "boolean", "default": "true", "required": False},
        ]
    },
    "handloom": {
        "name": "Handloom Store",
        "model": ProductHandloomDetail,
        "attr": "handloom_details",
        "fields": [
            {"name": "product_type", "label": "Product Type", "type": "select", "options": ["Saree", "Bedsheet & Linen", "Kurta & Apparel", "Shawl & Stole", "Fabric by Meter"], "default": "Saree", "required": False},
            {"name": "fabric_type", "label": "Authentic Fabric Type", "type": "select", "options": ["Pure Khadi Cotton", "Mulberry Pure Silk", "Chanderi Silk Cotton", "Tussar Silk", "Banarasi Katan Silk", "Kanchipuram Silk", "Linen Weave", "Kota Doria"], "default": "Pure Khadi Cotton", "required": False},
            {"name": "craft_type", "label": "Artisan Craft / Heritage Art", "type": "select", "options": ["Zari Brocade", "Bandhani Tie & Dye", "Kalamkari Hand Painting", "Ikat / Patola", "Jamdani Weave", "Kantha Stitch", "Ajrakh Block Print"], "default": "Zari Brocade", "required": False},
            {"name": "origin_region", "label": "Origin Region / Craft Hub", "type": "text", "placeholder": "e.g. Varanasi, Chanderi, Kanchipuram, Sambalpur", "required": False},
            {"name": "color", "label": "Natural / Base Color", "type": "text", "placeholder": "e.g. Indigo Blue, Royal Maroon, Mustard Yellow", "required": False},
        ]
    },
    "furniture": {
        "name": "Furniture Store",
        "model": ProductFurnitureDetail,
        "attr": "furniture_details",
        "fields": [
            {"name": "furniture_type", "label": "Furniture Category", "type": "select", "options": ["Sofa & Couch", "Bed & Cot", "Dining Table & Chairs", "Office Ergonomic Chair", "Wardrobe & Almirah", "Study & Work Desk", "Bookshelf & Cabinet", "Recliner"], "default": "Sofa & Couch", "required": False},
            {"name": "material", "label": "Primary Material", "type": "select", "options": ["Solid Teak Wood", "Sheesham Wood (Rosewood)", "Engineered Wood / MDF", "Solid Oak", "Wrought Iron / Steel"], "default": "Solid Teak Wood", "required": False},
            {"name": "finish_type", "label": "Wood / Surface Finish", "type": "select", "options": ["Walnut Finish", "High Gloss Lacquer", "Warm Honey Oak", "Teak Polished", "Rustic Vintage", "Matte Natural"], "default": "Walnut Finish", "required": False},
            {"name": "dimensions", "label": "Dimensions (L x W x H)", "type": "text", "placeholder": "e.g. 84 x 36 x 32 inches", "required": False},
            {"name": "seating_capacity", "label": "Seating Capacity", "type": "number", "placeholder": "e.g. 3, 6", "required": False},
            {"name": "color", "label": "Upholstery / Wood Color", "type": "text", "placeholder": "e.g. Charcoal Grey, Classic Walnut, Beige Fabric", "required": False},
            {"name": "warranty_months", "label": "Structural Warranty (Months)", "type": "number", "default": "36", "required": False},
        ]
    },
    "agro": {
        "name": "Agro Store",
        "model": ProductAgroDetail,
        "attr": "agro_details",
        "fields": [
            {"name": "agro_category", "label": "Agricultural Category", "type": "select", "options": ["Certified Crop Seeds", "Chemical Fertilizers (NPK)", "Organic Fertilizers & Manure", "Insecticides & Pesticides", "Fungicides & Herbicides", "Plant Growth Regulators"], "default": "Certified Crop Seeds", "required": False},
            {"name": "product_type", "label": "Formulation Type", "type": "select", "options": ["Hybrid F1 Seeds", "Bio-Fertilizer", "Granular NPK", "Liquid Concentrate (EC)", "Soluble Powder (WP)", "Organic Bio-Stimulant"], "default": "Hybrid F1 Seeds", "required": False},
            {"name": "crop_name", "label": "Target Crops", "type": "text", "placeholder": "e.g. Wheat, Paddy, Cotton, Soybean, Tomato, Maize", "required": False},
            {"name": "active_ingredient", "label": "Active Ingredient Molecule", "type": "text", "placeholder": "e.g. Chlorpyrifos 50% + Cypermethrin 5% EC", "required": False},
            {"name": "composition", "label": "Chemical / Biological Composition", "type": "textarea", "placeholder": "e.g. Nitrogen 12%, Phosphorus 32%, Potassium 16%...", "required": False},
            {"name": "dosage", "label": "Recommended Dosage", "type": "text", "placeholder": "e.g. 2 ml per liter of water; 50 kg per acre", "required": False},
            {"name": "pack_size", "label": "Commercial Pack Size", "type": "text", "placeholder": "e.g. 250 ml, 500 ml, 1 Litre, 25 kg Bag", "required": False},
        ]
    }
}


def _normalize_store_type_key(key_str: Optional[str]) -> str:
    if not key_str:
        return "grocery"
    s = str(key_str).lower().strip()
    if "cloth" in s:
        return "clothing"
    if "med" in s or "pharm" in s:
        return "medical"
    if "electr" in s or "mobile" in s:
        return "mobile_electronics"
    if "plast" in s:
        return "plastic"
    if "handloom" in s:
        return "handloom"
    if "furnitur" in s:
        return "furniture"
    if "agro" in s:
        return "agro"
    return "grocery"


def _resolve_context(
    store_or_ctx: Any = None,
    user: Any = None,
    db: Optional[Session] = None,
    store: Any = None,
    store_id: Any = None
) -> StoreContext:
    target = store_or_ctx if store_or_ctx is not None else (store if store is not None else store_id)
    if isinstance(target, StoreContext):
        return target
    if hasattr(target, "user_id"):
        return StoreContext(store=target, user=user, role=getattr(user, "role", "OWNER") if user else "OWNER")
    if target is not None and db is not None:
        try:
            sid = int(target)
            st = db.query(Store).filter(Store.id == sid).first()
            if st:
                return StoreContext(store=st, user=user, role=getattr(user, "role", "OWNER") if user else "OWNER")
        except (ValueError, TypeError):
            pass
        dummy_st = Store(id=int(target) if str(target).isdigit() else 1, user_id=getattr(user, "id", 1))
        return StoreContext(store=dummy_st, user=user, role=getattr(user, "role", "OWNER") if user else "OWNER")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store context could not be resolved.")


class ProductService:
    @staticmethod
    def get_form_config(db: Session, ctx: StoreContext) -> FormConfigResponse:
        """
        Dynamically returns form configuration customized for the user's authenticated store:
        1. Store details
        2. Store type
        3. Common fields (Basic, Pricing, Inventory)
        4. Store-specific fields (ONLY for this store type)
        5. Categories, Brands, Units belonging to this store
        """
        st_key = _normalize_store_type_key(ctx.store_type_code)
        store_config = STORE_TYPE_DETAIL_CONFIGS.get(st_key, STORE_TYPE_DETAIL_CONFIGS["grocery"])

        # Fetch categories and brands scoped to this store
        categories = db.query(Category).filter(
            Category.store_id == ctx.store_id,
            Category.is_active == True
        ).order_by(Category.name.asc()).all()

        brands = db.query(Brand).filter(
            Brand.store_id == ctx.store_id,
            Brand.is_active == True
        ).order_by(Brand.name.asc()).all()

        units = db.query(Unit).filter(
            or_(Unit.store_id == ctx.store_id, Unit.store_id.is_(None))
        ).order_by(Unit.name.asc()).all()

        # Build Common Fields (Clean, minimal, essential)
        common_fields: List[FormFieldConfig] = [
            FormFieldConfig(field_name="product_name", field_label="Product Name", field_type="text", is_required=True, placeholder="Enter product name", display_order=1, section="basic"),
            FormFieldConfig(field_name="category_id", field_label="Category", field_type="select", is_required=True, display_order=2, section="basic"),
        ]
        if st_key != "grocery":
            common_fields.append(
                FormFieldConfig(field_name="brand_id", field_label="Brand", field_type="select", is_required=False, display_order=3, section="basic")
            )
        common_fields.append(
            FormFieldConfig(field_name="unit_id", field_label="Unit of Measure", field_type="select", is_required=False, display_order=4, section="basic")
        )
        if st_key in ("clothing", "agro"):
            common_fields.append(
                FormFieldConfig(field_name="image_url", field_label="Product Image", field_type="text", is_required=False, placeholder="Paste image URL or upload", display_order=5, section="basic")
            )

        # Pricing Section
        common_fields.extend([
            FormFieldConfig(field_name="purchase_price", field_label="Purchase Price (₹)", field_type="number", is_required=False, default_value="0.00", display_order=20, section="pricing"),
            FormFieldConfig(field_name="selling_price", field_label="Selling Price (₹)", field_type="number", is_required=True, default_value="0.00", display_order=21, section="pricing"),
            FormFieldConfig(field_name="mrp", field_label="Maximum Retail Price - MRP (₹)", field_type="number", is_required=False, placeholder="Optional MRP", display_order=22, section="pricing"),
            FormFieldConfig(field_name="tax_type", field_label="Tax Treatment", field_type="select", is_required=False, default_value="exclusive", options=[
                FormFieldOption(label="Tax Exclusive (Base + GST)", value="exclusive", is_default=True),
                FormFieldOption(label="Tax Inclusive (GST included)", value="inclusive"),
                FormFieldOption(label="Tax Exempt / Nil", value="exempt"),
            ], display_order=24, section="pricing"),
            FormFieldConfig(field_name="gst_rate", field_label="GST Rate (%)", field_type="select", is_required=False, default_value="0", options=[
                FormFieldOption(label="0% (Exempt)", value="0", is_default=True),
                FormFieldOption(label="5% GST", value="5"),
                FormFieldOption(label="12% GST", value="12"),
                FormFieldOption(label="18% GST", value="18"),
                FormFieldOption(label="28% GST", value="28"),
            ], display_order=25, section="pricing"),
            FormFieldConfig(field_name="current_stock", field_label="Available Stock Quantity", field_type="number", is_required=False, default_value="0", display_order=30, section="inventory"),
        ])

        # Build Store-Specific Fields (ONLY for this store type)
        store_specific_fields: List[FormFieldConfig] = []
        for idx, f in enumerate(store_config["fields"]):
            opts = None
            if f.get("options"):
                opts = [
                    FormFieldOption(label=opt, value=opt, is_default=(opt == f.get("default")))
                    for opt in f["options"]
                ]
            store_specific_fields.append(
                FormFieldConfig(
                    field_name=f["name"],
                    field_label=f["label"],
                    field_type=f["type"],
                    is_required=f.get("required", False),
                    default_value=str(f["default"]) if f.get("default") is not None else None,
                    placeholder=f.get("placeholder"),
                    display_order=idx + 1,
                    section="store_details",
                    options=opts
                )
            )

        return FormConfigResponse(
            store={
                "id": ctx.store.id,
                "name": ctx.store.name,
                "code": ctx.store.code,
                "currency": ctx.store.currency,
                "currency_symbol": ctx.store.currency_symbol,
            },
            store_type={
                "code": st_key,
                "name": store_config["name"],
                "has_image": st_key in ("clothing", "agro"),
                "has_expiry": st_key in ("medical", "grocery", "agro"),
                "has_brand": st_key != "grocery",
                "has_smart_specs": st_key == "clothing",
                "has_variants": st_key in ("clothing", "footwear", "mobile_electronics", "furniture"),
                "has_batches": st_key in ("medical", "grocery", "agro"),
                "has_serials": st_key in ("mobile_electronics", "electronics"),
            },
            common_fields=common_fields,
            store_specific_fields=store_specific_fields,
            validation_rules={
                "require_product_name": True,
                "require_selling_price": True,
                "unique_sku_per_store": True,
                "unique_barcode_per_store": True,
            },
            categories=[{"id": c.id, "name": c.name, "code": c.code, "icon": c.icon} for c in categories],
            brands=[{"id": b.id, "name": b.name, "code": b.code} for b in brands],
            units=[{"id": u.id, "name": u.name, "symbol": u.symbol} for u in units],
        )

    @staticmethod
    def create_product(
        db: Session,
        store_or_ctx: Any = None,
        user_or_req: Any = None,
        request: Any = None,
        store: Any = None,
        current_user: Any = None
    ) -> Product:
        """
        14-Step Atomic Transaction for Product Creation:
        Guarantees either 100% of the product and its related records are created,
        or completely rolls back on any error without partial database writes.
        """
        actual_store_ctx = store if store is not None else store_or_ctx
        actual_user = current_user if current_user is not None else (user_or_req if not isinstance(user_or_req, (ProductCreate, dict)) else None)

        if request is not None:
            req = request
            ctx = _resolve_context(actual_store_ctx, actual_user, db)
        elif isinstance(user_or_req, (ProductCreate, dict)):
            req = user_or_req
            ctx = _resolve_context(actual_store_ctx, None, db)
        else:
            ctx = _resolve_context(actual_store_ctx, actual_user, db)
            req = request
        request = req

        # Step 1: Permission check
        ctx.require_permission("create_product")

        # Step 2: Validate Category ownership (must belong to this store)
        ProductValidationService.validate_category_ownership(db, ctx.store_id, req.category_id)

        # Step 3: Validate Brand ownership (must belong to this store)
        ProductValidationService.validate_brand_ownership(db, ctx.store_id, req.brand_id)

        # Step 4: Validate SKU uniqueness within this store
        ProductValidationService.validate_sku_uniqueness(db, ctx.store_id, req.sku)

        # Step 5: Validate Barcode uniqueness within this store
        ProductValidationService.validate_barcode_uniqueness(db, ctx.store_id, req.barcode)

        # Step 6: Validate submitted store-specific details against authenticated store type
        ProductValidationService.validate_store_type_details(ctx.store_type_code, req)

        p_name = (req.product_name or req.name or "").strip()
        if not p_name:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Product name is required.")

        # Atomic transaction execution block
        try:
            # Step 7: Insert products record
            new_product_id = str(uuid.uuid4())
            product_code = request.product_code or f"PRD-{ctx.store_id:03d}-{int(datetime.datetime.now().timestamp()) % 1000000:06d}"

            product = Product(
                id=new_product_id,
                store_id=ctx.store_id,
                category_id=request.category_id,
                brand_id=request.brand_id,
                product_name=p_name,
                product_code=product_code,
                sku=request.sku.strip() if request.sku else None,
                barcode=request.barcode.strip() if request.barcode else None,
                description=request.description,
                short_description=request.short_description,
                product_type=request.product_type or "simple",
                unit_id=request.unit_id,
                hsn_code=request.hsn_code,
                status=request.status or "active",
                is_featured=request.is_featured or False,
            )
            db.add(product)
            db.flush()

            # Step 8: Insert Pricing
            pricing_data = request.pricing
            purchase_price = Decimal(str(request.purchase_price if request.purchase_price is not None else (pricing_data.purchase_price if pricing_data else 0.0)))
            selling_price = Decimal(str(request.selling_price if request.selling_price is not None else (pricing_data.selling_price if pricing_data else 0.0)))
            mrp = Decimal(str(request.mrp)) if request.mrp is not None else (Decimal(str(pricing_data.mrp)) if pricing_data and pricing_data.mrp is not None else None)
            tax_type = request.tax_type or (pricing_data.tax_type if pricing_data else "exclusive")
            gst_rate = Decimal(str(request.tax_rate if request.tax_rate is not None else (pricing_data.gst_rate if pricing_data else 0.0)))

            # Intra-state tax split
            cgst_rate = gst_rate / 2 if gst_rate else Decimal("0.00")
            sgst_rate = gst_rate / 2 if gst_rate else Decimal("0.00")
            igst_rate = Decimal("0.00")

            pricing = ProductPricing(
                store_id=ctx.store_id,
                product_id=product.id,
                purchase_price=purchase_price,
                selling_price=selling_price,
                mrp=mrp,
                wholesale_price=Decimal(str(pricing_data.wholesale_price)) if pricing_data and pricing_data.wholesale_price is not None else None,
                discount_type=pricing_data.discount_type if pricing_data else None,
                discount_value=Decimal(str(pricing_data.discount_value)) if pricing_data and pricing_data.discount_value is not None else Decimal("0.00"),
                tax_type=tax_type,
                gst_rate=gst_rate,
                cgst_rate=cgst_rate,
                sgst_rate=sgst_rate,
                igst_rate=igst_rate,
                cess_rate=Decimal(str(pricing_data.cess_rate)) if pricing_data and pricing_data.cess_rate is not None else Decimal("0.00"),
            )
            db.add(pricing)

            # Step 9: Insert Inventory
            inv_data = request.inventory
            opening_stock = Decimal(str(request.initial_stock if request.initial_stock is not None else (inv_data.opening_stock if inv_data else 0.0)))
            current_stock = Decimal(str(request.current_stock if request.current_stock is not None else (inv_data.current_stock if inv_data else opening_stock)))
            minimum_stock = Decimal(str(request.min_stock_level if request.min_stock_level is not None else (inv_data.minimum_stock if inv_data else 5.0)))
            maximum_stock = Decimal(str(inv_data.maximum_stock)) if inv_data and inv_data.maximum_stock is not None else None
            reorder_level = Decimal(str(inv_data.reorder_level)) if inv_data and inv_data.reorder_level is not None else Decimal("10.000")
            warehouse_location = inv_data.warehouse_location if inv_data else None

            inventory = ProductInventory(
                store_id=ctx.store_id,
                product_id=product.id,
                opening_stock=opening_stock,
                current_stock=current_stock,
                reserved_stock=Decimal("0.000"),
                minimum_stock=minimum_stock,
                maximum_stock=maximum_stock,
                reorder_level=reorder_level,
                warehouse_location=warehouse_location,
            )
            db.add(inventory)

            # Step 10: Insert Images
            if request.images:
                for idx, img in enumerate(request.images):
                    db.add(ProductImage(
                        store_id=ctx.store_id,
                        product_id=product.id,
                        image_url=img.image_url,
                        alt_text=img.alt_text,
                        is_primary=img.is_primary or (idx == 0),
                        display_order=img.display_order or idx,
                    ))
            elif request.image_url:
                db.add(ProductImage(
                    store_id=ctx.store_id,
                    product_id=product.id,
                    image_url=request.image_url,
                    is_primary=True,
                    display_order=0,
                ))

            # Step 11: Insert Alerts & Expiry Date
            low_enabled = getattr(request, "low_stock_alert_enabled", None)
            if low_enabled is True or (low_enabled is None and request.alerts and any('low' in str(a.alert_type).lower() and a.is_enabled for a in request.alerts)):
                thresh = getattr(request, "low_stock_threshold", None) or getattr(request, "min_stock_level", None) or 5.0
                db.add(ProductAlert(
                    store_id=ctx.store_id,
                    product_id=product.id,
                    alert_type="low_stock",
                    threshold_value=Decimal(str(thresh)),
                    is_enabled=True,
                    notify_email=False,
                    notify_sms=False
                ))
                inventory.minimum_stock = Decimal(str(thresh))
            elif request.alerts:
                for a in request.alerts:
                    if 'low' in str(a.alert_type).lower():
                        db.add(ProductAlert(
                            store_id=ctx.store_id,
                            product_id=product.id,
                            alert_type=a.alert_type,
                            threshold_value=Decimal(str(a.threshold_value)) if a.threshold_value is not None else None,
                            is_enabled=a.is_enabled,
                            notify_email=a.notify_email,
                            notify_sms=a.notify_sms,
                        ))

            exp_enabled = getattr(request, "expiry_alert_enabled", None)
            exp_d_val = getattr(request, "expiry_date", None)
            if exp_enabled is True and exp_d_val:
                exp_dt = exp_d_val
                if isinstance(exp_dt, str) and exp_dt.strip():
                    try:
                        exp_dt = datetime.datetime.fromisoformat(exp_dt.strip())
                    except Exception:
                        pass
                product.expiry_date = exp_dt
                db.add(ProductAlert(
                    store_id=ctx.store_id,
                    product_id=product.id,
                    alert_type="expiring_soon",
                    expiry_date=exp_dt,
                    alert_days_before=int(getattr(request, "alert_days_before", None) or 7),
                    is_enabled=True,
                    notify_email=False,
                    notify_sms=False
                ))
            elif request.alerts:
                for a in request.alerts:
                    if 'expir' in str(a.alert_type).lower():
                        exp_dt = getattr(a, "expiry_date", None)
                        if isinstance(exp_dt, str) and exp_dt.strip():
                            try:
                                exp_dt = datetime.datetime.fromisoformat(exp_dt.strip())
                            except Exception:
                                pass
                        if exp_dt:
                            product.expiry_date = exp_dt
                        db.add(ProductAlert(
                            store_id=ctx.store_id,
                            product_id=product.id,
                            alert_type=a.alert_type,
                            expiry_date=exp_dt,
                            alert_days_before=a.alert_days_before or 7,
                            is_enabled=a.is_enabled,
                            notify_email=a.notify_email,
                            notify_sms=a.notify_sms,
                        ))

            # Step 12: Insert Variants
            if request.variants:
                for v in request.variants:
                    db.add(ProductVariant(
                        store_id=ctx.store_id,
                        product_id=product.id,
                        variant_name=v.variant_name,
                        sku=v.sku,
                        barcode=v.barcode,
                        attributes=v.attributes or {},
                        purchase_price=Decimal(str(v.purchase_price or 0.0)),
                        selling_price=Decimal(str(v.selling_price or selling_price)),
                        mrp=Decimal(str(v.mrp)) if v.mrp is not None else mrp,
                        stock_quantity=Decimal(str(v.stock_quantity or 0.0)),
                        is_active=v.is_active,
                    ))

            # Step 13: Insert Batches
            if request.batches:
                for b in request.batches:
                    mfg = b.manufacturing_date if isinstance(b.manufacturing_date, datetime.datetime) else (
                        datetime.datetime.combine(b.manufacturing_date, datetime.time.min) if isinstance(b.manufacturing_date, datetime.date) else None
                    )
                    exp = b.expiry_date if isinstance(b.expiry_date, datetime.datetime) else (
                        datetime.datetime.combine(b.expiry_date, datetime.time.min) if isinstance(b.expiry_date, datetime.date) else None
                    )
                    db.add(ProductBatch(
                        store_id=ctx.store_id,
                        product_id=product.id,
                        batch_number=b.batch_number,
                        manufacturing_date=mfg,
                        expiry_date=exp,
                        purchase_price=Decimal(str(b.purchase_price or 0.0)),
                        selling_price=Decimal(str(b.selling_price or selling_price)),
                        mrp=Decimal(str(b.mrp)) if b.mrp is not None else mrp,
                        initial_quantity=Decimal(str(b.initial_quantity or 0.0)),
                        current_quantity=Decimal(str(b.current_quantity or 0.0)),
                        supplier_id=b.supplier_id,
                        is_active=b.is_active,
                    ))

            # Step 14: Insert Store-Specific Details Record
            st_key = _normalize_store_type_key(ctx.store_type_code)
            st_cfg = STORE_TYPE_DETAIL_CONFIGS.get(st_key, STORE_TYPE_DETAIL_CONFIGS["grocery"])
            detail_model = st_cfg["model"]
            detail_attr = st_cfg["attr"]

            # Merge detail data from specific schema, generic store_details, or attributes
            submitted_detail = getattr(request, detail_attr, None)
            detail_dict = {}
            if submitted_detail:
                detail_dict.update(submitted_detail.model_dump(exclude_unset=True) if hasattr(submitted_detail, "model_dump") else submitted_detail)
            if request.store_details:
                detail_dict.update(request.store_details)
            if request.attributes:
                detail_dict.update(request.attributes)

            # Clean and sanitize keys matching model columns
            valid_cols = {col.name for col in detail_model.__table__.columns}
            cleaned_detail = {k: v for k, v in detail_dict.items() if k in valid_cols and k not in ("id", "store_id", "product_id", "created_at", "updated_at")}

            # If clothing, extract smart specifications
            if st_key == "clothing":
                specs = dict(detail_dict.get("specifications") or {})
                for k, v in detail_dict.items():
                    if k not in valid_cols and k not in ("id", "store_id", "product_id", "created_at", "updated_at"):
                        specs[k] = v
                cleaned_detail["specifications"] = specs

            # Parse date strings if any
            for date_key in ("manufacturing_date", "expiry_date"):
                if date_key in cleaned_detail and isinstance(cleaned_detail[date_key], str) and cleaned_detail[date_key].strip():
                    try:
                        cleaned_detail[date_key] = datetime.datetime.fromisoformat(cleaned_detail[date_key].strip())
                    except Exception:
                        pass

            detail_record = detail_model(
                store_id=ctx.store_id,
                product_id=product.id,
                **cleaned_detail
            )
            db.add(detail_record)

            # Atomic commit
            db.commit()
            db.refresh(product)
            return product

        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create product atomically: {str(e)}"
            )

    @staticmethod
    def list_products(
        db: Session,
        ctx: Optional[Any] = None,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        search: Optional[str] = None,
        barcode: Optional[str] = None,
        status_filter: Optional[str] = None,
        stock_filter: Optional[str] = None,
        is_active: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 50,
        store: Optional[Any] = None,
        store_id: Optional[Any] = None,
        user: Optional[Any] = None,
        **kwargs
    ) -> Tuple[List[Product], int]:
        """
        Retrieves products strictly belonging to the authorized store.
        Multi-tenant isolation guaranteed: Store A cannot view Store B products.
        """
        resolved_ctx = _resolve_context(store_or_ctx=ctx, user=user, db=db, store=store, store_id=store_id)
        query = db.query(Product).filter(
            Product.store_id == resolved_ctx.store_id,
            Product.deleted_at.is_(None)
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if brand_id:
            query = query.filter(Product.brand_id == brand_id)

        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.product_name.ilike(s),
                    Product.sku.ilike(s),
                    Product.barcode.ilike(s),
                    Product.product_code.ilike(s),
                )
            )

        if barcode and barcode.strip():
            query = query.filter(Product.barcode == barcode.strip())

        if status_filter:
            query = query.filter(Product.status == status_filter.strip().lower())

        if is_active is not None:
            target_status = "active" if is_active else "inactive"
            query = query.filter(Product.status == target_status)

        # Stock filtering via join
        if stock_filter:
            query = query.join(Product.inventory_record)
            if stock_filter == "in_stock":
                query = query.filter(ProductInventory.current_stock > 0)
            elif stock_filter == "out_of_stock":
                query = query.filter(ProductInventory.current_stock <= 0)
            elif stock_filter == "low_stock":
                query = query.filter(
                    ProductInventory.current_stock > 0,
                    ProductInventory.current_stock <= ProductInventory.minimum_stock
                )

        total_count = query.count()

        # Sorting
        order_col = Product.created_at
        if sort_by == "name" or sort_by == "product_name":
            order_col = Product.product_name
        elif sort_by == "sku":
            order_col = Product.sku

        if sort_order.lower() == "asc":
            query = query.order_by(asc(order_col))
        else:
            query = query.order_by(desc(order_col))

        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()
        return products, total_count

    @staticmethod
    def get_product(
        db: Session,
        ctx: Optional[Any] = None,
        product_id: Optional[str] = None,
        store: Optional[Any] = None,
        store_id: Optional[Any] = None,
        user: Optional[Any] = None,
        **kwargs
    ) -> Product:
        """
        Retrieves full product details.
        Enforces tenant isolation: Returns 404 if product does not exist or belongs to another store.
        """
        resolved_ctx = _resolve_context(store_or_ctx=ctx, user=user, db=db, store=store, store_id=store_id)
        pid = product_id if product_id is not None else kwargs.get("id")
        product = db.query(Product).filter(
            Product.id == pid,
            Product.deleted_at.is_(None)
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{pid}' not found."
            )

        if product.store_id != resolved_ctx.store_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{pid}' not found."
            )

        return product

    @staticmethod
    def update_product(
        db: Session,
        ctx: Optional[Any] = None,
        product_id: Optional[str] = None,
        request: Optional[Any] = None,
        store: Optional[Any] = None,
        store_id: Optional[Any] = None,
        user: Optional[Any] = None,
        **kwargs
    ) -> Product:
        """
        Updates product and all related tables in an atomic transaction.
        Enforces tenant isolation: Cannot modify another store's product (TEST 3).
        """
        resolved_ctx = _resolve_context(store_or_ctx=ctx, user=user, db=db, store=store, store_id=store_id)
        resolved_ctx.require_permission("edit_product")
        pid = product_id if product_id is not None else kwargs.get("id")
        req = request if request is not None else kwargs.get("product_data") or kwargs.get("update_data")
        product = ProductService.get_product(db, resolved_ctx, pid)
        ctx = resolved_ctx
        request = req

        # Validate category and brand ownership if changed
        if request and getattr(request, "category_id", None) is not None:
            ProductValidationService.validate_category_ownership(db, ctx.store_id, request.category_id)
            product.category_id = request.category_id

        if request and getattr(request, "brand_id", None) is not None:
            ProductValidationService.validate_brand_ownership(db, ctx.store_id, request.brand_id)
            product.brand_id = request.brand_id

        if request and getattr(request, "sku", None) is not None:
            ProductValidationService.validate_sku_uniqueness(db, ctx.store_id, request.sku, exclude_product_id=product.id)
            product.sku = request.sku.strip() if request.sku else None

        if request and getattr(request, "barcode", None) is not None:
            ProductValidationService.validate_barcode_uniqueness(db, ctx.store_id, request.barcode, exclude_product_id=product.id)
            product.barcode = request.barcode.strip() if request.barcode else None

        # Validate store type details
        if request:
            ProductValidationService.validate_store_type_details(ctx.store_type_code, request)

        try:
            # Update product master
            if request:
                p_name = getattr(request, "product_name", None) or getattr(request, "name", None)
                if p_name is not None and str(p_name).strip():
                    product.product_name = str(p_name).strip()
                if getattr(request, "description", None) is not None:
                    product.description = request.description
                if getattr(request, "short_description", None) is not None:
                    product.short_description = request.short_description
                if getattr(request, "unit_id", None) is not None:
                    product.unit_id = request.unit_id
                if getattr(request, "hsn_code", None) is not None:
                    product.hsn_code = request.hsn_code
                if getattr(request, "status", None) is not None:
                    product.status = request.status
                if getattr(request, "is_active", None) is not None:
                    product.status = "active" if request.is_active else "inactive"
                if getattr(request, "is_featured", None) is not None:
                    product.is_featured = request.is_featured

            # Update Pricing
            if request and (getattr(request, "pricing", None) or getattr(request, "selling_price", None) is not None or getattr(request, "purchase_price", None) is not None or getattr(request, "mrp", None) is not None):
                pricing = product.pricing
                if not pricing:
                    pricing = ProductPricing(store_id=ctx.store_id, product_id=product.id)
                    db.add(pricing)
                if getattr(request, "purchase_price", None) is not None:
                    pricing.purchase_price = Decimal(str(request.purchase_price))
                if getattr(request, "selling_price", None) is not None:
                    pricing.selling_price = Decimal(str(request.selling_price))
                if getattr(request, "mrp", None) is not None:
                    pricing.mrp = Decimal(str(request.mrp))
                if getattr(request, "pricing", None):
                    if request.pricing.wholesale_price is not None:
                        pricing.wholesale_price = Decimal(str(request.pricing.wholesale_price))
                    if request.pricing.tax_type:
                        pricing.tax_type = request.pricing.tax_type
                    if request.pricing.gst_rate is not None:
                        gst = Decimal(str(request.pricing.gst_rate))
                        pricing.gst_rate = gst
                        pricing.cgst_rate = gst / 2
                        pricing.sgst_rate = gst / 2

            # Update Inventory
            if request and (getattr(request, "inventory", None) or getattr(request, "current_stock", None) is not None or getattr(request, "min_stock_level", None) is not None):
                inv = product.inventory_record
                if not inv:
                    inv = ProductInventory(store_id=ctx.store_id, product_id=product.id)
                    db.add(inv)
                if getattr(request, "current_stock", None) is not None:
                    # Check negative stock store setting
                    setting = db.query(StoreSetting).filter(StoreSetting.store_id == ctx.store_id).first()
                    allow_negative = setting.allow_negative_stock if setting else False
                    new_stock = Decimal(str(request.current_stock))
                    if new_stock < 0 and not allow_negative:
                        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Negative stock is not permitted for your store.")
                    inv.current_stock = new_stock
                    inv.last_stock_update = datetime.datetime.now(datetime.timezone.utc)
                if getattr(request, "min_stock_level", None) is not None:
                    inv.minimum_stock = Decimal(str(request.min_stock_level))
                if getattr(request, "inventory", None):
                    if request.inventory.warehouse_location is not None:
                        inv.warehouse_location = request.inventory.warehouse_location

            # Update Alerts (Low Stock Alert & Expiry Alert)
            if request:
                low_enabled = getattr(request, "low_stock_alert_enabled", None)
                if low_enabled is not None:
                    low_alert = db.query(ProductAlert).filter(
                        ProductAlert.product_id == product.id,
                        ProductAlert.alert_type.in_(["low_stock", "LOW_STOCK"])
                    ).first()
                    if low_enabled:
                        thresh = getattr(request, "low_stock_threshold", None) or (float(low_alert.threshold_value) if low_alert and low_alert.threshold_value is not None else 5.0)
                        if not low_alert:
                            low_alert = ProductAlert(store_id=ctx.store_id, product_id=product.id, alert_type="low_stock")
                            db.add(low_alert)
                        low_alert.threshold_value = Decimal(str(thresh))
                        low_alert.is_enabled = True
                        if product.inventory_record:
                            product.inventory_record.minimum_stock = Decimal(str(thresh))
                    else:
                        if low_alert:
                            low_alert.is_enabled = False

                exp_enabled = getattr(request, "expiry_alert_enabled", None)
                if exp_enabled is not None:
                    exp_alert = db.query(ProductAlert).filter(
                        ProductAlert.product_id == product.id,
                        ProductAlert.alert_type.in_(["expiring_soon", "EXPIRY_WARNING"])
                    ).first()
                    if exp_enabled:
                        if not exp_alert:
                            exp_alert = ProductAlert(store_id=ctx.store_id, product_id=product.id, alert_type="expiring_soon")
                            db.add(exp_alert)
                        exp_d_val = getattr(request, "expiry_date", None)
                        if exp_d_val:
                            exp_dt = exp_d_val
                            if isinstance(exp_dt, str) and exp_dt.strip():
                                try:
                                    exp_dt = datetime.datetime.fromisoformat(exp_dt.strip())
                                except Exception:
                                    pass
                            exp_alert.expiry_date = exp_dt
                            product.expiry_date = exp_dt
                        if getattr(request, "alert_days_before", None) is not None:
                            exp_alert.alert_days_before = int(request.alert_days_before)
                        exp_alert.is_enabled = True
                    else:
                        if exp_alert:
                            exp_alert.is_enabled = False

                if getattr(request, "image_url", None) is not None:
                    primary_img = db.query(ProductImage).filter(
                        ProductImage.product_id == product.id,
                        ProductImage.is_primary == True
                    ).first()
                    if primary_img:
                        primary_img.image_url = request.image_url
                    elif request.image_url:
                        db.add(ProductImage(store_id=ctx.store_id, product_id=product.id, image_url=request.image_url, is_primary=True))

            # Update Store-Specific Details
            if request:
                st_key = _normalize_store_type_key(ctx.store_type_code)
                st_cfg = STORE_TYPE_DETAIL_CONFIGS.get(st_key, STORE_TYPE_DETAIL_CONFIGS["grocery"])
                detail_model = st_cfg["model"]
                detail_attr = st_cfg["attr"]

                submitted_detail = getattr(request, detail_attr, None)
                detail_dict = {}
                if submitted_detail:
                    detail_dict.update(submitted_detail.model_dump(exclude_unset=True) if hasattr(submitted_detail, "model_dump") else submitted_detail)
                if getattr(request, "store_details", None):
                    detail_dict.update(request.store_details)
                if getattr(request, "attributes", None):
                    detail_dict.update(request.attributes)

                if detail_dict:
                    existing_detail = getattr(product, detail_attr, None)
                    if not existing_detail:
                        existing_detail = detail_model(store_id=ctx.store_id, product_id=product.id)
                        db.add(existing_detail)
                    valid_cols = {col.name for col in detail_model.__table__.columns}
                    for k, v in detail_dict.items():
                        if k in valid_cols and k not in ("id", "store_id", "product_id", "created_at", "updated_at"):
                            setattr(existing_detail, k, v)

                    # For clothing: store custom/smart specifications
                    if st_key == "clothing":
                        specs = dict(detail_dict.get("specifications") or {})
                        for k, v in detail_dict.items():
                            if k not in valid_cols and k not in ("id", "store_id", "product_id", "created_at", "updated_at"):
                                specs[k] = v
                        existing_detail.specifications = specs

            db.commit()
            db.refresh(product)
            return product

        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update product: {str(e)}"
            )

    @staticmethod
    def delete_product(
        db: Session,
        ctx: Optional[Any] = None,
        product_id: Optional[str] = None,
        store: Optional[Any] = None,
        store_id: Optional[Any] = None,
        user: Optional[Any] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Safe Soft-Delete of Product:
        Enforces tenant isolation: User B cannot delete User A's product (TEST 4).
        Preserves historical transactions and relations.
        """
        resolved_ctx = _resolve_context(store_or_ctx=ctx, user=user, db=db, store=store, store_id=store_id)
        resolved_ctx.require_permission("delete_product")
        pid = product_id if product_id is not None else kwargs.get("id")
        product = ProductService.get_product(db, resolved_ctx, pid)

        product.deleted_at = datetime.datetime.now(datetime.timezone.utc)
        product.status = "deleted"
        db.commit()
        return {"status": "success", "message": f"Product '{product.product_name}' was safely removed from catalog."}

    @staticmethod
    def get_active_alerts(db: Session, ctx: Any) -> Dict[str, Any]:
        """
        Retrieves real-time active Low Stock and Expiry alerts for the current store.
        Avoids duplicates, checks enable toggles, and filters by threshold / warning window.
        """
        resolved_ctx = _resolve_context(store_or_ctx=ctx, db=db)
        store_id = resolved_ctx.store_id
        today = datetime.datetime.now(datetime.timezone.utc).date()

        products = db.query(Product).filter(
            Product.store_id == store_id,
            Product.deleted_at.is_(None),
            Product.status == "active"
        ).all()

        low_stock_alerts = []
        expiry_alerts = []
        seen_keys = set()

        for p in products:
            curr_stock = float(p.current_stock or 0.0)
            p_name = p.product_name or p.name or "Product"

            # Check low stock alerts
            if getattr(p, "alerts", None):
                for a in p.alerts:
                    atype = str(a.alert_type).lower()
                    if "low" in atype and a.is_enabled:
                        threshold = float(a.threshold_value) if a.threshold_value is not None else float(p.min_stock_level or 5.0)
                        if curr_stock <= threshold:
                            key = f"low_{p.id}"
                            if key not in seen_keys:
                                seen_keys.add(key)
                                low_stock_alerts.append({
                                    "id": key,
                                    "product_id": p.id,
                                    "product_name": p_name,
                                    "type": "low_stock",
                                    "title": "Low Stock Alert",
                                    "message": f"'{p_name}' has only {int(curr_stock)} units left (Threshold: {int(threshold)}).",
                                    "current_stock": curr_stock,
                                    "threshold": threshold,
                                    "category": p.category.name if p.category else "General",
                                    "severity": "danger" if curr_stock <= 0 else "warning"
                                })

            # Check expiry alerts
            if getattr(p, "alerts", None):
                for a in p.alerts:
                    atype = str(a.alert_type).lower()
                    if "expir" in atype and a.is_enabled:
                        exp_val = a.expiry_date or getattr(p, "expiry_date", None)
                        if exp_val:
                            d_target = exp_val.date() if isinstance(exp_val, datetime.datetime) else exp_val
                            days_before = int(a.alert_days_before or 7)
                            days_left = (d_target - today).days
                            if days_left <= days_before:
                                key = f"exp_{p.id}"
                                if key not in seen_keys:
                                    seen_keys.add(key)
                                    expiry_alerts.append({
                                        "id": key,
                                        "product_id": p.id,
                                        "product_name": p_name,
                                        "type": "expiring_soon",
                                        "title": "Expiry Alert",
                                        "message": f"'{p_name}' expires on {d_target.strftime('%d/%m/%Y')} ({days_left} days left).",
                                        "days_left": days_left,
                                        "expiry_date": d_target.isoformat(),
                                        "category": p.category.name if p.category else "General",
                                        "severity": "danger" if days_left <= 0 else "warning"
                                    })

        combined = low_stock_alerts + expiry_alerts
        return {
            "total_count": len(combined),
            "low_stock_count": len(low_stock_alerts),
            "expiry_count": len(expiry_alerts),
            "low_stock": low_stock_alerts,
            "expiring_soon": expiry_alerts,
            "all": combined
        }
