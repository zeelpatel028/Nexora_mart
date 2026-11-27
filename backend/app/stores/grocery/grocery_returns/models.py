"""Grocery Returns and Refunds SQLAlchemy Models."""
import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from ....config.database import Base


class GroceryReturn(Base):
    __tablename__ = "grocery_returns"
    __table_args__ = (
        Index("ix_grocery_returns_store_bill", "store_id", "bill_id"),
        Index("ix_grocery_returns_store_code", "store_id", "return_code"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    bill_id = Column(Integer, ForeignKey("grocery_bills.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("grocery_customers.id", ondelete="SET NULL"), nullable=True, index=True)
    return_code = Column(String(100), nullable=False, index=True)
    total_return_amount = Column(Float, default=0.0, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="completed", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    refunds = relationship("GroceryRefund", back_populates="return_order", cascade="all, delete-orphan")


class GroceryRefund(Base):
    __tablename__ = "grocery_refunds"
    __table_args__ = (
        Index("ix_grocery_refunds_store_ret", "store_id", "return_id"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    return_id = Column(Integer, ForeignKey("grocery_returns.id", ondelete="CASCADE"), nullable=False, index=True)
    bill_id = Column(Integer, ForeignKey("grocery_bills.id", ondelete="SET NULL"), nullable=True, index=True)
    refund_code = Column(String(100), nullable=False, index=True)
    amount = Column(Float, default=0.0, nullable=False)
    refund_method = Column(String(50), default="CASH", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    return_order = relationship("GroceryReturn", back_populates="refunds")
