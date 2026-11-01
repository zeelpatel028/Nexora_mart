from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=True, index=True)
    quantity = Column(Float, default=0.0, nullable=False)
    reorder_level = Column(Float, default=5.0)
    batch_number = Column(String(100), nullable=True, index=True)
    expiry_date = Column(DateTime, nullable=True, index=True)
    location = Column(String(100), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="inventories")
    product = relationship("Product", back_populates="inventory_items")
    variant = relationship("ProductVariant", back_populates="inventories")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True, index=True)
    movement_type = Column(String(50), nullable=False)  # 'IN', 'OUT', 'ADJUSTMENT', 'SALE', 'PURCHASE', 'RETURN'
    quantity = Column(Float, nullable=False)
    reference_id = Column(Integer, nullable=True)
    reference_type = Column(String(50), nullable=True)
    unit_price = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
