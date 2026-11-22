"""
Grocery Product, Batch, and Stock Movement Models
"""
import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship, synonym
from ....config.database import Base


class GroceryProduct(Base):
    __tablename__ = "grocery_products"
    __table_args__ = (
        Index("ix_grocery_products_store_name", "store_id", "name"),
        Index("ix_grocery_products_store_code", "store_id", "product_code"),
        Index("ix_grocery_products_store_supplier", "store_id", "supplier_id"),
        {"extend_existing": True}
    )

    # In database schema and production migrations, id is VARCHAR(36) UUID string
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_code = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    product_name = Column(String(255), nullable=True)
    supplier_id = Column(Integer, ForeignKey("grocery_suppliers.id", ondelete="SET NULL"), nullable=True, index=True)

    # Purchase specifics
    purchase_price_with_tax = Column(Float, default=0.0, nullable=False)
    purchase_gst_rate = Column(Float, default=0.0, nullable=False)
    purchase_unit = Column(String(50), default="Piece", nullable=False)

    # Selling specifics
    selling_price_with_tax = Column(Float, default=0.0, nullable=False)
    selling_unit = Column(String(50), default="Piece", nullable=False)
    selling_gst_rate = Column(Float, default=0.0, nullable=False)

    # Stock & Alerts
    available_stock = Column(Float, default=0.0, nullable=False)
    low_stock_enabled = Column(Boolean, default=False, nullable=False)
    low_stock_qty = Column(Float, default=5.0, nullable=False)
    expiry_alert_enabled = Column(Boolean, default=False, nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    batches = relationship(lambda: GroceryProductBatch, back_populates="product", cascade="all, delete-orphan")


class GroceryProductBatch(Base):
    __tablename__ = "grocery_product_batches"
    __table_args__ = (
        Index("ix_grocery_batches_store_product", "store_id", "product_id"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_order_id = Column(Integer, nullable=True, index=True)
    qty = Column(Float, nullable=False)
    remaining_qty = Column(Float, nullable=False)
    expiry_date = Column(DateTime, nullable=True, index=True)
    received_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    product = relationship(lambda: GroceryProduct, back_populates="batches")


class GroceryStockMovement(Base):
    __tablename__ = "grocery_stock_movements"
    __table_args__ = (
        Index("ix_grocery_stock_movements_store_prod", "store_id", "product_id"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # 'order_received' | 'sale' | 'adjust'
    qty = Column(Float, nullable=False)
    ref_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
