import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database.connection import Base

class ProductStock(Base):
    __tablename__ = "product_stock"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(Integer, nullable=True, index=True)
    quantity = Column(Float, default=0.0, nullable=False, index=True)
    reorder_level = Column(Float, default=5.0, nullable=False)
    batch_number = Column(String(100), nullable=True, index=True)
    expiry_date = Column(DateTime, nullable=True, index=True)
    location = Column(String(100), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="product_stock")
    product = relationship("Product", back_populates="stock_records")


class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    adjustment_type = Column(String(50), default="ADJUSTMENT", nullable=False, index=True)  # 'ADD', 'SUBTRACT', 'DAMAGE', 'EXPIRED', 'INVENTORY_COUNT'
    quantity = Column(Float, default=0.0, nullable=False)
    previous_quantity = Column(Float, default=0.0, nullable=False)
    new_quantity = Column(Float, default=0.0, nullable=False)
    reason = Column(Text, nullable=True)
    adjusted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    adjustment_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Compatibility properties for legacy StockMovement
    @property
    def movement_type(self):
        return self.adjustment_type

    @movement_type.setter
    def movement_type(self, val):
        self.adjustment_type = val

    @property
    def notes(self):
        return self.reason

    @notes.setter
    def notes(self, val):
        self.reason = val

    @property
    def performed_by(self):
        return self.adjusted_by

    @performed_by.setter
    def performed_by(self, val):
        self.adjusted_by = val

    store = relationship("Store", back_populates="stock_adjustments")
    product = relationship("Product", back_populates="stock_adjustments")
    user = relationship("User", back_populates="stock_adjustments")


# Compatibility aliases
Inventory = ProductStock
StockMovement = StockAdjustment

__all__ = ["ProductStock", "StockAdjustment", "Inventory", "StockMovement"]
