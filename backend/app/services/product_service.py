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
            {"name": "net_weight", "label": "Net Weight", "type": "text", "placeholder": "e.g. 500g, 1 kg, 250ml", "required": False},
            {"name": "gross_weight", "label": "Gross Weight", "type": "text", "placeholder": "e.g. 550g", "required": False},
            {"name": "packaging_type", "label": "Packaging Type", "type": "select", "options": ["Packet / Pouch", "Bottle", "Box / Carton", "Can / Tin", "Glass Jar", "Loose / Bulk", "Tetra Pak"], "default": "Packet / Pouch", "required": False},
            {"name": "manufacturer", "label": "Manufacturer", "type": "text", "placeholder": "e.g. Nestle, Tata Consumer, Amul", "required": False},
            {"name": "country_of_origin", "label": "Country of Origin", "type": "text", "default": "India", "required": False},
            {"name": "manufacturing_date", "label": "Manufacturing Date", "type": "date", "required": False},
            {"name": "expiry_date", "label": "Expiry Date", "type": "date", "required": False},
            {"name": "shelf_life_days", "label": "Shelf Life (Days)", "type": "number", "placeholder": "e.g. 180", "required": False},
            {"name": "is_vegetarian", "label": "Is Vegetarian", "type": "boolean", "default": "true", "required": False},
            {"name": "storage_type", "label": "Storage Instructions", "type": "select", "options": ["Room Temperature", "Refrigerated (2°C - 8°C)", "Deep Frozen (-18°C)", "Cool & Dry Place"], "default": "Cool & Dry Place", "required": False},
            {"name": "nutritional_information", "label": "Nutritional Information", "type": "textarea", "placeholder": "Energy: 450 kcal, Protein: 8g, Carbs: 65g...", "required": False},
            {"name": "ingredients", "label": "Ingredients List", "type": "textarea", "placeholder": "Wheat flour, Sugar, Edible vegetable oil...", "required": False},
            {"name": "fssai_license", "label": "FSSAI License No.", "type": "text", "placeholder": "14-digit FSSAI Number", "required": False},
        ]
    },
    "clothing": {
        "name": "Clothing Store",
        "model": ProductClothingDetail,
        "attr": "clothing_details",
        "fields": [
            {"name": "gender", "label": "Gender / Target Group", "type": "select", "options": ["Men", "Women", "Unisex", "Kids", "Boys", "Girls", "Infants"], "default": "Men", "required": False},
            {"name": "clothing_type", "label": "Clothing Type", "type": "select", "options": ["Shirt", "T-Shirt", "Jeans", "Trousers", "Saree", "Kurti", "Dress", "Jacket", "Sweater", "Suit", "Activewear"], "default": "T-Shirt", "required": False},
            {"name": "fabric_type", "label": "Fabric Type", "type": "select", "options": ["100% Cotton", "Pure Silk", "Polyester", "Denim", "Linen", "Wool", "Rayon", "Cotton Blend", "Georgette"], "default": "100% Cotton", "required": False},
            {"name": "material", "label": "Material Composition", "type": "text", "placeholder": "e.g. 98% Cotton, 2% Elastane", "required": False},
            {"name": "pattern", "label": "Pattern / Print", "type": "select", "options": ["Solid / Plain", "Striped", "Checked", "Printed", "Embroidered", "Floral", "Graphic Print"], "default": "Solid / Plain", "required": False},
            {"name": "fit_type", "label": "Fit Type", "type": "select", "options": ["Regular Fit", "Slim Fit", "Oversized Fit", "Relaxed Fit", "Tailored Fit", "Skinny Fit"], "default": "Regular Fit", "required": False},
            {"name": "sleeve_type", "label": "Sleeve Type", "type": "select", "options": ["Full Sleeve", "Half Sleeve", "Sleeveless", "3/4th Sleeve", "Roll-up Sleeve"], "default": "Half Sleeve", "required": False},
            {"name": "neck_type", "label": "Neck / Collar Type", "type": "select", "options": ["Round Neck", "V-Neck", "Polo Collar", "Spread Collar", "Mandarin Collar", "Hooded", "Boat Neck"], "default": "Round Neck", "required": False},
            {"name": "occasion", "label": "Occasion", "type": "select", "options": ["Casual", "Formal", "Festive", "Party Wear", "Sports / Gym", "Daily Wear"], "default": "Casual", "required": False},
            {"name": "season", "label": "Season", "type": "select", "options": ["All Season", "Summer Collection", "Winter Collection", "Monsoon", "Autumn / Spring"], "default": "All Season", "required": False},
            {"name": "care_instructions", "label": "Care Instructions", "type": "textarea", "placeholder": "Machine wash cold with like colors, do not bleach, tumble dry low...", "required": False},
            {"name": "country_of_origin", "label": "Country of Origin", "type": "text", "default": "India", "required": False},
            {"name": "manufacturer", "label": "Manufacturer / Brand", "type": "text", "placeholder": "e.g. Raymond, Zara, Levi Strauss", "required": False},
            {"name": "collection_name", "label": "Collection / Series", "type": "text", "placeholder": "e.g. Summer 2026, Urban Heritage", "required": False},
        ]
    },
    "medical": {
        "name": "Medical / Pharmacy Store",
        "model": ProductMedicineDetail,
        "attr": "medicine_details",
        "fields": [
            {"name": "medicine_type", "label": "Medicine Classification", "type": "select", "options": ["Allopathic", "Ayurvedic", "Homeopathic", "Surgical / Medical Device", "OTC Wellness", "Nutraceutical"], "default": "Allopathic", "required": False},
            {"name": "salt_composition", "label": "Salt Composition / Active Molecules", "type": "textarea", "placeholder": "e.g. Paracetamol 500mg, Caffeine 30mg", "required": False},
            {"name": "generic_name", "label": "Generic Name", "type": "text", "placeholder": "e.g. Paracetamol Tablets IP", "required": False},
            {"name": "strength", "label": "Strength / Potency", "type": "text", "placeholder": "e.g. 500 mg, 10 mg/ml, 250 mcg", "required": False},
            {"name": "dosage_form", "label": "Dosage Form", "type": "select", "options": ["Tablet", "Capsule", "Oral Syrup", "Suspension", "Injection", "Ointment / Cream", "Eye/Ear Drops", "Inhaler", "Powder / Sachet"], "default": "Tablet", "required": False},
            {"name": "prescription_required", "label": "Prescription Required (Rx)", "type": "boolean", "default": "false", "required": False},
            {"name": "schedule_type", "label": "Drug Schedule", "type": "select", "options": ["OTC (Over The Counter)", "Schedule H", "Schedule H1", "Schedule X (Narcotics)", "Schedule G"], "default": "OTC (Over The Counter)", "required": False},
            {"name": "manufacturer", "label": "Pharmaceutical Manufacturer", "type": "text", "placeholder": "e.g. Cipla, Sun Pharma, Dr. Reddy's", "required": False},
            {"name": "pack_size", "label": "Packaging Size", "type": "text", "placeholder": "e.g. 10 Tablets / Strip, 100ml Bottle", "required": False},
            {"name": "storage_conditions", "label": "Storage Conditions", "type": "text", "placeholder": "Store below 25°C. Protect from direct moisture & light.", "required": False},
            {"name": "drug_license_number", "label": "Drug License / Mfg Lic No.", "type": "text", "placeholder": "e.g. 20B/21B-DL-9876", "required": False},
            {"name": "therapeutic_category", "label": "Therapeutic Category", "type": "text", "placeholder": "e.g. Analgesic, Antibiotic, Antipyretic, Antihistamine", "required": False},
            {"name": "side_effects", "label": "Possible Side Effects", "type": "textarea", "placeholder": "Drowsiness, mild nausea, dry mouth...", "required": False},
            {"name": "usage_instructions", "label": "Usage Instructions", "type": "textarea", "placeholder": "As directed by the registered medical practitioner.", "required": False},
        ]
    },
    "mobile_electronics": {
        "name": "Mobile & Electronics Store",
        "model": ProductElectronicsDetail,
        "attr": "electronics_details",
        "fields": [
            {"name": "device_type", "label": "Device Category", "type": "select", "options": ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Smart TV", "Audio & Earbuds", "Gaming Console", "Computer Peripheral", "Home Appliance", "Mobile Accessory"], "default": "Smartphone", "required": False},
            {"name": "model_number", "label": "Model Number", "type": "text", "placeholder": "e.g. SM-S928B, A2849", "required": False},
            {"name": "model_name", "label": "Model Commercial Name", "type": "text", "placeholder": "e.g. Galaxy S24 Ultra, MacBook Air M3", "required": False},
            {"name": "manufacturer", "label": "Manufacturer / Brand", "type": "text", "placeholder": "e.g. Apple, Samsung, Dell, Sony", "required": False},
            {"name": "brand_model", "label": "Series / Sub-Brand", "type": "text", "placeholder": "e.g. iPhone Pro Series, ThinkPad", "required": False},
            {"name": "color", "label": "Color / Finish", "type": "text", "placeholder": "e.g. Titanium Black, Midnight Blue", "required": False},
            {"name": "ram", "label": "System RAM", "type": "select", "options": ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "64 GB", "N/A"], "default": "8 GB", "required": False},
            {"name": "storage_capacity", "label": "Internal Storage / ROM", "type": "select", "options": ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB SSD", "2 TB SSD", "N/A"], "default": "128 GB", "required": False},
            {"name": "processor", "label": "Processor / Chipset", "type": "text", "placeholder": "e.g. Snapdragon 8 Gen 3, Apple M3, Core i7", "required": False},
            {"name": "screen_size", "label": "Display Size", "type": "text", "placeholder": "e.g. 6.8 inches AMOLED, 15.6 inches FHD", "required": False},
            {"name": "battery_capacity", "label": "Battery Capacity", "type": "text", "placeholder": "e.g. 5000 mAh, 70 Wh", "required": False},
            {"name": "connectivity", "label": "Connectivity", "type": "text", "placeholder": "e.g. 5G, Wi-Fi 7, Bluetooth 5.3, USB Type-C", "required": False},
            {"name": "warranty_months", "label": "Warranty Period (Months)", "type": "number", "default": "12", "required": False},
            {"name": "warranty_type", "label": "Warranty Coverage", "type": "select", "options": ["Brand On-Site Warranty", "Brand Carry-In Warranty", "Seller Warranty", "No Warranty"], "default": "Brand Carry-In Warranty", "required": False},
            {"name": "power_rating", "label": "Power Rating / Charging", "type": "text", "placeholder": "e.g. 65W Fast Charge, 230V 50Hz", "required": False},
            {"name": "country_of_origin", "label": "Country of Origin", "type": "text", "default": "India", "required": False},
        ]
    },
    "plastic": {
        "name": "Plastic Store",
        "model": ProductPlasticDetail,
        "attr": "plastic_details",
        "fields": [
            {"name": "plastic_type", "label": "Polymer / Plastic Type", "type": "select", "options": ["Polypropylene (PP)", "High Density Polyethylene (HDPE)", "Polyethylene Terephthalate (PET)", "Low Density Polyethylene (LDPE)", "Polyvinyl Chloride (PVC)", "Polystyrene (PS)", "ABS Resin"], "default": "Polypropylene (PP)", "required": False},
            {"name": "material_grade", "label": "Material Grade", "type": "select", "options": ["100% Virgin Grade", "Commercial Recycled Grade", "Food Contact Grade A", "Industrial Heavy Duty"], "default": "100% Virgin Grade", "required": False},
            {"name": "material_type", "label": "Structure Form", "type": "select", "options": ["Rigid Molded", "Flexible Film", "Foam Cushioned", "Corrugated Polymer"], "default": "Rigid Molded", "required": False},
            {"name": "color", "label": "Product Color", "type": "text", "placeholder": "e.g. Transparent, Blue, Red, Ivory", "required": False},
            {"name": "length", "label": "Length", "type": "text", "placeholder": "e.g. 30 cm, 12 inches", "required": False},
            {"name": "width", "label": "Width", "type": "text", "placeholder": "e.g. 20 cm", "required": False},
            {"name": "height", "label": "Height", "type": "text", "placeholder": "e.g. 15 cm", "required": False},
            {"name": "thickness", "label": "Wall Thickness / Gauge", "type": "text", "placeholder": "e.g. 2.5 mm, 50 microns", "required": False},
            {"name": "weight", "label": "Item Tare Weight", "type": "text", "placeholder": "e.g. 250 grams", "required": False},
            {"name": "capacity", "label": "Storage Capacity", "type": "text", "placeholder": "e.g. 500, 20", "required": False},
            {"name": "capacity_unit", "label": "Capacity Unit", "type": "select", "options": ["ml", "Liters", "Gallons", "Kilograms"], "default": "Liters", "required": False},
            {"name": "food_grade", "label": "Food Grade Certified (BPA Free)", "type": "boolean", "default": "true", "required": False},
            {"name": "recyclable", "label": "Recyclable Polymer", "type": "boolean", "default": "true", "required": False},
            {"name": "usage_type", "label": "Primary Usage Sector", "type": "select", "options": ["Household & Kitchenware", "Industrial Packaging", "Commercial Storage & Bins", "Agricultural Utility", "Water Storage Tanks"], "default": "Household & Kitchenware", "required": False},
        ]
    },
    "handloom": {
        "name": "Handloom Store",
        "model": ProductHandloomDetail,
        "attr": "handloom_details",
        "fields": [
            {"name": "fabric_type", "label": "Authentic Fabric Type", "type": "select", "options": ["Pure Khadi Cotton", "Mulberry Pure Silk", "Chanderi Silk Cotton", "Tussar Silk", "Banarasi Katan Silk", "Kanchipuram Silk", "Linen Weave", "Kota Doria"], "default": "Pure Khadi Cotton", "required": False},
            {"name": "weaving_type", "label": "Loom & Weaving Technique", "type": "select", "options": ["Traditional Pit Loom", "Frame Handloom", "Shuttle Handloom", "Jacquard Handloom", "Backstrap Loom"], "default": "Traditional Pit Loom", "required": False},
            {"name": "craft_type", "label": "Artisan Craft / Heritage Art", "type": "select", "options": ["Bandhani Tie & Dye", "Kalamkari Hand Painting", "Ikat / Patola", "Jamdani Weave", "Kantha Stitch", "Ajrakh Block Print", "Zari Brocade", "Chikankari"], "default": "Zari Brocade", "required": False},
            {"name": "material", "label": "Fiber Composition", "type": "text", "placeholder": "e.g. 100% Hand-spun Organic Cotton, Pure Zari", "required": False},
            {"name": "thread_count", "label": "Thread Count / Reed", "type": "text", "placeholder": "e.g. 80s count, 100s count, 120s count", "required": False},
            {"name": "design_name", "label": "Traditional Design Motif", "type": "text", "placeholder": "e.g. Peacock Border, Paisley Butta, Temple Border", "required": False},
            {"name": "pattern", "label": "Pattern Style", "type": "select", "options": ["Traditional Royal Motifs", "Geometric Tribal", "Floral Jaal", "Solid with Rich Zari Pallu", "Checkered / Stripes"], "default": "Traditional Royal Motifs", "required": False},
            {"name": "origin_region", "label": "Origin Region / Craft Hub", "type": "text", "placeholder": "e.g. Varanasi, Chanderi, Kanchipuram, Sambalpur, Pochampally", "required": False},
            {"name": "artisan_name", "label": "Master Weaver / Guild", "type": "text", "placeholder": "e.g. Bunkar Cooperative, Master Artisan Ram", "required": False},
            {"name": "handwoven", "label": "Handwoven Certified (Handloom Mark)", "type": "boolean", "default": "true", "required": False},
            {"name": "length", "label": "Length Specification", "type": "text", "placeholder": "e.g. 6.3 meters (with blouse piece), 2.5 meters", "required": False},
            {"name": "width", "label": "Width", "type": "text", "placeholder": "e.g. 45 inches", "required": False},
            {"name": "color", "label": "Natural / Base Color", "type": "text", "placeholder": "e.g. Indigo Blue, Royal Maroon, Mustard Yellow", "required": False},
            {"name": "care_instructions", "label": "Artisanal Care Instructions", "type": "textarea", "placeholder": "Dry clean recommended for silk and zari. Hand wash with gentle mild detergent for cotton.", "required": False},
        ]
    },
    "furniture": {
        "name": "Furniture Store",
        "model": ProductFurnitureDetail,
        "attr": "furniture_details",
        "fields": [
            {"name": "furniture_type", "label": "Furniture Category", "type": "select", "options": ["Sofa & Couch", "Bed & Cot", "Dining Table & Chairs", "Office Ergonomic Chair", "Wardrobe & Almirah", "Study & Work Desk", "Bookshelf & Cabinet", "Recliner", "TV Unit & Console"], "default": "Sofa & Couch", "required": False},
            {"name": "material", "label": "Primary Material", "type": "select", "options": ["Solid Teak Wood", "Sheesham Wood (Rosewood)", "Engineered Wood / MDF", "Solid Oak", "Wrought Iron / Steel", "Natural Cane & Rattan", "Commercial Plywood"], "default": "Solid Teak Wood", "required": False},
            {"name": "frame_material", "label": "Frame Material", "type": "text", "placeholder": "e.g. Kiln-dried Hardwood, Heavy-duty Steel", "required": False},
            {"name": "finish_type", "label": "Wood / Surface Finish", "type": "select", "options": ["Matte Natural Finish", "High Gloss Lacquer", "Walnut Finish", "Warm Honey Oak", "Teak Polished", "Rustic Vintage", "Melamine"], "default": "Walnut Finish", "required": False},
            {"name": "length", "label": "Length / Depth", "type": "text", "placeholder": "e.g. 84 inches / 213 cm", "required": False},
            {"name": "width", "label": "Width", "type": "text", "placeholder": "e.g. 36 inches / 91 cm", "required": False},
            {"name": "height", "label": "Height", "type": "text", "placeholder": "e.g. 32 inches / 81 cm", "required": False},
            {"name": "weight", "label": "Gross Weight", "type": "text", "placeholder": "e.g. 45 kg", "required": False},
            {"name": "seating_capacity", "label": "Seating Capacity", "type": "number", "placeholder": "e.g. 3, 6", "required": False},
            {"name": "assembly_required", "label": "Assembly Required (DIY / Carpenter)", "type": "boolean", "default": "false", "required": False},
            {"name": "warranty_months", "label": "Structural Warranty (Months)", "type": "number", "default": "36", "required": False},
            {"name": "room_type", "label": "Recommended Room", "type": "select", "options": ["Living Room", "Master Bedroom", "Dining Room", "Home Office", "Outdoor / Garden", "Commercial Reception"], "default": "Living Room", "required": False},
            {"name": "color", "label": "Upholstery / Wood Color", "type": "text", "placeholder": "e.g. Charcoal Grey, Classic Walnut, Beige Fabric", "required": False},
        ]
    },
    "agro": {
        "name": "Agro Store",
        "model": ProductAgroDetail,
        "attr": "agro_details",
        "fields": [
            {"name": "agro_category", "label": "Agricultural Category", "type": "select", "options": ["Certified Crop Seeds", "Chemical Fertilizers (NPK)", "Organic Fertilizers & Manure", "Insecticides & Pesticides", "Fungicides & Herbicides", "Plant Growth Regulators", "Sprayers & Farm Implements", "Animal Feed & Supplements"], "default": "Certified Crop Seeds", "required": False},
            {"name": "product_type", "label": "Formulation Type", "type": "select", "options": ["Hybrid F1 Seeds", "Bio-Fertilizer", "Granular NPK", "Liquid Concentrate (EC)", "Soluble Powder (WP)", "Organic Bio-Stimulant"], "default": "Hybrid F1 Seeds", "required": False},
            {"name": "crop_name", "label": "Target Crops", "type": "text", "placeholder": "e.g. Wheat, Paddy, Cotton, Soybean, Tomato, Maize", "required": False},
            {"name": "seed_variety", "label": "Seed Variety / Hybrid Code", "type": "text", "placeholder": "e.g. Pioneer 3355, Mahyco Hybrid 6444", "required": False},
            {"name": "brand_name", "label": "Agro Brand", "type": "text", "placeholder": "e.g. IFFCO, Bayer CropScience, Syngenta, UPL", "required": False},
            {"name": "composition", "label": "Chemical / Biological Composition", "type": "textarea", "placeholder": "e.g. Nitrogen 12%, Phosphorus 32%, Potassium 16%...", "required": False},
            {"name": "active_ingredient", "label": "Active Ingredient Molecule", "type": "text", "placeholder": "e.g. Chlorpyrifos 50% + Cypermethrin 5% EC", "required": False},
            {"name": "concentration", "label": "Concentration Percentage", "type": "text", "placeholder": "e.g. 20% SL, 10% EC", "required": False},
            {"name": "application_method", "label": "Application Method", "type": "select", "options": ["Foliar Spray Application", "Soil Drenching", "Seed Treatment", "Broadcast Fertilization", "Drip Irrigation Fertigation"], "default": "Foliar Spray Application", "required": False},
            {"name": "recommended_crop", "label": "Recommended Season / Soil", "type": "text", "placeholder": "Kharif & Rabi seasons; well-drained loamy soil", "required": False},
            {"name": "dosage", "label": "Recommended Dosage", "type": "text", "placeholder": "e.g. 2 ml per liter of water; 50 kg per acre", "required": False},
            {"name": "pack_size", "label": "Commercial Pack Size", "type": "text", "placeholder": "e.g. 250 ml, 500 ml, 1 Litre, 25 kg Bag", "required": False},
            {"name": "manufacturer", "label": "Agricultural Manufacturer", "type": "text", "placeholder": "e.g. National Seeds Corp, Coromandel, Bayer", "required": False},
            {"name": "license_number", "label": "CIB / Fertilizer License Number", "type": "text", "placeholder": "e.g. CIR-12345/AGRO/2026", "required": False},
            {"name": "safety_instructions", "label": "Farmer Safety & Handling Instructions", "type": "textarea", "placeholder": "Wear protective gloves and mask during spray. Keep out of reach of children and farm animals.", "required": False},
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

        # Build Common Fields
        common_fields: List[FormFieldConfig] = [
            # Basic Information
            FormFieldConfig(field_name="product_name", field_label="Product Name", field_type="text", is_required=True, placeholder="e.g. Premium Basmati Rice", display_order=1, section="basic"),
            FormFieldConfig(field_name="category_id", field_label="Category", field_type="select", is_required=False, display_order=2, section="basic"),
            FormFieldConfig(field_name="brand_id", field_label="Brand", field_type="select", is_required=False, display_order=3, section="basic"),
            FormFieldConfig(field_name="product_code", field_label="Product Code", field_type="text", is_required=False, placeholder="Auto-generated if blank", display_order=4, section="basic"),
            FormFieldConfig(field_name="sku", field_label="SKU (Stock Keeping Unit)", field_type="text", is_required=False, placeholder="e.g. SKU-10023", display_order=5, section="basic"),
            FormFieldConfig(field_name="barcode", field_label="Barcode / EAN", field_type="text", is_required=False, placeholder="Scan or enter barcode", display_order=6, section="basic"),
            FormFieldConfig(field_name="unit_id", field_label="Unit of Measure", field_type="select", is_required=False, display_order=7, section="basic"),
            FormFieldConfig(field_name="hsn_code", field_label="HSN / SAC Code", field_type="text", is_required=False, placeholder="e.g. 10063020", display_order=8, section="basic"),
            FormFieldConfig(field_name="short_description", field_label="Short Tagline", field_type="text", is_required=False, placeholder="Brief highlight of the product", display_order=9, section="basic"),
            FormFieldConfig(field_name="description", field_label="Detailed Description", field_type="textarea", is_required=False, placeholder="Complete product features, specifications, and notes...", display_order=10, section="basic"),

            # Pricing & Tax
            FormFieldConfig(field_name="purchase_price", field_label="Purchase / Cost Price (₹)", field_type="number", is_required=False, default_value="0.00", display_order=20, section="pricing"),
            FormFieldConfig(field_name="selling_price", field_label="Selling / Retail Price (₹)", field_type="number", is_required=True, default_value="0.00", display_order=21, section="pricing"),
            FormFieldConfig(field_name="mrp", field_label="Maximum Retail Price - MRP (₹)", field_type="number", is_required=False, placeholder="Optional MRP", display_order=22, section="pricing"),
            FormFieldConfig(field_name="wholesale_price", field_label="Wholesale Price (₹)", field_type="number", is_required=False, placeholder="Optional B2B rate", display_order=23, section="pricing"),
            FormFieldConfig(field_name="tax_type", field_label="Tax Treatment", field_type="select", is_required=True, default_value="exclusive", options=[
                FormFieldOption(label="Tax Exclusive (Base + GST)", value="exclusive", is_default=True),
                FormFieldOption(label="Tax Inclusive (GST included in MRP)", value="inclusive"),
                FormFieldOption(label="Tax Exempt / Zero Rated", value="exempt"),
            ], display_order=24, section="pricing"),
            FormFieldConfig(field_name="gst_rate", field_label="GST Tax Rate (%)", field_type="select", is_required=False, default_value="0", options=[
                FormFieldOption(label="0% (Nil / Exempt)", value="0", is_default=True),
                FormFieldOption(label="5% GST", value="5"),
                FormFieldOption(label="12% GST", value="12"),
                FormFieldOption(label="18% GST", value="18"),
                FormFieldOption(label="28% GST", value="28"),
            ], display_order=25, section="pricing"),

            # Stock & Inventory
            FormFieldConfig(field_name="opening_stock", field_label="Opening Stock Qty", field_type="number", is_required=False, default_value="0", display_order=30, section="inventory"),
            FormFieldConfig(field_name="current_stock", field_label="Current Available Stock", field_type="number", is_required=False, default_value="0", display_order=31, section="inventory"),
            FormFieldConfig(field_name="minimum_stock", field_label="Low Stock Alert Threshold", field_type="number", is_required=False, default_value="5", display_order=32, section="inventory"),
            FormFieldConfig(field_name="maximum_stock", field_label="Maximum Warehouse Stock", field_type="number", is_required=False, display_order=33, section="inventory"),
            FormFieldConfig(field_name="reorder_level", field_label="Reorder Stock Level", field_type="number", is_required=False, default_value="10", display_order=34, section="inventory"),
            FormFieldConfig(field_name="warehouse_location", field_label="Warehouse Rack / Bin", field_type="text", is_required=False, placeholder="e.g. Shelf A-3, Floor 2", display_order=35, section="inventory"),
        ]

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

            # Step 11: Insert Alerts
            if request.alerts:
                for alert in request.alerts:
                    db.add(ProductAlert(
                        store_id=ctx.store_id,
                        product_id=product.id,
                        alert_type=alert.alert_type,
                        threshold_value=Decimal(str(alert.threshold_value)) if alert.threshold_value is not None else None,
                        alert_days_before=alert.alert_days_before,
                        is_enabled=alert.is_enabled,
                        notify_email=alert.notify_email,
                        notify_sms=alert.notify_sms,
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
