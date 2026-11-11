import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Return(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    return_number = Column(String(100), nullable=False, index=True)
    return_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    total_return_amount = Column(Float, default=0.0, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="COMPLETED", index=True)  # 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="returns")
    invoice = relationship("Invoice", back_populates="returns")
    customer = relationship("Customer", back_populates="returns")
    items = relationship("ReturnItem", back_populates="return_order", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="return_order", cascade="all, delete-orphan")


class ReturnItem(Base):
    __tablename__ = "return_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    return_id = Column(Integer, ForeignKey("returns.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_refund_amount = Column(Float, nullable=False)
    condition_note = Column(String(255), nullable=True)

    return_order = relationship("Return", back_populates="items")
    product = relationship("Product")


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    return_id = Column(Integer, ForeignKey("returns.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    refund_number = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    refund_method = Column(String(50), default="CASH")  # 'CASH', 'ORIGINAL_PAYMENT', 'STORE_CREDIT'
    refund_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="refunds")
    return_order = relationship("Return", back_populates="refunds")
    invoice = relationship("Invoice", back_populates="refunds")

