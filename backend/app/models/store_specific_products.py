import uuid
import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON, Numeric, UniqueConstraint
)
from sqlalchemy.orm import relationship
from ..database.connection import Base


# =========================================================================
# SHARED MASTER & INFRASTRUCTURE TABLES
# =========================================================================

class ProductSubcategory(Base):
    __tablename__ = "product_subcategories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    category = relationship("Category")


class ProductUnitConversion(Base):
    __tablename__ = "product_unit_conversions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    from_unit = Column(String(50), nullable=False)  # e.g. "BAG", "BOX", "STRIP", "CARTON", "ROLL"
    to_unit = Column(String(50), nullable=False)    # e.g. "KG", "PIECE", "TABLET", "METER"
    multiplier = Column(Numeric(12, 4), nullable=False)  # e.g. 25.0000 (1 Bag = 25 KG)
    description = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    contact_person = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class StockLocation(Base):
    __tablename__ = "stock_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    rack_number = Column(String(50), nullable=True)
    shelf_number = Column(String(50), nullable=True)
    bin_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)


class TaxRate(Base):
    __tablename__ = "tax_rates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)  # e.g. "GST 5%", "GST 18%"
    rate = Column(Numeric(5, 2), nullable=False)
    cgst_rate = Column(Numeric(5, 2), default=Decimal("0.00"))
    sgst_rate = Column(Numeric(5, 2), default=Decimal("0.00"))
    igst_rate = Column(Numeric(5, 2), default=Decimal("0.00"))
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, nullable=False)


class HsnCode(Base):
    __tablename__ = "hsn_codes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    default_gst_rate = Column(Numeric(5, 2), default=Decimal("18.00"))


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), nullable=False, index=True)
    variant_id = Column(String(36), nullable=True, index=True)
    batch_id = Column(String(36), nullable=True, index=True)
    transaction_type = Column(String(50), nullable=False)  # PURCHASE, SALE, SALE_RETURN, PURCHASE_RETURN, ADJUSTMENT, TRANSFER
    quantity = Column(Numeric(12, 3), nullable=False)
    unit = Column(String(50), default="pcs")
    reference_type = Column(String(50), nullable=True)     # INVOICE, PURCHASE_ORDER, MANUAL_ADJUSTMENT
    reference_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)


# =========================================================================
# 1. GROCERY STORE PRODUCT TABLES
# =========================================================================

class GroceryProduct(Base):
    __tablename__ = "grocery_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    food_type = Column(String(50), default="Vegetarian")  # Vegetarian, Non-Vegetarian, Vegan
    item_type = Column(String(100), nullable=True)        # Grains, Dals, Oil, Spices, Dairy, Snacks
    packaging_type = Column(String(100), nullable=True)   # Packet, Bottle, Tin, Bag, Loose
    net_weight = Column(String(50), nullable=True)
    gross_weight = Column(String(50), nullable=True)
    shelf_life_days = Column(Integer, nullable=True)
    is_vegetarian = Column(Boolean, default=True)
    storage_type = Column(String(100), default="Cool & Dry Place")
    fssai_license = Column(String(100), nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("GroceryProductDetail", back_populates="grocery_product", uselist=False, cascade="all, delete-orphan")
    batches = relationship("GroceryProductBatch", back_populates="grocery_product", cascade="all, delete-orphan")


class GroceryProductDetail(Base):
    __tablename__ = "grocery_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    grocery_product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    ingredients = Column(Text, nullable=True)
    nutritional_info = Column(Text, nullable=True)
    allergen_info = Column(Text, nullable=True)
    country_of_origin = Column(String(100), default="India")
    manufacturer = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    grocery_product = relationship("GroceryProduct", back_populates="details")


class GroceryProductBatch(Base):
    __tablename__ = "grocery_product_batches_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    grocery_product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    current_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    grocery_product = relationship("GroceryProduct", back_populates="batches")


# =========================================================================
# 2. CLOTHING STORE PRODUCT TABLES
# =========================================================================

class ClothingProduct(Base):
    __tablename__ = "clothing_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    gender = Column(String(50), default="Men")            # Men, Women, Boys, Girls, Unisex, Baby
    clothing_type = Column(String(100), default="T-Shirt") # T-Shirt, Shirt, Jeans, Kurti, Saree, etc.
    fabric_type = Column(String(100), default="Cotton")   # Cotton, Polyester, Silk, Denim, etc.
    pattern = Column(String(100), default="Plain")        # Plain, Printed, Striped, Checked, etc.
    fit_type = Column(String(100), default="Regular Fit") # Slim Fit, Regular Fit, Relaxed Fit, etc.
    sleeve_type = Column(String(100), nullable=True)
    neck_type = Column(String(100), nullable=True)
    occasion = Column(String(100), default="Casual")
    season = Column(String(100), default="All Season")
    country_of_origin = Column(String(100), default="India")
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("ClothingProductDetail", back_populates="clothing_product", uselist=False, cascade="all, delete-orphan")
    variants = relationship("ClothingProductVariant", back_populates="clothing_product", cascade="all, delete-orphan")


class ClothingProductDetail(Base):
    __tablename__ = "clothing_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    clothing_product_id = Column(String(36), ForeignKey("clothing_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    chest = Column(String(50), nullable=True)
    waist = Column(String(50), nullable=True)
    shoulder = Column(String(50), nullable=True)
    sleeve_length = Column(String(50), nullable=True)
    shirt_length = Column(String(50), nullable=True)
    hip = Column(String(50), nullable=True)
    inseam = Column(String(50), nullable=True)
    measurement_unit = Column(String(20), default="Inches")  # CM, Inches
    care_instructions = Column(Text, nullable=True)
    wash_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    clothing_product = relationship("ClothingProduct", back_populates="details")


class ClothingProductVariant(Base):
    __tablename__ = "clothing_product_variants_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    clothing_product_id = Column(String(36), ForeignKey("clothing_products.id", ondelete="CASCADE"), nullable=False, index=True)
    size = Column(String(50), nullable=False)
    color = Column(String(50), nullable=False)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    stock_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    mrp = Column(Numeric(12, 2), nullable=True)
    wholesale_price = Column(Numeric(12, 2), nullable=True)
    min_stock_alert = Column(Numeric(12, 3), default=Decimal("3.000"))
    variant_image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    clothing_product = relationship("ClothingProduct", back_populates="variants")


# =========================================================================
# 3. MEDICAL / PHARMACY STORE PRODUCT TABLES
# =========================================================================

class MedicalProduct(Base):
    __tablename__ = "medical_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=True, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    medicine_type = Column(String(100), default="Prescription Medicine") # Prescription, OTC, Generic, Ayurvedic, etc.
    composition = Column(Text, nullable=True)                           # Active salt / ingredients
    strength = Column(String(100), nullable=True)                        # 500
    strength_unit = Column(String(50), default="mg")                    # mg, mcg, g, ml, IU
    dosage_form = Column(String(100), default="Tablet")                 # Tablet, Capsule, Syrup, Injection, etc.
    route_of_administration = Column(String(100), default="Oral")       # Oral, Topical, IV, etc.
    prescription_required = Column(Boolean, default=False)
    schedule_type = Column(String(50), default="Schedule H")            # Schedule H, H1, X, OTC
    therapeutic_category = Column(String(150), nullable=True)
    drug_license_number = Column(String(100), nullable=True)
    storage_condition = Column(String(200), default="Cool & Dry Place")
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("MedicalProductDetail", back_populates="medical_product", uselist=False, cascade="all, delete-orphan")
    batches = relationship("MedicalProductBatch", back_populates="medical_product", cascade="all, delete-orphan")


class MedicalProductDetail(Base):
    __tablename__ = "medical_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    medical_product_id = Column(String(36), ForeignKey("medical_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    pack_size = Column(String(100), nullable=True)  # e.g. 10 Tablets / Strip
    strips_per_box = Column(Integer, default=10)
    tablets_per_strip = Column(Integer, default=10)
    side_effects = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    temperature_range = Column(String(100), nullable=True)
    keep_refrigerated = Column(Boolean, default=False)
    light_sensitive = Column(Boolean, default=False)
    manufacturer = Column(String(200), nullable=True)
    country_of_origin = Column(String(100), default="India")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    medical_product = relationship("MedicalProduct", back_populates="details")


class MedicalProductBatch(Base):
    __tablename__ = "medical_product_batches_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    medical_product_id = Column(String(36), ForeignKey("medical_products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=False, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    mrp = Column(Numeric(12, 2), nullable=True)
    initial_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    current_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    rack_location = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    medical_product = relationship("MedicalProduct", back_populates="batches")


# =========================================================================
# 4. MOBILE & ELECTRONICS STORE PRODUCT TABLES
# =========================================================================

class ElectronicsProduct(Base):
    __tablename__ = "electronics_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    device_type = Column(String(100), default="Smartphone")
    model_number = Column(String(100), nullable=True)
    model_name = Column(String(150), nullable=True)
    color = Column(String(50), nullable=True)
    ram = Column(String(50), nullable=True)
    storage_capacity = Column(String(50), nullable=True)
    processor = Column(String(150), nullable=True)
    screen_size = Column(String(50), nullable=True)
    battery_capacity = Column(String(50), nullable=True)
    connectivity = Column(String(150), nullable=True)
    warranty_months = Column(Integer, default=12)
    warranty_type = Column(String(100), default="Brand Carry-In")
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("ElectronicsProductDetail", back_populates="electronics_product", uselist=False, cascade="all, delete-orphan")
    serials = relationship("ElectronicsProductSerial", back_populates="electronics_product", cascade="all, delete-orphan")


class ElectronicsProductDetail(Base):
    __tablename__ = "electronics_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    electronics_product_id = Column(String(36), ForeignKey("electronics_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    power_rating = Column(String(100), nullable=True)
    accessories_included = Column(Text, nullable=True)
    operating_system = Column(String(100), nullable=True)
    camera_specs = Column(String(200), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    country_of_origin = Column(String(100), default="India")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    electronics_product = relationship("ElectronicsProduct", back_populates="details")


class ElectronicsProductSerial(Base):
    __tablename__ = "electronics_product_serials_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    electronics_product_id = Column(String(36), ForeignKey("electronics_products.id", ondelete="CASCADE"), nullable=False, index=True)
    serial_number = Column(String(100), nullable=False, index=True)
    imei_number = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="available")  # available, sold, defective
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    electronics_product = relationship("ElectronicsProduct", back_populates="serials")


# =========================================================================
# 5. PLASTIC STORE PRODUCT TABLES
# =========================================================================

class PlasticProduct(Base):
    __tablename__ = "plastic_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    plastic_type = Column(String(100), default="Polypropylene (PP)")
    material_grade = Column(String(100), default="100% Virgin Grade")
    color = Column(String(50), nullable=True)
    shape = Column(String(50), default="Round")
    capacity = Column(String(50), nullable=True)
    capacity_unit = Column(String(50), default="L")
    length = Column(String(50), nullable=True)
    width = Column(String(50), nullable=True)
    height = Column(String(50), nullable=True)
    thickness = Column(String(50), nullable=True)
    weight = Column(String(50), nullable=True)
    food_grade = Column(Boolean, default=False)
    recyclable = Column(Boolean, default=True)
    uv_resistant = Column(Boolean, default=False)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("PlasticProductDetail", back_populates="plastic_product", uselist=False, cascade="all, delete-orphan")
    variants = relationship("PlasticProductVariant", back_populates="plastic_product", cascade="all, delete-orphan")


class PlasticProductDetail(Base):
    __tablename__ = "plastic_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    plastic_product_id = Column(String(36), ForeignKey("plastic_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    handle_type = Column(String(100), nullable=True)
    cap_type = Column(String(100), nullable=True)
    temperature_tolerance = Column(String(100), nullable=True)
    load_capacity = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    plastic_product = relationship("PlasticProduct", back_populates="details")


class PlasticProductVariant(Base):
    __tablename__ = "plastic_product_variants_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    plastic_product_id = Column(String(36), ForeignKey("plastic_products.id", ondelete="CASCADE"), nullable=False, index=True)
    color = Column(String(50), nullable=True)
    capacity = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    stock_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    plastic_product = relationship("PlasticProduct", back_populates="variants")


# =========================================================================
# 6. HANDLOOM STORE PRODUCT TABLES
# =========================================================================

class HandloomProduct(Base):
    __tablename__ = "handloom_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    product_type = Column(String(100), default="Saree")
    fabric_type = Column(String(100), default="Pure Khadi Cotton")
    weaving_technique = Column(String(100), default="Traditional Pit Loom")
    craft_type = Column(String(100), default="Zari Brocade")
    material = Column(String(150), nullable=True)
    design_pattern = Column(String(100), default="Traditional")
    origin_region = Column(String(150), nullable=True)
    artisan_name = Column(String(150), nullable=True)
    handwoven = Column(Boolean, default=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("HandloomProductDetail", back_populates="handloom_product", uselist=False, cascade="all, delete-orphan")
    variants = relationship("HandloomProductVariant", back_populates="handloom_product", cascade="all, delete-orphan")


class HandloomProductDetail(Base):
    __tablename__ = "handloom_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    handloom_product_id = Column(String(36), ForeignKey("handloom_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    saree_length = Column(String(50), nullable=True)
    saree_width = Column(String(50), nullable=True)
    blouse_piece_included = Column(Boolean, default=True)
    blouse_piece_length = Column(String(50), nullable=True)
    bedsheet_size = Column(String(50), nullable=True)  # Single, Double, Queen, King
    pillow_covers_count = Column(Integer, default=2)
    thread_count = Column(String(50), nullable=True)
    care_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    handloom_product = relationship("HandloomProduct", back_populates="details")


class HandloomProductVariant(Base):
    __tablename__ = "handloom_product_variants_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    handloom_product_id = Column(String(36), ForeignKey("handloom_products.id", ondelete="CASCADE"), nullable=False, index=True)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    pattern = Column(String(100), nullable=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    stock_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    handloom_product = relationship("HandloomProduct", back_populates="variants")


# =========================================================================
# 7. FURNITURE STORE PRODUCT TABLES
# =========================================================================

class FurnitureProduct(Base):
    __tablename__ = "furniture_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    furniture_type = Column(String(100), default="Sofa & Couch")
    material = Column(String(100), default="Solid Teak Wood")
    wood_type = Column(String(100), nullable=True)
    finish_type = Column(String(100), default="Walnut Finish")
    color = Column(String(50), nullable=True)
    seating_capacity = Column(Integer, nullable=True)
    length = Column(String(50), nullable=True)
    width = Column(String(50), nullable=True)
    height = Column(String(50), nullable=True)
    dimension_unit = Column(String(20), default="inch")
    weight = Column(String(50), nullable=True)
    weight_unit = Column(String(20), default="kg")
    assembly_required = Column(Boolean, default=False)
    storage_available = Column(Boolean, default=False)
    warranty_period = Column(Integer, default=36)
    warranty_unit = Column(String(20), default="Months")
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    details = relationship("FurnitureProductDetail", back_populates="furniture_product", uselist=False, cascade="all, delete-orphan")
    variants = relationship("FurnitureProductVariant", back_populates="furniture_product", cascade="all, delete-orphan")


class FurnitureProductDetail(Base):
    __tablename__ = "furniture_product_details_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    furniture_product_id = Column(String(36), ForeignKey("furniture_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    upholstery_material = Column(String(100), nullable=True)
    frame_material = Column(String(100), nullable=True)
    number_of_doors = Column(Integer, nullable=True)
    number_of_drawers = Column(Integer, nullable=True)
    number_of_shelves = Column(Integer, nullable=True)
    foldable = Column(Boolean, default=False)
    care_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    furniture_product = relationship("FurnitureProduct", back_populates="details")


class FurnitureProductVariant(Base):
    __tablename__ = "furniture_product_variants_v2"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    furniture_product_id = Column(String(36), ForeignKey("furniture_products.id", ondelete="CASCADE"), nullable=False, index=True)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    finish = Column(String(50), nullable=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    stock_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    furniture_product = relationship("FurnitureProduct", back_populates="variants")


# =========================================================================
# 8. AGRO STORE PRODUCT TABLES
# =========================================================================

class AgroProduct(Base):
    __tablename__ = "agro_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    agro_product_type = Column(String(50), default="Crop Medicine") # Crop Medicine, Crop, Fertilizer, Seeds
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    medicine_details = relationship("AgroMedicineDetail", back_populates="agro_product", uselist=False, cascade="all, delete-orphan")
    crop_details = relationship("AgroCropDetail", back_populates="agro_product", uselist=False, cascade="all, delete-orphan")
    fertilizer_details = relationship("AgroFertilizerDetail", back_populates="agro_product", uselist=False, cascade="all, delete-orphan")
    seed_details = relationship("AgroSeedDetail", back_populates="agro_product", uselist=False, cascade="all, delete-orphan")


class AgroMedicineDetail(Base):
    __tablename__ = "agro_medicine_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    agro_product_id = Column(String(36), ForeignKey("agro_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    medicine_type = Column(String(100), default="Insecticide") # Insecticide, Fungicide, Herbicide, Miticide, etc.
    active_ingredient = Column(String(200), nullable=True)
    chemical_composition = Column(Text, nullable=True)
    concentration = Column(String(100), nullable=True)
    formulation_type = Column(String(50), default="EC")        # EC, SC, WP, WG, GR, SL, etc.
    target_pest = Column(String(200), nullable=True)
    suitable_crops = Column(String(255), nullable=True)
    application_method = Column(String(100), default="Spray")
    recommended_dosage = Column(String(100), nullable=True)
    dosage_unit = Column(String(50), default="ml / Litre")
    waiting_period_phi = Column(String(50), nullable=True)
    re_entry_interval = Column(String(50), nullable=True)
    toxicity_class = Column(String(50), nullable=True)
    registration_number = Column(String(100), nullable=True)
    label_instructions = Column(Text, nullable=True)
    safety_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    agro_product = relationship("AgroProduct", back_populates="medicine_details")


class AgroCropDetail(Base):
    __tablename__ = "agro_crop_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    agro_product_id = Column(String(36), ForeignKey("agro_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    crop_category = Column(String(100), default="Cereals") # Cereals, Pulses, Oilseeds, Vegetables, Fruits, etc.
    crop_variety = Column(String(150), nullable=True)
    crop_season = Column(String(50), default="Kharif")     # Kharif, Rabi, Zaid, All Season
    crop_duration = Column(String(50), nullable=True)
    growing_region = Column(String(150), nullable=True)
    grade = Column(String(50), default="Grade A")          # Grade A, Grade B, Premium
    moisture_content = Column(String(50), nullable=True)
    organic_certified = Column(Boolean, default=False)
    harvest_year = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    agro_product = relationship("AgroProduct", back_populates="crop_details")


class AgroFertilizerDetail(Base):
    __tablename__ = "agro_fertilizer_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    agro_product_id = Column(String(36), ForeignKey("agro_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    fertilizer_type = Column(String(100), default="Chemical Fertilizer") # Chemical, Organic, Bio, Micronutrient
    nitrogen_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    phosphorus_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    potassium_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    sulphur_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    zinc_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    boron_pct = Column(Numeric(5, 2), default=Decimal("0.00"))
    physical_form = Column(String(50), default="Granules")              # Powder, Granules, Liquid, Pellets
    application_method = Column(String(100), default="Soil Application")
    suitable_crops = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    agro_product = relationship("AgroProduct", back_populates="fertilizer_details")


class AgroSeedDetail(Base):
    __tablename__ = "agro_seed_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    agro_product_id = Column(String(36), ForeignKey("agro_products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    seed_type = Column(String(100), default="Vegetable Seeds")
    crop_name = Column(String(150), nullable=True)
    seed_variety = Column(String(150), nullable=True)
    hybrid_type = Column(String(50), default="Hybrid")        # Hybrid, Open Pollinated, Traditional
    seed_class = Column(String(50), default="Certified Seed") # Breeder, Foundation, Certified, Truthfully Labelled
    germination_rate = Column(Numeric(5, 2), default=Decimal("85.00"))
    physical_purity = Column(Numeric(5, 2), default=Decimal("98.00"))
    genetic_purity = Column(Numeric(5, 2), default=Decimal("99.00"))
    seed_certification_number = Column(String(100), nullable=True)
    lot_number = Column(String(100), nullable=True)
    days_to_maturity = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    agro_product = relationship("AgroProduct", back_populates="seed_details")

