"""
Grocery Supplier Model
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index
from ....config.database import Base


class GrocerySupplier(Base):
    __tablename__ = "grocery_suppliers"
    __table_args__ = (
        Index("ix_grocery_suppliers_store_code", "store_id", "supplier_code"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_code = Column(String(100), nullable=False, index=True)
    store_name = Column(String(255), nullable=False)
    seller_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    
    # Optional Banking fields
    bank_name = Column(String(100), nullable=True)
    account_holder = Column(String(100), nullable=True)
    account_number = Column(String(100), nullable=True)
    ifsc = Column(String(50), nullable=True)
    upi_id = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
