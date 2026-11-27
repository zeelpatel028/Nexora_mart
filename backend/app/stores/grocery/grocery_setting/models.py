"""
Grocery Shop Settings Model
"""
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from ....config.database import Base


class GrocerySetting(Base):
    __tablename__ = "grocery_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    theme = Column(String(50), default="system", nullable=False)  # 'light' | 'dark' | 'system'
    language = Column(String(20), default="en", nullable=False)  # 'en' | 'hi' | 'gu'
    currency_code = Column(String(10), default="INR", nullable=False)
    currency_symbol = Column(String(10), default="₹", nullable=False)

    bill_template_id = Column(String(50), default="modern_orange", nullable=False)
    bill_sound_enabled = Column(Boolean, default=True, nullable=False)
    bill_sound_id = Column(String(50), default="sound_gpay", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
