from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from ..database.connection import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_system = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    fields = relationship("CategoryField", back_populates="category", cascade="all, delete-orphan", order_by="CategoryField.display_order")
    stores = relationship("Store", back_populates="category")
    products = relationship("Product", back_populates="category")


class CategoryField(Base):
    __tablename__ = "category_fields"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    field_label = Column(String(100), nullable=False)
    field_type = Column(String(50), nullable=False)  # 'text', 'number', 'date', 'select', 'boolean'
    is_required = Column(Boolean, default=False)
    options = Column(JSON, nullable=True)  # List of choices if field_type == 'select'
    default_value = Column(String(255), nullable=True)
    placeholder = Column(String(255), nullable=True)
    help_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    is_variant_field = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    category = relationship("Category", back_populates="fields")

