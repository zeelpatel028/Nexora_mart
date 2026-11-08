import logging
from sqlalchemy.orm import Session
from ..models.category import Category, CategoryField
from ..models.unit import Unit
from ..models.store import Store
from ..models.user import User

logger = logging.getLogger("seed_service")

# 8 Standardized Store Categories as specified by NMART requirements
INITIAL_CATEGORIES = [
    {
        "name": "Grocery Store",
        "code": "GROCERY",
        "icon": "shopping-basket",
        "description": "Daily essentials, packaged food items, groceries, and staples.",
        "legacy_aliases": ["Supermarket & Grocery", "Supermarket", "grocery", "supermarket"],
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Nestle, Kellogg's, Tata", "display_order": 1},
            {"field_name": "weight", "field_label": "Weight / Volume", "field_type": "number", "is_required": False, "placeholder": "e.g. 500, 1", "display_order": 2},
            {"field_name": "unit", "field_label": "Unit", "field_type": "select", "is_required": True, "options": ["kg", "g", "liter", "ml", "packet", "piece", "box"], "default_value": "kg", "display_order": 3},
            {"field_name": "mrp", "field_label": "MRP", "field_type": "number", "is_required": False, "placeholder": "Maximum Retail Price", "display_order": 4},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": False, "placeholder": "YYYY-MM-DD", "display_order": 5},
        ]
    },
    {
        "name": "Clothing Store",
        "code": "CLOTHING",
        "icon": "checkroom",
        "description": "Men's, women's, and kids' apparel, textiles, and fashion garments.",
        "legacy_aliases": ["Clothing & Fashion", "clothing"],
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Zara, Levi's, Raymond", "display_order": 1},
            {"field_name": "size", "field_label": "Size", "field_type": "select", "is_required": True, "options": ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38"], "default_value": "M", "is_variant_field": True, "display_order": 2},
            {"field_name": "color", "field_label": "Color", "field_type": "select", "is_required": True, "options": ["Black", "White", "Navy Blue", "Red", "Green", "Grey", "Yellow", "Beige", "Olive"], "default_value": "Black", "is_variant_field": True, "display_order": 3},
            {"field_name": "fabric", "field_label": "Fabric", "field_type": "select", "is_required": False, "options": ["100% Cotton", "Polyester", "Denim", "Linen", "Silk", "Wool", "Rayon", "Blend"], "default_value": "100% Cotton", "display_order": 4},
        ]
    },
    {
        "name": "Medical / Pharmacy Store",
        "code": "PHARMACY",
        "icon": "medical-services",
        "description": "Pharmaceuticals, medicines, surgical supplies, and healthcare goods.",
        "legacy_aliases": ["Pharmacy & Medical", "Medical Store", "medical", "pharmacy"],
        "fields": [
            {"field_name": "manufacturer", "field_label": "Manufacturer", "field_type": "text", "is_required": True, "placeholder": "e.g. Cipla, Sun Pharma, Pfizer", "display_order": 1},
            {"field_name": "batch_number", "field_label": "Batch Number", "field_type": "text", "is_required": True, "placeholder": "e.g. BATCH-2026-X", "display_order": 2},
            {"field_name": "composition", "field_label": "Composition / Salt", "field_type": "text", "is_required": False, "placeholder": "e.g. Paracetamol 500mg", "display_order": 3},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": True, "placeholder": "YYYY-MM-DD", "display_order": 4},
            {"field_name": "mrp", "field_label": "MRP", "field_type": "number", "is_required": True, "placeholder": "Maximum Retail Price", "display_order": 5},
            {"field_name": "prescription_required", "field_label": "Prescription Required", "field_type": "select", "is_required": False, "options": ["Yes", "No"], "default_value": "No", "display_order": 6},
        ]
    },
    {
        "name": "Mobile & Electronics Store",
        "code": "ELECTRONICS",
        "icon": "devices",
        "description": "Smartphones, consumer appliances, computing devices, audio, and gadgets.",
        "legacy_aliases": ["Electronics & Mobile", "Electronics Store", "Mobile Accessories", "electronics", "mobile_accessories"],
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": True, "placeholder": "e.g. Apple, Samsung, Sony, OnePlus", "display_order": 1},
            {"field_name": "model_number", "field_label": "Model Number / Name", "field_type": "text", "is_required": True, "placeholder": "e.g. iPhone 15 Pro, Galaxy S24", "display_order": 2},
            {"field_name": "serial_imei", "field_label": "Serial / IMEI Number", "field_type": "text", "is_required": False, "placeholder": "Unique Serial or IMEI", "display_order": 3},
            {"field_name": "storage_ram", "field_label": "Storage / RAM", "field_type": "select", "is_required": False, "options": ["64GB", "128GB", "256GB", "512GB", "1TB", "8GB/128GB", "12GB/256GB"], "default_value": "128GB", "display_order": 4},
            {"field_name": "warranty", "field_label": "Warranty", "field_type": "select", "is_required": True, "options": ["No Warranty", "6 Months", "1 Year", "2 Years", "3 Years"], "default_value": "1 Year", "display_order": 5},
        ]
    },
    {
        "name": "Plastic Store",
        "code": "PLASTIC",
        "icon": "inventory",
        "description": "Plastic housewares, containers, storage boxes, kitchen utilities, and polymer goods.",
        "legacy_aliases": ["plastic"],
        "fields": [
            {"field_name": "material", "field_label": "Plastic Material", "field_type": "select", "is_required": False, "options": ["Virgin Plastic", "BPA Free", "HDPE", "Polypropylene (PP)", "Polycarbonate"], "default_value": "BPA Free", "display_order": 1},
            {"field_name": "capacity", "field_label": "Capacity / Volume", "field_type": "select", "is_required": False, "options": ["250ml", "500ml", "1 Liter", "2 Liters", "5 Liters", "10 Liters", "25 Liters", "50 Liters"], "default_value": "1 Liter", "display_order": 2},
            {"field_name": "color", "field_label": "Color", "field_type": "text", "is_required": False, "placeholder": "e.g. Transparent, Blue, Red", "display_order": 3},
            {"field_name": "pack_size", "field_label": "Pack Size", "field_type": "number", "is_required": False, "placeholder": "e.g. 1, 3, 6, 12", "display_order": 4},
        ]
    },
    {
        "name": "Handloom store",
        "code": "HANDLOOM",
        "icon": "style",
        "description": "Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings.",
        "legacy_aliases": ["Handloom Store", "handloom"],
        "fields": [
            {"field_name": "weave_type", "field_label": "Weave Type", "field_type": "select", "is_required": True, "options": ["Khadi", "Chanderi", "Banarasi", "Silk Weave", "Pure Cotton", "Ikat", "Linen"], "default_value": "Pure Cotton", "display_order": 1},
            {"field_name": "pattern", "field_label": "Pattern / Style", "field_type": "text", "is_required": False, "placeholder": "e.g. Hand Block Print, Zari Border, Floral", "display_order": 2},
            {"field_name": "color", "field_label": "Color", "field_type": "text", "is_required": False, "placeholder": "e.g. Maroon, Indigo, Mustard", "display_order": 3},
            {"field_name": "dimensions", "field_label": "Dimensions / Length", "field_type": "text", "is_required": False, "placeholder": "e.g. 5.5m Saree, 2.5m Dupatta, 6x6 ft", "display_order": 4},
        ]
    },
    {
        "name": "Furniture Store",
        "code": "FURNITURE",
        "icon": "chair",
        "description": "Home and office furniture, wooden decor, tables, chairs, and furnishings.",
        "legacy_aliases": ["furniture"],
        "fields": [
            {"field_name": "material", "field_label": "Primary Material", "field_type": "select", "is_required": True, "options": ["Teak Wood", "Sheesham Wood", "Solid Oak", "Engineered Wood", "Metal / Iron", "Leather", "Fabric Upholstery"], "default_value": "Teak Wood", "display_order": 1},
            {"field_name": "dimensions", "field_label": "Dimensions (L x W x H)", "field_type": "text", "is_required": False, "placeholder": "e.g. 72 x 36 x 30 inches", "display_order": 2},
            {"field_name": "finish_color", "field_label": "Finish / Color", "field_type": "text", "is_required": False, "placeholder": "e.g. Walnut Finish, Matte Black, Natural Wood", "display_order": 3},
            {"field_name": "assembly", "field_label": "Assembly Required", "field_type": "select", "is_required": False, "options": ["Pre-assembled", "Carpenter Assembly Required", "DIY Assembly"], "default_value": "Pre-assembled", "display_order": 4},
            {"field_name": "warranty", "field_label": "Warranty", "field_type": "select", "is_required": False, "options": ["No Warranty", "1 Year", "3 Years", "5 Years", "10 Years"], "default_value": "1 Year", "display_order": 5},
        ]
    },
    {
        "name": "Agro Store",
        "code": "AGRO",
        "icon": "eco",
        "description": "Seeds, fertilizers, agricultural implements, farming equipment, and pesticides.",
        "legacy_aliases": ["agro"],
        "fields": [
            {"field_name": "product_type", "field_label": "Agro Product Type", "field_type": "select", "is_required": True, "options": ["Seeds", "Fertilizer / Bio-fertilizer", "Pesticide / Insecticide", "Farming Tools", "Irrigation Equipment"], "default_value": "Seeds", "display_order": 1},
            {"field_name": "technical_name", "field_label": "Technical / Chemical Name", "field_type": "text", "is_required": False, "placeholder": "e.g. NPK 19:19:19, Chlorpyrifos 20% EC", "display_order": 2},
            {"field_name": "net_quantity", "field_label": "Net Quantity", "field_type": "text", "is_required": False, "placeholder": "e.g. 1 kg, 5 kg, 500 ml, 5 Liters", "display_order": 3},
            {"field_name": "target_crop", "field_label": "Target Crops", "field_type": "text", "is_required": False, "placeholder": "e.g. Wheat, Cotton, Rice, Vegetables", "display_order": 4},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": False, "placeholder": "YYYY-MM-DD", "display_order": 5},
        ]
    }
]

SYSTEM_UNITS = [
    {"name": "Piece", "symbol": "pc"},
    {"name": "Kilogram", "symbol": "kg"},
    {"name": "Gram", "symbol": "g"},
    {"name": "Liter", "symbol": "l"},
    {"name": "Milliliter", "symbol": "ml"},
    {"name": "Packet", "symbol": "pkt"},
    {"name": "Box", "symbol": "box"},
    {"name": "Meter", "symbol": "m"},
    {"name": "Pair", "symbol": "pair"},
    {"name": "Dozen", "symbol": "dz"},
]


def seed_categories_and_fields(db: Session):
    """
    Seeds the 8 standardized store categories and their specific product field definitions.
    Safe and idempotent - updates existing categories or creates missing ones without deleting data.
    Preserves all existing store, user, and product records.
    """
    try:
        # 1. Seed Units
        for unit_data in SYSTEM_UNITS:
            existing_unit = db.query(Unit).filter(Unit.symbol == unit_data["symbol"]).first()
            if not existing_unit:
                unit = Unit(
                    name=unit_data["name"],
                    symbol=unit_data["symbol"],
                    store_id=None,
                    is_base_unit=True
                )
                db.add(unit)

        # 2. Seed Categories & Fields
        for cat_data in INITIAL_CATEGORIES:
            aliases = cat_data.get("legacy_aliases", [])
            query_filters = [
                Category.code == cat_data["code"],
                Category.name == cat_data["name"],
            ]
            for alias in aliases:
                query_filters.append(Category.name == alias)
                query_filters.append(Category.code == alias)

            from sqlalchemy import or_
            category = db.query(Category).filter(or_(*query_filters)).first()

            if not category:
                category = Category(
                    name=cat_data["name"],
                    code=cat_data["code"],
                    description=cat_data["description"],
                    icon=cat_data["icon"],
                    is_system=True,
                    is_active=True
                )
                db.add(category)
                db.flush()
            else:
                # Update to official standardized name & code
                category.name = cat_data["name"]
                category.code = cat_data["code"]
                category.description = cat_data["description"]
                category.icon = cat_data["icon"]
                category.is_system = True
                category.is_active = True
                db.flush()

            # Sync fields for category
            existing_fields = {f.field_name: f for f in category.fields}
            for field_data in cat_data["fields"]:
                field_name = field_data["field_name"]
                if field_name in existing_fields:
                    f = existing_fields[field_name]
                    f.field_label = field_data["field_label"]
                    f.field_type = field_data["field_type"]
                    f.is_required = field_data.get("is_required", False)
                    f.options = field_data.get("options")
                    f.default_value = field_data.get("default_value")
                    f.placeholder = field_data.get("placeholder")
                    f.display_order = field_data.get("display_order", 0)
                    f.is_variant_field = field_data.get("is_variant_field", False)
                else:
                    new_field = CategoryField(
                        category_id=category.id,
                        field_name=field_name,
                        field_label=field_data["field_label"],
                        field_type=field_data["field_type"],
                        is_required=field_data.get("is_required", False),
                        options=field_data.get("options"),
                        default_value=field_data.get("default_value"),
                        placeholder=field_data.get("placeholder"),
                        display_order=field_data.get("display_order", 0),
                        is_variant_field=field_data.get("is_variant_field", False)
                    )
                    db.add(new_field)

        # 3. Ensure existing users have valid shop_category, shop_category_id, and Store linked
        grocery_cat = db.query(Category).filter(Category.code == "GROCERY").first() or db.query(Category).first()
        users = db.query(User).all()
        for user in users:
            target_cat = None
            cat_name = user.shop_category or user.store_type
            if cat_name:
                cat_lower = cat_name.lower()
                for cat in db.query(Category).all():
                    if cat.name.lower() in cat_lower or cat.code.lower() in cat_lower or cat_lower in cat.name.lower():
                        target_cat = cat
                        break
            if not target_cat:
                target_cat = grocery_cat

            if target_cat:
                if not user.shop_category:
                    user.shop_category = target_cat.name
                if not user.store_type:
                    user.store_type = target_cat.name
                if not user.shop_category_id:
                    user.shop_category_id = target_cat.id

                existing_store = db.query(Store).filter(Store.user_id == user.id).first()
                if not existing_store:
                    store_name = f"{user.first_name}'s {target_cat.name}"
                    new_store = Store(
                        name=store_name,
                        shop_category_id=target_cat.id,
                        user_id=user.id,
                        code=f"STR-{user.id:03d}",
                        store_code=f"STR-{user.id:03d}",
                        currency="INR",
                        currency_symbol="₹",
                        is_active=True
                    )
                    db.add(new_store)
                    db.flush()
                else:
                    if not existing_store.shop_category_id:
                        existing_store.shop_category_id = target_cat.id

        db.commit()
        logger.info("Successfully seeded 8 standardized categories, units, and synced existing user stores.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding categories: {e}", exc_info=True)
        raise e


