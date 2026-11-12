import sys
import uuid
import datetime
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store, ShopCategory
from app.models.store_user import StoreUser
from app.models.store_type import StoreType
from app.models.brand import Brand
from app.models.category import Category
from app.models.partner import Customer, DebitCustomer, Supplier
from app.models.product import (
    Product, ProductPricing, ProductInventory, Unit
)
from app.models.inventory import ProductStock
from app.models.invoice import Invoice, InvoiceItem
from app.models.finance import Payment
from app.models.store_specific_products import (
    GroceryProduct, ClothingProduct, MedicalProduct, ElectronicsProduct,
    PlasticProduct, HandloomProduct, FurnitureProduct, AgroProduct,
    ClothingProductVariant, MedicalProductBatch
)
from app.utils.security import get_password_hash

NOW = datetime.datetime.now(datetime.timezone.utc)
TODAY_START = NOW.replace(hour=9, minute=15, second=0, microsecond=0)
YESTERDAY = TODAY_START - datetime.timedelta(days=1)
THREE_DAYS_AGO = TODAY_START - datetime.timedelta(days=3)
FIVE_DAYS_AGO = TODAY_START - datetime.timedelta(days=5)

PASSWORD_HASH = get_password_hash("password123")

# Store types definition & demo stores to seed
DEMO_STORE_CONFIGS = [
    {
        "type_code": "grocery",
        "type_name": "Grocery Store",
        "email": "grocery@nmart.com",
        "first_name": "Alex",
        "surname": "Grocery",
        "store_name": "Nexora Fresh Supermarket",
        "brands": ["Amul", "Tata Sampann", "Fortune", "Britannia", "Nestle", "Aashirvaad"],
        "categories": ["Dairy & Bakery", "Grains & Pulses", "Edible Oils", "Snacks & Drinks", "Spices"],
        "units": ["kg", "g", "liter", "packet", "piece"],
        "products": [
            {
                "name": "Tata Sampann Toor Dal", "sku": "GRO-DAL-001", "barcode": "890103000001",
                "category": "Grains & Pulses", "brand": "Tata Sampann", "unit": "kg",
                "purchase": 120.0, "selling": 160.0, "mrp": 180.0, "stock": 150,
                "extra": {"weight_volume": 1.0, "weight_unit": "kg", "food_type": "veg", "shelf_life_days": 180, "fssai_license": "10014022002567"}
            },
            {
                "name": "Amul Pure Ghee 1L Tin", "sku": "GRO-GHEE-002", "barcode": "890103000002",
                "category": "Dairy & Bakery", "brand": "Amul", "unit": "liter",
                "purchase": 510.0, "selling": 590.0, "mrp": 630.0, "stock": 80,
                "extra": {"weight_volume": 1.0, "weight_unit": "liter", "food_type": "veg", "shelf_life_days": 270, "fssai_license": "10012021000071"}
            },
            {
                "name": "Fortune Sunlite Refined Oil 1L", "sku": "GRO-OIL-003", "barcode": "890103000003",
                "category": "Edible Oils", "brand": "Fortune", "unit": "liter",
                "purchase": 115.0, "selling": 145.0, "mrp": 165.0, "stock": 200,
                "extra": {"weight_volume": 1.0, "weight_unit": "liter", "food_type": "veg", "shelf_life_days": 240, "fssai_license": "10013021000853"}
            },
            {
                "name": "Aashirvaad Superior Sharbati Atta 5kg", "sku": "GRO-ATTA-004", "barcode": "890103000004",
                "category": "Grains & Pulses", "brand": "Aashirvaad", "unit": "packet",
                "purchase": 230.0, "selling": 285.0, "mrp": 310.0, "stock": 95,
                "extra": {"weight_volume": 5.0, "weight_unit": "kg", "food_type": "veg", "shelf_life_days": 90, "fssai_license": "10012031000047"}
            },
            {
                "name": "Britannia Good Day Butter Cookies 600g", "sku": "GRO-BSK-005", "barcode": "890103000005",
                "category": "Snacks & Drinks", "brand": "Britannia", "unit": "packet",
                "purchase": 90.0, "selling": 120.0, "mrp": 140.0, "stock": 120,
                "extra": {"weight_volume": 600.0, "weight_unit": "g", "food_type": "veg", "shelf_life_days": 180, "fssai_license": "10015043001129"}
            },
            {
                "name": "Nestle Everyday Dairy Whitener 1kg", "sku": "GRO-MLK-006", "barcode": "890103000006",
                "category": "Dairy & Bakery", "brand": "Nestle", "unit": "packet",
                "purchase": 390.0, "selling": 460.0, "mrp": 500.0, "stock": 65,
                "extra": {"weight_volume": 1.0, "weight_unit": "kg", "food_type": "veg", "shelf_life_days": 365, "fssai_license": "10012011000168"}
            }
        ]
    },
    {
        "type_code": "clothing",
        "type_name": "Clothing Store",
        "email": "clothing@nmart.com",
        "first_name": "Rahul",
        "surname": "Verma",
        "store_name": "Nexora Trends Fashion Hub",
        "brands": ["Levi's", "Zara", "Raymond", "Allen Solly", "Peter England"],
        "categories": ["Men's Wear", "Women's Wear", "Ethnic Wear", "Formal Wear", "Casual Denim"],
        "units": ["piece", "set"],
        "products": [
            {
                "name": "Levi's 511 Slim Fit Denim Jeans", "sku": "CLO-JNS-001", "barcode": "890203000001",
                "category": "Casual Denim", "brand": "Levi's", "unit": "piece",
                "purchase": 1400.0, "selling": 2299.0, "mrp": 2999.0, "stock": 50,
                "extra": {"gender": "Men", "clothing_type": "Jeans", "fabric": "98% Cotton 2% Elastane", "pattern": "Solid", "fit": "Slim Fit"}
            },
            {
                "name": "Raymond Premium Formal Cotton Shirt", "sku": "CLO-SHT-002", "barcode": "890203000002",
                "category": "Formal Wear", "brand": "Raymond", "unit": "piece",
                "purchase": 850.0, "selling": 1499.0, "mrp": 1899.0, "stock": 70,
                "extra": {"gender": "Men", "clothing_type": "Shirt", "fabric": "100% Giza Cotton", "pattern": "Striped", "fit": "Regular Fit"}
            },
            {
                "name": "Zara Floral Print Summer Dress", "sku": "CLO-DRS-003", "barcode": "890203000003",
                "category": "Women's Wear", "brand": "Zara", "unit": "piece",
                "purchase": 1100.0, "selling": 1999.0, "mrp": 2499.0, "stock": 40,
                "extra": {"gender": "Women", "clothing_type": "Dress", "fabric": "Chiffon Blend", "pattern": "Floral", "fit": "A-Line"}
            },
            {
                "name": "Allen Solly Solid Chino Trousers", "sku": "CLO-TRZ-004", "barcode": "890203000004",
                "category": "Formal Wear", "brand": "Allen Solly", "unit": "piece",
                "purchase": 950.0, "selling": 1699.0, "mrp": 2199.0, "stock": 60,
                "extra": {"gender": "Men", "clothing_type": "Trousers", "fabric": "Stretch Cotton", "pattern": "Solid", "fit": "Custom Fit"}
            },
            {
                "name": "Peter England Linen Casual Kurta", "sku": "CLO-KRT-005", "barcode": "890203000005",
                "category": "Ethnic Wear", "brand": "Peter England", "unit": "piece",
                "purchase": 650.0, "selling": 1199.0, "mrp": 1499.0, "stock": 45,
                "extra": {"gender": "Men", "clothing_type": "Kurta", "fabric": "Pure Linen", "pattern": "Solid", "fit": "Comfort Fit"}
            }
        ]
    },
    {
        "type_code": "medical",
        "type_name": "Medical / Pharmacy Store",
        "email": "medical@nmart.com",
        "first_name": "Dr. Sameer",
        "surname": "Mehta",
        "store_name": "Nexora Lifeline Pharmacy",
        "brands": ["Sun Pharma", "Cipla", "Dr. Reddy's", "Mankind", "Abbott"],
        "categories": ["Antibiotics", "Pain Relief", "Cardiac & Diabetes", "Vitamins & Supplements", "Respiratory Care"],
        "units": ["strip", "bottle", "box", "tube"],
        "products": [
            {
                "name": "Augmentin 625 Duo Tablets", "sku": "MED-AUG-001", "barcode": "890303000001",
                "category": "Antibiotics", "brand": "Sun Pharma", "unit": "strip",
                "purchase": 145.0, "selling": 198.0, "mrp": 220.0, "stock": 180,
                "extra": {"medicine_type": "Allopathic", "composition": "Amoxicillin (500mg) + Clavulanic Acid (125mg)", "dosage_form": "Tablet", "prescription_required": True, "schedule_category": "Schedule H1", "drug_license_no": "DL-20B-112233"}
            },
            {
                "name": "Dolo 650 Paracetamol Tablets", "sku": "MED-DLO-002", "barcode": "890303000002",
                "category": "Pain Relief", "brand": "Cipla", "unit": "strip",
                "purchase": 22.0, "selling": 31.0, "mrp": 34.0, "stock": 500,
                "extra": {"medicine_type": "Allopathic", "composition": "Paracetamol (650mg)", "dosage_form": "Tablet", "prescription_required": False, "schedule_category": "OTC", "drug_license_no": "DL-20B-112233"}
            },
            {
                "name": "Glycomet-GP 2 Forte Tablet", "sku": "MED-GLY-003", "barcode": "890303000003",
                "category": "Cardiac & Diabetes", "brand": "Dr. Reddy's", "unit": "strip",
                "purchase": 110.0, "selling": 154.0, "mrp": 175.0, "stock": 140,
                "extra": {"medicine_type": "Allopathic", "composition": "Glimepiride (2mg) + Metformin (1000mg)", "dosage_form": "Tablet", "prescription_required": True, "schedule_category": "Schedule H", "drug_license_no": "DL-20B-112233"}
            },
            {
                "name": "Becozym C Forte Multivitamin", "sku": "MED-BCZ-004", "barcode": "890303000004",
                "category": "Vitamins & Supplements", "brand": "Abbott", "unit": "strip",
                "purchase": 35.0, "selling": 48.0, "mrp": 55.0, "stock": 300,
                "extra": {"medicine_type": "Allopathic", "composition": "Vitamin B Complex + Vitamin C + Biotin", "dosage_form": "Capsule", "prescription_required": False, "schedule_category": "OTC", "drug_license_no": "DL-20B-112233"}
            },
            {
                "name": "Ascoril D Plus Cough Syrup 100ml", "sku": "MED-ASC-005", "barcode": "890303000005",
                "category": "Respiratory Care", "brand": "Mankind", "unit": "bottle",
                "purchase": 78.0, "selling": 112.0, "mrp": 128.0, "stock": 110,
                "extra": {"medicine_type": "Allopathic", "composition": "Dextromethorphan + Phenylephrine + Chlorpheniramine", "dosage_form": "Syrup", "prescription_required": True, "schedule_category": "Schedule H", "drug_license_no": "DL-20B-112233"}
            }
        ]
    },
    {
        "type_code": "mobile_electronics",
        "type_name": "Mobile & Electronics Store",
        "email": "electronics@nmart.com",
        "first_name": "Vikram",
        "surname": "Kapoor",
        "store_name": "Nexora Digital & Mobile World",
        "brands": ["Samsung", "Apple", "OnePlus", "boAt", "Sony"],
        "categories": ["Smartphones", "Audio & Headphones", "Smartwatches", "Mobile Accessories", "Charging & Power"],
        "units": ["piece", "set"],
        "products": [
            {
                "name": "Samsung Galaxy S24 5G (256GB)", "sku": "ELE-SAM-001", "barcode": "890403000001",
                "category": "Smartphones", "brand": "Samsung", "unit": "piece",
                "purchase": 64999.0, "selling": 74999.0, "mrp": 79999.0, "stock": 15,
                "extra": {"device_type": "Smartphone", "model_number": "SM-S921B", "processor": "Snapdragon 8 Gen 3", "ram_gb": 8, "storage_gb": 256, "warranty_months": 12}
            },
            {
                "name": "OnePlus Nord CE 4 (128GB)", "sku": "ELE-ONE-002", "barcode": "890403000002",
                "category": "Smartphones", "brand": "OnePlus", "unit": "piece",
                "purchase": 19500.0, "selling": 24999.0, "mrp": 26999.0, "stock": 25,
                "extra": {"device_type": "Smartphone", "model_number": "CPH2613", "processor": "Snapdragon 7 Gen 3", "ram_gb": 8, "storage_gb": 128, "warranty_months": 12}
            },
            {
                "name": "boAt Airdopes 141 ANC Earbuds", "sku": "ELE-AIR-003", "barcode": "890403000003",
                "category": "Audio & Headphones", "brand": "boAt", "unit": "piece",
                "purchase": 950.0, "selling": 1499.0, "mrp": 2990.0, "stock": 60,
                "extra": {"device_type": "TWS Earbuds", "model_number": "AD-141ANC", "processor": "Bluetooth 5.3", "battery_mah": 400, "warranty_months": 12}
            },
            {
                "name": "Samsung 25W Fast Type-C Charger", "sku": "ELE-CHG-004", "barcode": "890403000004",
                "category": "Charging & Power", "brand": "Samsung", "unit": "piece",
                "purchase": 750.0, "selling": 1299.0, "mrp": 1699.0, "stock": 80,
                "extra": {"device_type": "Power Adapter", "model_number": "EP-TA800", "warranty_months": 6}
            },
            {
                "name": "Apple 20W USB-C Power Adapter", "sku": "ELE-APL-005", "barcode": "890403000005",
                "category": "Charging & Power", "brand": "Apple", "unit": "piece",
                "purchase": 1350.0, "selling": 1899.0, "mrp": 1900.0, "stock": 40,
                "extra": {"device_type": "Power Adapter", "model_number": "MHJE3HN/A", "warranty_months": 12}
            }
        ]
    },
    {
        "type_code": "plastic",
        "type_name": "Plastic Store",
        "email": "plastic@nmart.com",
        "first_name": "Karan",
        "surname": "Shah",
        "store_name": "Nexora Polymer & Plastic Superstore",
        "brands": ["Nilkamal", "Cello", "Milton", "Tupperware"],
        "categories": ["Storage Containers", "Kitchen Utilities", "Chairs & Stools", "Bathroom Utilities", "Water Jugs"],
        "units": ["piece", "set"],
        "products": [
            {
                "name": "Cello Checkers Airtight Canister 18 Pcs Set", "sku": "PLA-CEL-001", "barcode": "890503000001",
                "category": "Storage Containers", "brand": "Cello", "unit": "set",
                "purchase": 550.0, "selling": 899.0, "mrp": 1199.0, "stock": 45,
                "extra": {"plastic_type": "Polypropylene (PP)", "material_grade": "Grade A", "is_food_grade": True, "color": "Transparent / Silver Lid"}
            },
            {
                "name": "Nilkamal Crystal Heavy Duty Plastic Chair", "sku": "PLA-CHR-002", "barcode": "890503000002",
                "category": "Chairs & Stools", "brand": "Nilkamal", "unit": "piece",
                "purchase": 680.0, "selling": 1050.0, "mrp": 1350.0, "stock": 60,
                "extra": {"plastic_type": "Virgin PP", "material_grade": "Heavy Duty", "item_weight_grams": 2600.0, "color": "Marble Beige"}
            },
            {
                "name": "Milton Thermosteel Insulated Water Jug 5L", "sku": "PLA-JUG-003", "barcode": "890503000003",
                "category": "Water Jugs", "brand": "Milton", "unit": "piece",
                "purchase": 420.0, "selling": 650.0, "mrp": 790.0, "stock": 50,
                "extra": {"plastic_type": "Food Grade HDPE", "capacity_litres": 5.0, "is_food_grade": True, "color": "Royal Blue"}
            },
            {
                "name": "Cello Deluxe Bath Bucket 25 Litres", "sku": "PLA-BKT-004", "barcode": "890503000004",
                "category": "Bathroom Utilities", "brand": "Cello", "unit": "piece",
                "purchase": 180.0, "selling": 299.0, "mrp": 380.0, "stock": 75,
                "extra": {"plastic_type": "PP", "capacity_litres": 25.0, "color": "Aqua Green"}
            }
        ]
    },
    {
        "type_code": "handloom",
        "type_name": "Handloom Store",
        "email": "handloom@nmart.com",
        "first_name": "Ananya",
        "surname": "Iyer",
        "store_name": "Nexora Heritage Handlooms & Silks",
        "brands": ["FabIndia", "Khadi India", "Kalamkari Artisans", "Chanderi Weaves"],
        "categories": ["Silk Sarees", "Cotton Kurtas", "Handcrafted Dupattas", "Bedspreads", "Artisanal Stoles"],
        "units": ["piece", "set"],
        "products": [
            {
                "name": "Chanderi Zari Border Silk Cotton Saree", "sku": "HDL-SAR-001", "barcode": "890603000001",
                "category": "Silk Sarees", "brand": "Chanderi Weaves", "unit": "piece",
                "purchase": 2200.0, "selling": 3850.0, "mrp": 4800.0, "stock": 25,
                "extra": {"fabric_type": "Silk Cotton", "weaving_technique": "Handloom Jacquard", "origin_region": "Madhya Pradesh", "craft_type": "Chanderi"}
            },
            {
                "name": "Khadi India Organic Khadi Kurta", "sku": "HDL-KRT-002", "barcode": "890603000002",
                "category": "Cotton Kurtas", "brand": "Khadi India", "unit": "piece",
                "purchase": 550.0, "selling": 999.0, "mrp": 1299.0, "stock": 40,
                "extra": {"fabric_type": "100% Handspun Khadi", "weaving_technique": "Pit Loom", "origin_region": "Gujarat", "craft_type": "Khadi"}
            },
            {
                "name": "Kalamkari Hand Block Print Cotton Dupatta", "sku": "HDL-DUP-003", "barcode": "890603000003",
                "category": "Handcrafted Dupattas", "brand": "Kalamkari Artisans", "unit": "piece",
                "purchase": 420.0, "selling": 799.0, "mrp": 999.0, "stock": 35,
                "extra": {"fabric_type": "Mulmul Cotton", "weaving_technique": "Block Print", "origin_region": "Andhra Pradesh", "craft_type": "Kalamkari"}
            },
            {
                "name": "FabIndia Handwoven Jaipuri Razai Cover", "sku": "HDL-BED-004", "barcode": "890603000004",
                "category": "Bedspreads", "brand": "FabIndia", "unit": "piece",
                "purchase": 1250.0, "selling": 2199.0, "mrp": 2699.0, "stock": 20,
                "extra": {"fabric_type": "Pure Cotton", "weaving_technique": "Handloom Weave", "origin_region": "Rajasthan", "craft_type": "Jaipuri"}
            }
        ]
    },
    {
        "type_code": "furniture",
        "type_name": "Furniture Store",
        "email": "furniture@nmart.com",
        "first_name": "Manoj",
        "surname": "Sharma",
        "store_name": "Nexora Living Furniture Emporium",
        "brands": ["Godrej Interio", "Durian", "Nilkamal Home", "Urban Ladder"],
        "categories": ["Living Room Sofas", "Dining Tables", "Office Chairs", "Beds & Mattresses", "Study Desks"],
        "units": ["piece", "set"],
        "products": [
            {
                "name": "Godrej Interio High-Back Ergonomic Office Chair", "sku": "FUR-CHR-001", "barcode": "890703000001",
                "category": "Office Chairs", "brand": "Godrej Interio", "unit": "piece",
                "purchase": 5800.0, "selling": 8999.0, "mrp": 11500.0, "stock": 18,
                "extra": {"furniture_type": "Office Chair", "primary_material": "Mesh & Steel", "finish_type": "Matte Black", "seating_capacity": 1}
            },
            {
                "name": "Solid Sheesham Wood 6-Seater Dining Set", "sku": "FUR-DNG-002", "barcode": "890703000002",
                "category": "Dining Tables", "brand": "Durian", "unit": "set",
                "purchase": 21000.0, "selling": 31999.0, "mrp": 38999.0, "stock": 8,
                "extra": {"furniture_type": "Dining Set", "primary_material": "Sheesham Wood", "finish_type": "Walnut Polish", "seating_capacity": 6}
            },
            {
                "name": "Urban Ladder 3-Seater Fabric Recliner Sofa", "sku": "FUR-SFA-003", "barcode": "890703000003",
                "category": "Living Room Sofas", "brand": "Urban Ladder", "unit": "piece",
                "purchase": 18500.0, "selling": 26999.0, "mrp": 33999.0, "stock": 10,
                "extra": {"furniture_type": "Sofa", "primary_material": "Solid Sal Wood & Foam", "upholstery_material": "Suede Fabric", "seating_capacity": 3}
            },
            {
                "name": "Nilkamal Engineered Wood Queen Bed with Storage", "sku": "FUR-BED-004", "barcode": "890703000004",
                "category": "Beds & Mattresses", "brand": "Nilkamal Home", "unit": "piece",
                "purchase": 9800.0, "selling": 15499.0, "mrp": 18999.0, "stock": 12,
                "extra": {"furniture_type": "Queen Bed", "primary_material": "Engineered Wood", "finish_type": "Wenge Finish", "assembly_required": True}
            }
        ]
    },
    {
        "type_code": "agro",
        "type_name": "Agro Store",
        "email": "agro@nmart.com",
        "first_name": "Ramesh",
        "surname": "Patidar",
        "store_name": "Nexora Kisan Agro Center & Seeds",
        "brands": ["Bayer CropScience", "UPL", "Syngenta", "IFFCO", "Mahyco"],
        "categories": ["Bio-Fertilizers", "Crop Protection & Pesticides", "Hybrid Seeds", "Nutrient Enhancers", "Fungicides"],
        "units": ["kg", "liter", "packet", "bottle"],
        "products": [
            {
                "name": "IFFCO Nano Urea Liquid 500ml", "sku": "AGR-URE-001", "barcode": "890803000001",
                "category": "Bio-Fertilizers", "brand": "IFFCO", "unit": "bottle",
                "purchase": 190.0, "selling": 225.0, "mrp": 240.0, "stock": 160,
                "extra": {"product_category": "Fertilizer", "active_ingredients": "Nanoscale Nitrogen particles (4% N)", "dosage_per_acre": "250ml per 100L water", "application_method": "Foliar Spray"}
            },
            {
                "name": "Bayer Confidor Insecticide 100ml", "sku": "AGR-CNF-002", "barcode": "890803000002",
                "category": "Crop Protection & Pesticides", "brand": "Bayer CropScience", "unit": "bottle",
                "purchase": 285.0, "selling": 365.0, "mrp": 410.0, "stock": 90,
                "extra": {"product_category": "Insecticide", "active_ingredients": "Imidacloprid 17.8% SL", "dosage_per_acre": "50-100ml", "application_method": "Spray"}
            },
            {
                "name": "Mahyco Hybrid Cotton Seeds (Bollgard II)", "sku": "AGR-CTN-003", "barcode": "890803000003",
                "category": "Hybrid Seeds", "brand": "Mahyco", "unit": "packet",
                "purchase": 620.0, "selling": 810.0, "mrp": 864.0, "stock": 110,
                "extra": {"product_category": "Seeds", "seed_variety": "MRC 7351 BG-II", "germination_percentage": 85.0, "target_crops": "Cotton"}
            },
            {
                "name": "UPL Saaf Systemic Fungicide 500g", "sku": "AGR-SAF-004", "barcode": "890803000004",
                "category": "Fungicides", "brand": "UPL", "unit": "packet",
                "purchase": 320.0, "selling": 420.0, "mrp": 475.0, "stock": 80,
                "extra": {"product_category": "Fungicide", "active_ingredients": "Carbendazim 12% + Mancozeb 63% WP", "dosage_per_acre": "300g", "application_method": "Foliar Spray"}
            }
        ]
    }
]

# Standard Customers to Seed Per Store
STANDARD_CUSTOMERS = [
    {
        "name": "Rajesh Sharma",
        "phone": "9876543210",
        "email": "rajesh.sharma@example.com",
        "address": "B-402, Gokul Residency, MG Road",
        "balance": 2450.0,
        "credit_limit": 15000.0,
        "is_debit": True,
    },
    {
        "name": "Priya Patel",
        "phone": "9825012345",
        "email": "priya.patel@example.com",
        "address": "12, Shanti Sadan Society",
        "balance": 1200.0,
        "credit_limit": 10000.0,
        "is_debit": True,
    },
    {
        "name": "Amit Verma",
        "phone": "9811122334",
        "email": "amit.verma@example.com",
        "address": "Plot 88, Sunrise Industrial Area",
        "balance": 4800.0,
        "credit_limit": 25000.0,
        "is_debit": True,
    },
    {
        "name": "Sneha Kulkarni",
        "phone": "9890011223",
        "email": "sneha.k@example.com",
        "address": "Flat 3A, Green Park Apts",
        "balance": 0.0,
        "credit_limit": 5000.0,
        "is_debit": False,
    },
    {
        "name": "Vikram Singh",
        "phone": "9712345678",
        "email": "vikram.singh@example.com",
        "address": "C-14, Royal Palm Villas",
        "balance": 850.0,
        "credit_limit": 12000.0,
        "is_debit": True,
    },
]

# Standard Suppliers to Seed Per Store
STANDARD_SUPPLIERS = [
    {
        "name": "Apex Wholesale Distributors",
        "company_name": "Apex Trade Links Pvt Ltd",
        "phone": "9822001122",
        "email": "sales@apextradelinks.com",
        "address": "Warehouse 4, APMC Market Yard",
        "gst_number": "24AAACA1122C1Z2",
    },
    {
        "name": "Prime Supply Logistics",
        "company_name": "Prime Goods Corporation",
        "phone": "9833002233",
        "email": "orders@primesupply.com",
        "address": "Unit 18, Logistic Park, Highway 8",
        "gst_number": "24BBBCB3344D1Z4",
    },
    {
        "name": "National Stockist Network",
        "company_name": "NSN Wholesale Ltd",
        "phone": "9844003344",
        "email": "info@nsnwholesale.in",
        "address": "Shop 101, Commercial Hub",
        "gst_number": "24CCCCD5566E1Z6",
    },
]

def seed_demo_data():
    db = SessionLocal()
    try:
        print("==================================================")
        print("NEXORA MART – COMPREHENSIVE DEMO DATA SEEDER")
        print("==================================================")

        # 1. Fetch Store Types Map
        store_types = {st.code: st for st in db.query(StoreType).all()}
        print(f"Loaded {len(store_types)} store types from database.")

        # Also get all existing users
        existing_users = {u.email.lower(): u for u in db.query(User).all()}

        # Also map existing stores for zeelptl028@gmail.com and demo@nmart.com
        user_zeel = existing_users.get("zeelptl028@gmail.com")
        user_demo = existing_users.get("demo@nmart.com")
        user_cloth = existing_users.get("cloth@gmail.com")

        # Store-content helper
        def seed_store_content(target_store, store_cfg):
            t_code = store_cfg["type_code"]
            # Seed Brands for this store
            b_map = {}
            for b_name in store_cfg["brands"]:
                b_code = b_name.lower().replace(" ", "_").replace("'", "")[:20]
                brand = db.query(Brand).filter(Brand.store_id == target_store.id, Brand.name == b_name).first()
                if not brand:
                    brand = Brand(store_id=target_store.id, name=b_name, code=b_code, is_active=True)
                    db.add(brand)
                    db.flush()
                b_map[b_name] = brand

            # Seed Categories for this store
            c_map = {}
            for c_name in store_cfg["categories"]:
                c_code = c_name.lower().replace(" ", "_").replace("&", "and")[:20]
                cat = db.query(Category).filter(Category.store_id == target_store.id, Category.name == c_name).first()
                if not cat:
                    cat = Category(store_id=target_store.id, name=c_name, code=c_code, is_active=True)
                    db.add(cat)
                    db.flush()
                c_map[c_name] = cat

            # Seed Suppliers for this store
            for s_info in STANDARD_SUPPLIERS:
                sup = db.query(Supplier).filter(Supplier.store_id == target_store.id, Supplier.name == s_info["name"]).first()
                if not sup:
                    db.add(Supplier(
                        store_id=target_store.id,
                        name=s_info["name"],
                        company_name=s_info["company_name"],
                        phone=s_info["phone"],
                        email=s_info["email"],
                        address=s_info["address"],
                        gst_number=s_info["gst_number"],
                        is_active=True
                    ))
            db.flush()

            # Seed Customers & Debit Customers for this store
            cust_objs = []
            for c_info in STANDARD_CUSTOMERS:
                cust = db.query(Customer).filter(Customer.store_id == target_store.id, Customer.phone == c_info["phone"]).first()
                if not cust:
                    cust = Customer(
                        store_id=target_store.id,
                        name=c_info["name"],
                        phone=c_info["phone"],
                        email=c_info["email"],
                        address=c_info["address"],
                        credit_limit=c_info["credit_limit"],
                        balance=c_info["balance"],
                        is_active=True
                    )
                    db.add(cust)
                    db.flush()

                    if c_info["is_debit"]:
                        deb = DebitCustomer(
                            store_id=target_store.id,
                            customer_id=cust.id,
                            total_credit_limit=c_info["credit_limit"],
                            outstanding_balance=c_info["balance"],
                            status="ACTIVE",
                            due_date=NOW + datetime.timedelta(days=15),
                            notes="Regular verified store credit account"
                        )
                        db.add(deb)
                        db.flush()
                cust_objs.append(cust)

            # Seed Products for this store
            c_prods = []
            for p_info in store_cfg["products"]:
                prod = db.query(Product).filter(Product.store_id == target_store.id, Product.sku == p_info["sku"]).first()
                cat_obj = c_map.get(p_info["category"])
                brand_obj = b_map.get(p_info["brand"])

                cat_id = cat_obj.id if cat_obj else None
                brand_id = brand_obj.id if brand_obj else None

                if not prod:
                    # Resolve or create Unit
                    u_sym = p_info["unit"]
                    unit_obj = db.query(Unit).filter(Unit.symbol == u_sym).first()
                    if not unit_obj:
                        unit_obj = Unit(name=u_sym, symbol=u_sym, is_base_unit=True, store_id=target_store.id)
                        db.add(unit_obj)
                        db.flush()

                    prod = Product(
                        store_id=target_store.id,
                        category_id=cat_id,
                        brand_id=brand_id,
                        product_name=p_info["name"],
                        sku=p_info["sku"],
                        barcode=p_info["barcode"],
                        description=f"Authentic {p_info['name']} for retail store checkout.",
                        short_description=p_info["name"],
                        product_type="simple",
                        unit_id=unit_obj.id,
                        status="active",
                    )
                    db.add(prod)
                    db.flush()

                    # Pricing Record
                    pricing = ProductPricing(
                        id=str(uuid.uuid4()),
                        store_id=target_store.id,
                        product_id=prod.id,
                        purchase_price=p_info["purchase"],
                        selling_price=p_info["selling"],
                        mrp=p_info["mrp"],
                        gst_rate=5.0,
                        cgst_rate=2.5,
                        sgst_rate=2.5,
                        tax_type="exclusive"
                    )
                    db.add(pricing)

                    # Inventory Record
                    inventory = ProductInventory(
                        id=str(uuid.uuid4()),
                        store_id=target_store.id,
                        product_id=prod.id,
                        current_stock=p_info["stock"],
                        minimum_stock=10,
                        warehouse_location="Rack A-1"
                    )
                    db.add(inventory)

                    # Stock Batch
                    stock = ProductStock(
                        store_id=target_store.id,
                        product_id=prod.id,
                        batch_number=f"BAT-{p_info['sku'][-6:]}",
                        quantity=p_info["stock"],
                        location="Rack A-1"
                    )
                    db.add(stock)

                    # Store-Specific Detail Tables
                    extra = p_info.get("extra", {})
                    if t_code == "grocery":
                        db.add(GroceryProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            food_type=extra.get("food_type", "Vegetarian"),
                            net_weight=f"{extra.get('weight_volume', 1.0)} {extra.get('weight_unit', 'kg')}",
                            shelf_life_days=extra.get("shelf_life_days", 180),
                            fssai_license=extra.get("fssai_license", "10020021000123"),
                            status="active"
                        ))
                    elif t_code == "clothing":
                        db.add(ClothingProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            gender=extra.get("gender", "Men"),
                            clothing_type=extra.get("clothing_type", "Casual"),
                            fabric_type=extra.get("fabric", "Cotton"),
                            pattern=extra.get("pattern", "Solid"),
                            fit_type=extra.get("fit", "Regular Fit"),
                            status="active"
                        ))
                    elif t_code == "medical":
                        db.add(MedicalProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            medicine_type=extra.get("medicine_type", "Prescription Medicine"),
                            composition=extra.get("composition", "Standard Formulation"),
                            dosage_form=extra.get("dosage_form", "Tablet"),
                            prescription_required=extra.get("prescription_required", False),
                            schedule_type=extra.get("schedule_category", "Schedule H"),
                            drug_license_number=extra.get("drug_license_no", "DL-MH-2024-001234"),
                            status="active"
                        ))
                    elif t_code == "mobile_electronics":
                        db.add(ElectronicsProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            device_type=extra.get("device_type", "Smartphone"),
                            model_number=extra.get("model_number", "MODEL-X"),
                            processor=extra.get("processor", "Octa-core"),
                            ram=f"{extra.get('ram_gb', 8)} GB",
                            storage_capacity=f"{extra.get('storage_gb', 128)} GB",
                            warranty_months=extra.get("warranty_months", 12),
                            status="active"
                        ))
                    elif t_code == "plastic":
                        db.add(PlasticProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            plastic_type=extra.get("plastic_type", "Polypropylene (PP)"),
                            material_grade=extra.get("material_grade", "100% Virgin Grade"),
                            capacity=str(extra.get("capacity_litres", "25")),
                            capacity_unit="L",
                            color=extra.get("color", "Royal Blue"),
                            food_grade=extra.get("is_food_grade", False),
                            status="active"
                        ))
                    elif t_code == "handloom":
                        db.add(HandloomProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            fabric_type=extra.get("fabric_type", "Pure Khadi Cotton"),
                            weaving_technique=extra.get("weaving_technique", "Traditional Pit Loom"),
                            craft_type=extra.get("craft_type", "Zari Brocade"),
                            origin_region=extra.get("origin_region", "Rajasthan"),
                            status="active"
                        ))
                    elif t_code == "furniture":
                        db.add(FurnitureProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            furniture_type=extra.get("furniture_type", "Sofa & Couch"),
                            material=extra.get("primary_material", "Solid Teak Wood"),
                            finish_type=extra.get("finish_type", "Walnut Finish"),
                            seating_capacity=extra.get("seating_capacity", 1),
                            status="active"
                        ))
                    elif t_code == "agro":
                        db.add(AgroProduct(
                            store_id=target_store.id,
                            product_id=prod.id,
                            category_id=cat_id,
                            brand_id=brand_id,
                            product_name=prod.product_name,
                            sku=prod.sku,
                            barcode=prod.barcode,
                            description=prod.description,
                            agro_product_type=extra.get("product_category", "Fertilizer"),
                            status="active"
                        ))
                    db.flush()
                prod._selling_price = float(p_info["selling"])
                c_prods.append(prod)

            # Seed Real Demo Invoices for Today, Yesterday, & Past Week
            inv_cnt = db.query(Invoice).filter(Invoice.store_id == target_store.id).count()
            if inv_cnt < 3 and len(c_prods) >= 2:
                print(f"Seeding demo invoices for store {target_store.name}...")
                p1 = c_prods[0]
                p2 = c_prods[1]
                p3 = c_prods[2] if len(c_prods) > 2 else c_prods[0]

                p1_price = getattr(p1, '_selling_price', None) or p1.selling_price or 100.0
                p2_price = getattr(p2, '_selling_price', None) or p2.selling_price or 150.0
                p3_price = getattr(p3, '_selling_price', None) or p3.selling_price or 200.0

                # Invoice 1: TODAY - UPI Payment to Priya Patel
                inv1 = Invoice(
                    store_id=target_store.id,
                    customer_id=cust_objs[1].id if len(cust_objs) > 1 else None,
                    invoice_number=f"INV-{TODAY_START.strftime('%Y%m%d')}-{target_store.id}01",
                    invoice_date=TODAY_START + datetime.timedelta(hours=1),
                    subtotal=p1_price * 2,
                    discount_amount=50.0,
                    tax_amount=round((p1_price * 2 - 50.0) * 0.05, 2),
                    total_amount=round((p1_price * 2 - 50.0) * 1.05, 2),
                    paid_amount=round((p1_price * 2 - 50.0) * 1.05, 2),
                    payment_status="PAID",
                    payment_method="UPI",
                    notes="Counter UPI sale via QR code scanner",
                    created_at=TODAY_START + datetime.timedelta(hours=1)
                )
                db.add(inv1)
                db.flush()

                db.add(InvoiceItem(
                    store_id=target_store.id,
                    invoice_id=inv1.id,
                    product_id=p1.id,
                    quantity=2.0,
                    unit_price=p1_price,
                    discount=50.0,
                    tax_amount=round((p1_price * 2 - 50.0) * 0.05, 2),
                    total_price=round((p1_price * 2 - 50.0) * 1.05, 2)
                ))

                # Invoice 2: TODAY - CASH Payment to Walk-in Customer
                inv2 = Invoice(
                    store_id=target_store.id,
                    customer_id=None,
                    invoice_number=f"INV-{TODAY_START.strftime('%Y%m%d')}-{target_store.id}02",
                    invoice_date=TODAY_START + datetime.timedelta(hours=2, minutes=30),
                    subtotal=p2_price,
                    discount_amount=0.0,
                    tax_amount=round(p2_price * 0.05, 2),
                    total_amount=round(p2_price * 1.05, 2),
                    paid_amount=round(p2_price * 1.05, 2),
                    payment_status="PAID",
                    payment_method="CASH",
                    notes="Counter cash walk-in sale",
                    created_at=TODAY_START + datetime.timedelta(hours=2, minutes=30)
                )
                db.add(inv2)
                db.flush()

                db.add(InvoiceItem(
                    store_id=target_store.id,
                    invoice_id=inv2.id,
                    product_id=p2.id,
                    quantity=1.0,
                    unit_price=p2_price,
                    discount=0.0,
                    tax_amount=round(p2_price * 0.05, 2),
                    total_price=round(p2_price * 1.05, 2)
                ))

                # Invoice 3: TODAY - DEBIT CUSTOMER (Khata) to Rajesh Sharma
                rajesh = cust_objs[0]
                tot3 = round((p3_price * 2) * 1.05, 2)
                inv3 = Invoice(
                    store_id=target_store.id,
                    customer_id=rajesh.id,
                    invoice_number=f"INV-{TODAY_START.strftime('%Y%m%d')}-{target_store.id}03",
                    invoice_date=TODAY_START + datetime.timedelta(hours=3),
                    subtotal=p3_price * 2,
                    discount_amount=0.0,
                    tax_amount=round((p3_price * 2) * 0.05, 2),
                    total_amount=tot3,
                    paid_amount=0.0,
                    payment_status="PENDING",
                    payment_method="DEBIT_CUSTOMER",
                    notes=f"Debited to Khata of {rajesh.name}",
                    created_at=TODAY_START + datetime.timedelta(hours=3)
                )
                db.add(inv3)
                db.flush()

                db.add(InvoiceItem(
                    store_id=target_store.id,
                    invoice_id=inv3.id,
                    product_id=p3.id,
                    quantity=2.0,
                    unit_price=p3_price,
                    discount=0.0,
                    tax_amount=round((p3_price * 2) * 0.05, 2),
                    total_price=tot3
                ))

                # Invoice 4: YESTERDAY - BANK / CARD to Amit Verma
                inv4 = Invoice(
                    store_id=target_store.id,
                    customer_id=cust_objs[2].id if len(cust_objs) > 2 else None,
                    invoice_number=f"INV-{YESTERDAY.strftime('%Y%m%d')}-{target_store.id}01",
                    invoice_date=YESTERDAY + datetime.timedelta(hours=5),
                    subtotal=p1_price * 3,
                    discount_amount=100.0,
                    tax_amount=round((p1_price * 3 - 100.0) * 0.05, 2),
                    total_amount=round((p1_price * 3 - 100.0) * 1.05, 2),
                    paid_amount=round((p1_price * 3 - 100.0) * 1.05, 2),
                    payment_status="PAID",
                    payment_method="BANK_TRANSFER",
                    notes="Paid via Card POS Swipe Terminal",
                    created_at=YESTERDAY + datetime.timedelta(hours=5)
                )
                db.add(inv4)
                db.flush()

                db.add(InvoiceItem(
                    store_id=target_store.id,
                    invoice_id=inv4.id,
                    product_id=p1.id,
                    quantity=3.0,
                    unit_price=p1_price,
                    discount=100.0,
                    tax_amount=round((p1_price * 3 - 100.0) * 0.05, 2),
                    total_price=round((p1_price * 3 - 100.0) * 1.05, 2)
                ))

                # Invoice 5: 3 DAYS AGO - CASH to Walk-in Customer
                inv5 = Invoice(
                    store_id=target_store.id,
                    customer_id=None,
                    invoice_number=f"INV-{THREE_DAYS_AGO.strftime('%Y%m%d')}-{target_store.id}01",
                    invoice_date=THREE_DAYS_AGO + datetime.timedelta(hours=4),
                    subtotal=p2_price * 2,
                    discount_amount=0.0,
                    tax_amount=round(p2_price * 2 * 0.05, 2),
                    total_amount=round(p2_price * 2 * 1.05, 2),
                    paid_amount=round(p2_price * 2 * 1.05, 2),
                    payment_status="PAID",
                    payment_method="CASH",
                    notes="Counter cash checkout",
                    created_at=THREE_DAYS_AGO + datetime.timedelta(hours=4)
                )
                db.add(inv5)
                db.flush()

                db.add(InvoiceItem(
                    store_id=target_store.id,
                    invoice_id=inv5.id,
                    product_id=p2.id,
                    quantity=2.0,
                    unit_price=p2_price,
                    discount=0.0,
                    tax_amount=round(p2_price * 2 * 0.05, 2),
                    total_price=round(p2_price * 2 * 1.05, 2)
                ))
            db.flush()

        # Seed content for each demo store
        for cfg in DEMO_STORE_CONFIGS:
            t_code = cfg["type_code"]
            st_type = store_types.get(t_code)
            st_type_id = st_type.id if st_type else 1

            # Determine user
            u_email = cfg["email"].lower()
            user = existing_users.get(u_email)

            if not user:
                print(f"Creating user {u_email} ({cfg['type_name']})...")
                user = User(
                    email=u_email,
                    first_name=cfg["first_name"],
                    surname=cfg["surname"],
                    phone=f"+91 98000 000{st_type_id}",
                    store_type=cfg["type_name"],
                    shop_category=cfg["type_name"],
                    shop_category_id=st_type_id,
                    hashed_password=PASSWORD_HASH,
                    plain_password="password123",
                    is_active=True
                )
                db.add(user)
                db.flush()
                existing_users[u_email] = user
            else:
                user.store_type = cfg["type_name"]
                user.shop_category = cfg["type_name"]
                user.shop_category_id = st_type_id
                user.plain_password = "password123"
                user.hashed_password = PASSWORD_HASH
                db.flush()

            # Determine Store
            store = db.query(Store).filter(Store.user_id == user.id).first()
            if not store:
                print(f"Creating store '{cfg['store_name']}' for user {user.email}...")
                store = Store(
                    name=cfg["store_name"],
                    user_id=user.id,
                    store_type_id=st_type_id,
                    shop_category_id=st_type_id,
                    store_type=cfg["type_name"],
                    currency="INR",
                    currency_symbol="₹",
                    is_active=True
                )
                db.add(store)
                db.flush()
            else:
                store.store_type_id = st_type_id
                store.shop_category_id = st_type_id
                db.flush()

            su = db.query(StoreUser).filter(StoreUser.store_id == store.id, StoreUser.user_id == user.id).first()
            if not su:
                db.add(StoreUser(store_id=store.id, user_id=user.id, role="OWNER", is_active=True))
                db.flush()

            seed_store_content(store, cfg)
            print(f"✓ Store '{store.name}' ({cfg['type_name']}) seeded successfully with products, customers, suppliers & bills.")

        # Also sync existing users: Zeel Dobariya (Store 2, Grocery), Alex (Store 1, Grocery), Cloth (Clothing)
        for u_obj, cfg_index in [(user_zeel, 0), (user_demo, 0), (user_cloth, 1)]:
            if u_obj:
                u_store = db.query(Store).filter(Store.user_id == u_obj.id).first()
                if u_store:
                    print(f"Syncing demo products & bills for existing user store '{u_store.name}' ({u_obj.email})...")
                    seed_store_content(u_store, DEMO_STORE_CONFIGS[cfg_index])
                    print(f"✓ Existing user store '{u_store.name}' synced successfully.")

        db.commit()
        print("==================================================")
        print("ALL DEMO DATA SUCCESSFULLY SEEDED!")
        print("==================================================")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
