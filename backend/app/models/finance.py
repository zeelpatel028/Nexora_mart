import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    reference_type = Column(String(50), nullable=False, index=True)  # 'INVOICE', 'PURCHASE', 'DEBIT_CUSTOMER', 'EXPENSE'
    reference_id = Column(Integer, nullable=True, index=True)
    amount = Column(Float, nullable=False, index=True)
    payment_method = Column(String(50), default="CASH")
    transaction_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    transaction_ref = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # 'Rent', 'Utilities', 'Salaries', etc.
    amount = Column(Float, nullable=False, index=True)
    payment_method = Column(String(50), default="CASH")
    expense_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    description = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="expenses")
