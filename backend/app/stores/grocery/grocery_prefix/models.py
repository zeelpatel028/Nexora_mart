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
    key = Column(String(50), nullable=False, index=True)
    prefix_value = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)


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
