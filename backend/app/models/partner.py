from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(50), nullable=True, index=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    credit_limit = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="customers")
    sales = relationship("Sale", back_populates="customer")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    company_name = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True, index=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="suppliers")
    purchases = relationship("Purchase", back_populates="supplier")

