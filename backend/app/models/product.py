import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, synonym
from ..database.connection import Base

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(50), nullable=True, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="product_categories")
    shop_category = relationship("ShopCategory", back_populates="product_categories")
    products = relationship("Product", back_populates="category")


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_label = Column(String(100), nullable=False)
    field_type = Column(String(50), default="text", nullable=False)  # 'text', 'number', 'date', 'select', 'boolean'
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
    values = relationship("ProductAttributeValue", back_populates="attribute", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_category_id = Column(Integer, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    purchase_price = Column(Float, default=0.0, nullable=False)
    selling_price = Column(Float, default=0.0, nullable=False, index=True)
    mrp = Column(Float, nullable=True)
    unit = Column(String(50), default="piece", nullable=False)
    min_stock_level = Column(Integer, default=5, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    has_variants = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    store = relationship("Store", back_populates="products")
    category = relationship("ProductCategory", back_populates="products")
    attribute_values = relationship("ProductAttributeValue", back_populates="product", cascade="all, delete-orphan")
    extra_details = relationship("ProductExtraDetail", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImages", back_populates="product", cascade="all, delete-orphan")
    stock_records = relationship("ProductStock", back_populates="product", cascade="all, delete-orphan")
    stock_adjustments = relationship("StockAdjustment", back_populates="product", cascade="all, delete-orphan")

    # Compatibility properties for existing schemas and routes
    category_id = synonym("shop_category_id")

    @property
    def inventory(self):
        """Aggregate primary stock record for product."""
        if not self.stock_records:
            return None
        return self.stock_records[0]

    @property
    def attributes(self):
        """Map attribute values to dict for json responses."""
        attr_dict = {}
        for val in self.attribute_values:
            if val.attribute:
                attr_dict[val.attribute.field_name] = val.attribute_value
            elif val.attribute_id:
                attr_dict[str(val.attribute_id)] = val.attribute_value
        for detail in self.extra_details:
            if detail.field_name and detail.field_name not in attr_dict:
                attr_dict[detail.field_name] = detail.field_value
        return attr_dict


class ProductExtraDetail(Base):
    __tablename__ = "product_extra_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="extra_details")


class ProductAttributeValue(Base):
    __tablename__ = "product_attribute_values"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_id = Column(Integer, ForeignKey("product_attributes.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="attribute_values")
    attribute = relationship("ProductAttribute", back_populates="values")


class ProductImages(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="images")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(50), nullable=False)
    symbol = Column(String(20), nullable=False)
    is_base_unit = Column(Boolean, default=True)


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    additional_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    attributes = Column(JSON, default=dict)
    stock_quantity = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="variants")


Product.variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")

