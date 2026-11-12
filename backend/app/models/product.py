import uuid
import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON, Numeric, and_
)
from sqlalchemy.orm import relationship, synonym
from sqlalchemy.ext.hybrid import hybrid_property
from ..database.connection import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(50), nullable=False)
    symbol = Column(String(20), nullable=False)
    is_base_unit = Column(Boolean, default=True)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_code = Column(String(100), nullable=True, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    product_type = Column(String(50), default="simple", nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="SET NULL"), nullable=True)
    hsn_code = Column(String(50), nullable=True)
    status = Column(String(50), default="active", nullable=False, index=True)  # active, draft, inactive, deleted
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True, index=True)

    # Core Relationships
    store = relationship("Store", back_populates="products")
    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    unit_rel = relationship("Unit")

    pricing = relationship("ProductPricing", back_populates="product", uselist=False, cascade="all, delete-orphan")
    inventory_record = relationship("ProductInventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("ProductAlert", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    batches = relationship("ProductBatch", back_populates="product", cascade="all, delete-orphan")
    serial_numbers = relationship("ProductSerialNumber", back_populates="product", cascade="all, delete-orphan")
    stock_records = relationship("ProductStock", back_populates="product", cascade="all, delete-orphan")
    stock_adjustments = relationship("StockAdjustment", back_populates="product", cascade="all, delete-orphan")

    # Store-Specific Detail Relationships (1:1)
    grocery_details = relationship("ProductGroceryDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    clothing_details = relationship("ProductClothingDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    medicine_details = relationship("ProductMedicineDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    electronics_details = relationship("ProductElectronicsDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    plastic_details = relationship("ProductPlasticDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    handloom_details = relationship("ProductHandloomDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    furniture_details = relationship("ProductFurnitureDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")
    agro_details = relationship("ProductAgroDetail", back_populates="product", uselist=False, cascade="all, delete-orphan")

    # Backward compatibility synonyms and helper properties
    name = synonym("product_name")

    @hybrid_property
    def is_active(self) -> bool:
        return self.status == "active" and self.deleted_at is None

    @is_active.setter
    def is_active(self, val: bool):
        self.status = "active" if val else "inactive"

    @is_active.expression
    def is_active(cls):
        return and_(cls.status == "active", cls.deleted_at.is_(None))

    @property
    def selling_price(self) -> float:
        if self.pricing and self.pricing.selling_price is not None:
            return float(self.pricing.selling_price)
        return 0.0

    @property
    def purchase_price(self) -> float:
        if self.pricing and self.pricing.purchase_price is not None:
            return float(self.pricing.purchase_price)
        return 0.0

    @property
    def mrp(self) -> float:
        if self.pricing and self.pricing.mrp is not None:
            return float(self.pricing.mrp)
        return None

    @property
    def current_stock(self) -> float:
        if self.inventory_record and self.inventory_record.current_stock is not None:
            return float(self.inventory_record.current_stock)
        return 0.0

    @property
    def min_stock_level(self) -> float:
        if self.inventory_record and self.inventory_record.minimum_stock is not None:
            return float(self.inventory_record.minimum_stock)
        return 5.0

    @property
    def unit(self) -> str:
        if self.unit_rel:
            return self.unit_rel.symbol
        return "pcs"

    @property
    def has_variants(self) -> bool:
        return bool(self.variants and len(self.variants) > 0)

    @property
    def image_url(self) -> str:
        if self.images:
            for img in self.images:
                if img.is_primary:
                    return img.image_url
            return self.images[0].image_url
        return None

    @property
    def inventory(self):
        """Mock inventory object with .quantity for POS and bill routes compatibility."""
        class _StockStub:
            def __init__(self, qty):
                self.quantity = qty
        return _StockStub(self.current_stock)

    def get_store_details_dict(self) -> dict:
        """Returns store-specific detail fields as a flat dict."""
        for rel in [
            self.grocery_details,
            self.clothing_details,
            self.medicine_details,
            self.electronics_details,
            self.plastic_details,
            self.handloom_details,
            self.furniture_details,
            self.agro_details
        ]:
            if rel is not None:
                d = {k: v for k, v in rel.__dict__.items() if not k.startswith("_") and k not in ("id", "store_id", "product_id", "created_at", "updated_at")}
                return d
        return {}


class ProductPricing(Base):
    __tablename__ = "product_pricing"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    mrp = Column(Numeric(12, 2), nullable=True)
    wholesale_price = Column(Numeric(12, 2), nullable=True)
    discount_type = Column(String(50), nullable=True)  # percentage, fixed
    discount_value = Column(Numeric(12, 2), default=Decimal("0.00"))
    tax_type = Column(String(50), default="exclusive", nullable=False)  # inclusive, exclusive, exempt
    gst_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    cgst_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    sgst_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    igst_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    cess_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="pricing")


class ProductInventory(Base):
    __tablename__ = "product_inventory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    opening_stock = Column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    current_stock = Column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    reserved_stock = Column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    minimum_stock = Column(Numeric(12, 3), default=Decimal("5.000"), nullable=False)
    maximum_stock = Column(Numeric(12, 3), nullable=True)
    reorder_level = Column(Numeric(12, 3), default=Decimal("10.000"), nullable=False)
    warehouse_location = Column(String(100), nullable=True)
    last_stock_update = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="inventory_record")


class ProductAlert(Base):
    __tablename__ = "product_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # LOW_STOCK, EXPIRY_WARNING, OUT_OF_STOCK
    threshold_value = Column(Numeric(12, 3), nullable=True)
    alert_days_before = Column(Integer, nullable=True)
    is_enabled = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=False)
    notify_sms = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="alerts")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="images")


ProductImages = ProductImage  # Backward compatibility alias


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    attributes = Column(JSON, default=dict)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    mrp = Column(Numeric(12, 2), nullable=True)
    stock_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="variants")


class ProductBatch(Base):
    __tablename__ = "product_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True, index=True)
    purchase_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    selling_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    mrp = Column(Numeric(12, 2), nullable=True)
    initial_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    current_quantity = Column(Numeric(12, 3), default=Decimal("0.000"))
    supplier_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="batches")


class ProductSerialNumber(Base):
    __tablename__ = "product_serial_numbers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    serial_number = Column(String(100), nullable=False, index=True)
    imei_number = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="available")  # available, sold, defective, returned
    warranty_start_date = Column(DateTime, nullable=True)
    warranty_end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="serial_numbers")


# =========================================================================
# 8 STORE-SPECIFIC DETAIL TABLES
# =========================================================================

class ProductGroceryDetail(Base):
    __tablename__ = "product_grocery_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    food_type = Column(String(50), nullable=True)
    item_type = Column(String(100), nullable=True)
    net_weight = Column(String(50), nullable=True)
    gross_weight = Column(String(50), nullable=True)
    packaging_type = Column(String(100), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    shelf_life_days = Column(Integer, nullable=True)
    is_vegetarian = Column(Boolean, default=True)
    storage_type = Column(String(100), nullable=True)
    nutritional_information = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    fssai_license = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="grocery_details")


class ProductClothingDetail(Base):
    __tablename__ = "product_clothing_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    gender = Column(String(50), nullable=True)
    clothing_type = Column(String(100), nullable=True)
    fabric_type = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    pattern = Column(String(100), nullable=True)
    fit_type = Column(String(100), nullable=True)
    sleeve_type = Column(String(100), nullable=True)
    neck_type = Column(String(100), nullable=True)
    occasion = Column(String(100), nullable=True)
    season = Column(String(100), nullable=True)
    care_instructions = Column(Text, nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    collection_name = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="clothing_details")


class ProductMedicineDetail(Base):
    __tablename__ = "product_medicine_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    medicine_type = Column(String(100), nullable=True)
    salt_composition = Column(Text, nullable=True)
    generic_name = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    prescription_required = Column(Boolean, default=False)
    schedule_type = Column(String(50), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    pack_size = Column(String(100), nullable=True)
    storage_conditions = Column(String(200), nullable=True)
    drug_license_number = Column(String(100), nullable=True)
    therapeutic_category = Column(String(150), nullable=True)
    side_effects = Column(Text, nullable=True)
    usage_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="medicine_details")


class ProductElectronicsDetail(Base):
    __tablename__ = "product_electronics_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    device_type = Column(String(100), nullable=True)
    model_number = Column(String(100), nullable=True)
    model_name = Column(String(150), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    brand_model = Column(String(150), nullable=True)
    color = Column(String(50), nullable=True)
    ram = Column(String(50), nullable=True)
    storage_capacity = Column(String(50), nullable=True)
    processor = Column(String(150), nullable=True)
    screen_size = Column(String(50), nullable=True)
    battery_capacity = Column(String(50), nullable=True)
    connectivity = Column(String(150), nullable=True)
    warranty_months = Column(Integer, nullable=True)
    warranty_type = Column(String(100), nullable=True)
    power_rating = Column(String(50), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="electronics_details")


class ProductPlasticDetail(Base):
    __tablename__ = "product_plastic_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    plastic_type = Column(String(100), nullable=True)
    material_grade = Column(String(100), nullable=True)
    material_type = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    length = Column(String(50), nullable=True)
    width = Column(String(50), nullable=True)
    height = Column(String(50), nullable=True)
    thickness = Column(String(50), nullable=True)
    weight = Column(String(50), nullable=True)
    capacity = Column(String(50), nullable=True)
    capacity_unit = Column(String(50), nullable=True)
    food_grade = Column(Boolean, default=False)
    recyclable = Column(Boolean, default=True)
    usage_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="plastic_details")


class ProductHandloomDetail(Base):
    __tablename__ = "product_handloom_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    fabric_type = Column(String(100), nullable=True)
    weaving_type = Column(String(100), nullable=True)
    craft_type = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    thread_count = Column(String(50), nullable=True)
    design_name = Column(String(150), nullable=True)
    pattern = Column(String(100), nullable=True)
    origin_region = Column(String(150), nullable=True)
    artisan_name = Column(String(150), nullable=True)
    handwoven = Column(Boolean, default=True)
    length = Column(String(50), nullable=True)
    width = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    care_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="handloom_details")


class ProductFurnitureDetail(Base):
    __tablename__ = "product_furniture_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    furniture_type = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    frame_material = Column(String(100), nullable=True)
    finish_type = Column(String(100), nullable=True)
    length = Column(String(50), nullable=True)
    width = Column(String(50), nullable=True)
    height = Column(String(50), nullable=True)
    weight = Column(String(50), nullable=True)
    seating_capacity = Column(Integer, nullable=True)
    assembly_required = Column(Boolean, default=False)
    warranty_months = Column(Integer, nullable=True)
    room_type = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="furniture_details")


class ProductAgroDetail(Base):
    __tablename__ = "product_agro_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    agro_category = Column(String(100), nullable=True)
    product_type = Column(String(100), nullable=True)
    crop_name = Column(String(150), nullable=True)
    seed_variety = Column(String(150), nullable=True)
    brand_name = Column(String(150), nullable=True)
    composition = Column(Text, nullable=True)
    active_ingredient = Column(String(200), nullable=True)
    concentration = Column(String(100), nullable=True)
    application_method = Column(String(150), nullable=True)
    recommended_crop = Column(String(255), nullable=True)
    dosage = Column(String(150), nullable=True)
    pack_size = Column(String(100), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    license_number = Column(String(100), nullable=True)
    safety_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="agro_details")


# =========================================================================
# DYNAMIC CONFIGURATION TABLES
# =========================================================================

class StoreTypeProductField(Base):
    __tablename__ = "store_type_product_fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_type_code = Column(String(50), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_label = Column(String(100), nullable=False)
    field_type = Column(String(50), default="text", nullable=False)  # text, number, select, date, boolean, textarea
    is_required = Column(Boolean, default=False)
    default_value = Column(String(255), nullable=True)
    placeholder = Column(String(255), nullable=True)
    help_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    section = Column(String(50), default="store_details", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    options = relationship("StoreTypeFieldOption", back_populates="field", cascade="all, delete-orphan")


class StoreTypeFieldOption(Base):
    __tablename__ = "store_type_field_options"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    field_id = Column(Integer, ForeignKey("store_type_product_fields.id", ondelete="CASCADE"), nullable=False, index=True)
    option_label = Column(String(100), nullable=False)
    option_value = Column(String(100), nullable=False)
    display_order = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)

    field = relationship("StoreTypeProductField", back_populates="options")


# Backward compatibility stubs for old dynamic schema
class ProductAttribute(Base):
    __tablename__ = "product_attributes"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_label = Column(String(100), nullable=False)
    field_type = Column(String(50), default="text", nullable=False)
    is_required = Column(Boolean, default=False)
    options = Column(JSON, nullable=True)
    default_value = Column(String(255), nullable=True)
    placeholder = Column(String(255), nullable=True)
    help_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    is_variant_field = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    @property
    def category_id(self):
        return self.shop_category_id

    @category_id.setter
    def category_id(self, val):
        self.shop_category_id = val

    shop_category = relationship("ShopCategory", back_populates="attributes")
    values = relationship("ProductAttributeValue", back_populates="attribute")


class ProductAttributeValue(Base):
    __tablename__ = "product_attribute_values"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_id = Column(Integer, ForeignKey("product_attributes.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    attribute = relationship("ProductAttribute", back_populates="values")


class ProductExtraDetail(Base):
    __tablename__ = "product_extra_details"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
