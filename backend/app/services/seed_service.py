import logging
from sqlalchemy.orm import Session
from ..models.category import Category, CategoryField
from ..models.unit import Unit
from ..models.store import Store
from ..models.user import User

logger = logging.getLogger("seed_service")

INITIAL_CATEGORIES = [
    {
        "name": "Grocery Store",
        "code": "grocery",
        "icon": "shopping-basket",
        "description": "Daily essentials, packaged food items, groceries, and staples.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Nestle, Kellogg's", "display_order": 1},
            {"field_name": "weight", "field_label": "Weight", "field_type": "number", "is_required": False, "placeholder": "e.g. 500, 1", "display_order": 2},
            {"field_name": "unit", "field_label": "Unit", "field_type": "select", "is_required": True, "options": ["kg", "g", "liter", "ml", "packet", "piece", "box"], "default_value": "kg", "display_order": 3},
            {"field_name": "mrp", "field_label": "MRP", "field_type": "number", "is_required": False, "placeholder": "Maximum Retail Price", "display_order": 4},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": False, "placeholder": "YYYY-MM-DD", "display_order": 5},
        ]
    },
    {
        "name": "Supermarket",
        "code": "supermarket",
        "icon": "shopping-cart",
        "description": "Large-scale retail mart covering multi-department merchandise.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Unilever, P&G", "display_order": 1},
            {"field_name": "barcode", "field_label": "Barcode / EAN", "field_type": "text", "is_required": False, "placeholder": "Scan or enter barcode", "display_order": 2},
            {"field_name": "unit", "field_label": "Unit", "field_type": "select", "is_required": True, "options": ["piece", "packet", "box", "kg", "g", "bottle", "can"], "default_value": "piece", "display_order": 3},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": False, "placeholder": "YYYY-MM-DD", "display_order": 4},
            {"field_name": "mrp", "field_label": "MRP", "field_type": "number", "is_required": False, "placeholder": "Maximum Retail Price", "display_order": 5},
        ]
    },
    {
        "name": "Medical Store",
        "code": "medical",
        "icon": "medical-services",
        "description": "Pharmaceuticals, medicines, surgical supplies, and healthcare goods.",
        "fields": [
            {"field_name": "manufacturer", "field_label": "Manufacturer", "field_type": "text", "is_required": True, "placeholder": "e.g. Cipla, Sun Pharma, Pfizer", "display_order": 1},
            {"field_name": "batch_number", "field_label": "Batch Number", "field_type": "text", "is_required": True, "placeholder": "e.g. BATCH-2026-X", "display_order": 2},
            {"field_name": "expiry_date", "field_label": "Expiry Date", "field_type": "date", "is_required": True, "placeholder": "YYYY-MM-DD", "display_order": 3},
            {"field_name": "mrp", "field_label": "MRP", "field_type": "number", "is_required": True, "placeholder": "Maximum Retail Price", "display_order": 4},
        ]
    },
    {
        "name": "Clothing Store",
        "code": "clothing",
        "icon": "checkroom",
        "description": "Men's, women's, and kids' apparel, textiles, and fashion garments.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Zara, Levi's, Nike", "display_order": 1},
            {"field_name": "size", "field_label": "Size", "field_type": "select", "is_required": True, "options": ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38"], "default_value": "M", "is_variant_field": True, "display_order": 2},
            {"field_name": "color", "field_label": "Color", "field_type": "select", "is_required": True, "options": ["Black", "White", "Navy Blue", "Red", "Green", "Grey", "Yellow", "Beige", "Olive"], "default_value": "Black", "is_variant_field": True, "display_order": 3},
            {"field_name": "fabric", "field_label": "Fabric", "field_type": "select", "is_required": False, "options": ["100% Cotton", "Polyester", "Denim", "Linen", "Silk", "Wool", "Rayon", "Blend"], "default_value": "100% Cotton", "display_order": 4},
        ]
    },
    {
        "name": "Electronics Store",
        "code": "electronics",
        "icon": "devices",
        "description": "Consumer appliances, computing devices, TV, audio, and home tech.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": True, "placeholder": "e.g. Sony, Samsung, LG, Apple", "display_order": 1},
            {"field_name": "model_number", "field_label": "Model Number", "field_type": "text", "is_required": True, "placeholder": "e.g. OLED-55X90, WH-1000XM5", "display_order": 2},
            {"field_name": "serial_number", "field_label": "Serial Number", "field_type": "text", "is_required": False, "placeholder": "Unique Device Serial No", "display_order": 3},
            {"field_name": "warranty", "field_label": "Warranty", "field_type": "select", "is_required": True, "options": ["No Warranty", "6 Months", "1 Year", "2 Years", "3 Years", "5 Years"], "default_value": "1 Year", "display_order": 4},
        ]
    },
    {
        "name": "Mobile Accessories",
        "code": "mobile_accessories",
        "icon": "smartphone",
        "description": "Phone covers, screen guards, chargers, cables, and power banks.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Anker, Spigen, Boat", "display_order": 1},
            {"field_name": "compatible_device", "field_label": "Compatible Device", "field_type": "text", "is_required": True, "placeholder": "e.g. iPhone 15 Pro, Galaxy S24, Universal", "display_order": 2},
            {"field_name": "model", "field_label": "Model / Variant", "field_type": "text", "is_required": False, "placeholder": "e.g. MagSafe Clear, Braided 65W", "display_order": 3},
            {"field_name": "color", "field_label": "Color", "field_type": "text", "is_required": False, "placeholder": "e.g. Matte Black, Transparent", "display_order": 4},
        ]
    },
    {
        "name": "Hardware Store",
        "code": "hardware",
        "icon": "build",
        "description": "Tools, fasteners, plumbing, electrical, paints, and building materials.",
        "fields": [
            {"field_name": "material", "field_label": "Material", "field_type": "select", "is_required": False, "options": ["Stainless Steel", "Brass", "Iron", "Aluminum", "Copper", "PVC", "Wood", "Alloy"], "default_value": "Stainless Steel", "display_order": 1},
            {"field_name": "size", "field_label": "Size / Dimensions", "field_type": "text", "is_required": False, "placeholder": "e.g. 1/2 inch, 10mm, 2x4 ft", "display_order": 2},
            {"field_name": "weight", "field_label": "Weight", "field_type": "number", "is_required": False, "placeholder": "Weight in kg", "display_order": 3},
            {"field_name": "unit", "field_label": "Unit", "field_type": "select", "is_required": True, "options": ["piece", "kg", "box", "meter", "set", "roll"], "default_value": "piece", "display_order": 4},
        ]
    },
    {
        "name": "Stationery Store",
        "code": "stationery",
        "icon": "edit-note",
        "description": "School, office, art supplies, notebooks, pens, and paper products.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Faber-Castell, Classmate, Parker", "display_order": 1},
            {"field_name": "paper_size", "field_label": "Paper Size", "field_type": "select", "is_required": False, "options": ["A4", "A3", "A5", "Letter", "Legal", "Custom", "Not Applicable"], "default_value": "A4", "display_order": 2},
            {"field_name": "product_type", "field_label": "Product Type", "field_type": "select", "is_required": True, "options": ["Notebook / Journal", "Pen / Pencil", "Paper Ream", "Folder / File", "Art & Craft", "Desk Accessory"], "default_value": "Notebook / Journal", "display_order": 3},
            {"field_name": "quantity", "field_label": "Pack Quantity", "field_type": "number", "is_required": False, "placeholder": "e.g. 1, 5, 10, 500", "display_order": 4},
        ]
    },
    {
        "name": "Footwear Store",
        "code": "footwear",
        "icon": "hiking",
        "description": "Shoes, sandals, sneakers, boots, and athletic footwear.",
        "fields": [
            {"field_name": "brand", "field_label": "Brand", "field_type": "text", "is_required": False, "placeholder": "e.g. Nike, Adidas, Puma, Clarks", "display_order": 1},
            {"field_name": "shoe_size", "field_label": "Shoe Size", "field_type": "select", "is_required": True, "options": ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"], "default_value": "UK 8", "is_variant_field": True, "display_order": 2},
            {"field_name": "color", "field_label": "Color", "field_type": "select", "is_required": True, "options": ["Black", "White", "Brown", "Tan", "Navy", "Grey", "Red"], "default_value": "Black", "is_variant_field": True, "display_order": 3},
            {"field_name": "material", "field_label": "Material", "field_type": "select", "is_required": False, "options": ["Genuine Leather", "Mesh / Breathable", "Canvas", "Synthetic Leather", "Suede", "Rubber"], "default_value": "Mesh / Breathable", "display_order": 4},
        ]
    },
    {
        "name": "Vegetable & Fruit Shop",
        "code": "vegetable_fruit",
        "icon": "eco",
        "description": "Fresh farm produce, vegetables, seasonal fruits, and greens.",
        "fields": [
            {"field_name": "weight", "field_label": "Weight / Qty", "field_type": "number", "is_required": False, "placeholder": "Quantity in unit", "display_order": 1},
            {"field_name": "unit", "field_label": "Unit", "field_type": "select", "is_required": True, "options": ["kg", "g", "bunch", "piece", "dozen", "crate", "box"], "default_value": "kg", "display_order": 2},
            {"field_name": "quality", "field_label": "Quality Grade", "field_type": "select", "is_required": True, "options": ["Organic / Farm Fresh", "Premium Grade A", "Standard Grade B", "Export Quality"], "default_value": "Premium Grade A", "display_order": 3},
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
    Seeds the 10 initial dynamic store categories and their specific product field definitions.
    Safe and idempotent - updates existing categories or creates missing ones without deleting data.
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
            category = db.query(Category).filter(
                (Category.code == cat_data["code"]) | (Category.name == cat_data["name"])
            ).first()

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
                category.description = cat_data["description"]
                category.icon = cat_data["icon"]
                category.is_system = True

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

        # 3. Ensure existing users have a valid Store linked to their store category
        users = db.query(User).all()
        for user in users:
            # Match user store_type to Category
            target_cat = None
            if user.store_type:
                # Fuzzy match user.store_type to one of the 10 categories
                st_lower = user.store_type.lower()
                for cat in db.query(Category).all():
                    if cat.name.lower() in st_lower or cat.code in st_lower or st_lower in cat.name.lower():
                        target_cat = cat
                        break
            if not target_cat:
                target_cat = db.query(Category).filter(Category.code == "grocery").first() or db.query(Category).first()

            if target_cat:
                existing_store = db.query(Store).filter(Store.user_id == user.id).first()
                if not existing_store:
                    store_name = f"{user.first_name}'s {target_cat.name}"
                    new_store = Store(
                        name=store_name,
                        shop_category_id=target_cat.id,
                        user_id=user.id,
                        code=f"STORE-{user.id:03d}",
                        currency="INR",
                        currency_symbol="₹",
                        is_active=True
                    )
                    db.add(new_store)
                    db.flush()
                elif not user.store_id:
                    user.store_id = existing_store.id

        db.commit()
        logger.info("Successfully seeded categories, units, and synced existing user stores.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding categories: {e}", exc_info=True)
        raise e

