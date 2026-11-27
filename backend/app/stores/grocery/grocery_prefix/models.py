"""
Grocery Prefix and ID Counter Models
"""
import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
from ....config.database import Base


class GroceryPrefix(Base):
    __tablename__ = "grocery_prefixes"
    __table_args__ = (
        UniqueConstraint("store_id", "key", name="uq_grocery_prefixes_store_key"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    key = Column(String(50), nullable=False, index=True)
    prefix_value = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)


class GroceryStorePrefix(Base):
    __tablename__ = "grocery_store_prefixes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_prefix = Column(String(20), default="INV", nullable=False)
    debit_customer_prefix = Column(String(20), default="KHT", nullable=False)
    walk_in_customer_prefix = Column(String(20), default="WLK", nullable=False)
    supplier_prefix = Column(String(20), default="SUP", nullable=False)
    order_prefix = Column(String(20), default="ORD", nullable=False)
    product_prefix = Column(String(20), default="PRD", nullable=False)
    employee_prefix = Column(String(20), default="EMP", nullable=False)
    return_prefix = Column(String(20), default="RTN", nullable=False)
    refund_prefix = Column(String(20), default="RFD", nullable=False)
    expense_prefix = Column(String(20), default="EXP", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)


class GroceryIdCounter(Base):
    __tablename__ = "grocery_id_counters"
    __table_args__ = (
        UniqueConstraint("store_id", "key", name="uq_grocery_id_counters_store_key"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(50), nullable=False, index=True)
    last_number = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
