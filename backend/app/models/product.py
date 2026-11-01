from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    purchase_price = Column(Float, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    mrp = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True, default="piece")
    min_stock_level = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    has_variants = Column(Boolean, default=False)
    attributes = Column(JSON, default=dict)  # Stores dynamic category-specific fields as key-value
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="products")
    category = relationship("Category", back_populates="products")
    product_attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")

    @property
    def inventory(self):
        """Primary or aggregated inventory record for this product."""
        if not self.inventory_items:
            return None
        for inv in self.inventory_items:
            if inv.variant_id is None:
                return inv
        return self.inventory_items[0]


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_value = Column(Text, nullable=True)

    product = relationship("Product", back_populates="product_attributes")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    additional_price = Column(Float, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    attributes = Column(JSON, default=dict)  # e.g. {"size": "XL", "color": "Navy"}
    stock_quantity = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    product = relationship("Product", back_populates="variants")
    inventories = relationship("Inventory", back_populates="variant", cascade="all, delete-orphan")
