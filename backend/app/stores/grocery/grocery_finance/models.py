"""Grocery Expenses and Payments SQLAlchemy Models."""
import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Index
from ....config.database import Base


class GroceryExpense(Base):
    __tablename__ = "grocery_expenses"
    __table_args__ = (
        Index("ix_grocery_expenses_store_date", "store_id", "expense_date"),
        Index("ix_grocery_expenses_store_cat", "store_id", "category"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    expense_code = Column(String(100), nullable=False, index=True)
    category = Column(String(120), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="CASH", nullable=False)
    expense_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    description = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)


class GroceryPayment(Base):
    __tablename__ = "grocery_payments"
    __table_args__ = (
        Index("ix_grocery_payments_store_ref", "store_id", "reference_type", "reference_id"),
        Index("ix_grocery_payments_store_date", "store_id", "payment_date"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reference_type = Column(String(50), nullable=False)  # 'bill' | 'supplier_order' | 'khata' | 'expense' | 'refund'
    reference_id = Column(Integer, nullable=True, index=True)
    reference_code = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="CASH", nullable=False)
    payment_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
