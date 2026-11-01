from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    tax_number = Column(String(100), nullable=True)
    currency = Column(String(10), default="USD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    category = relationship("Category", back_populates="stores")
    owner = relationship("User", back_populates="owned_stores", foreign_keys=[owner_id])
    members = relationship("User", back_populates="store", foreign_keys="User.store_id")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="store", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="store", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="store", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="store", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="store", cascade="all, delete-orphan")

