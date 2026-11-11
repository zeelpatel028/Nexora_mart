import uuid
import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    allow_negative_stock = Column(Boolean, default=False, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    enable_barcode_scanner = Column(Boolean, default=True, nullable=False)
    tax_inclusive_pricing = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="store_settings", uselist=False)

