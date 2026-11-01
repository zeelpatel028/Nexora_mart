from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_number = Column(String(100), nullable=False, index=True)
    purchase_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    total_amount = Column(Float, default=0.0, nullable=False)
    paid_amount = Column(Float, default=0.0)
    payment_status = Column(String(50), default="PAID")  # 'PAID', 'PARTIAL', 'UNPAID'
    payment_method = Column(String(50), default="CASH")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="purchases")
    supplier = relationship("Supplier", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    quantity = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)

    purchase = relationship("Purchase", back_populates="items")

