"""
Grocery Khata Customer Model
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index
from ....config.database import Base


class GroceryCustomer(Base):
    __tablename__ = "grocery_customers"
    __table_args__ = (
        Index("ix_grocery_customers_store_code", "store_id", "customer_code"),
        Index("ix_grocery_customers_store_name", "store_id", "name"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_code = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    address = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
