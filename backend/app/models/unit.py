from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from ..database.connection import Base

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(50), nullable=False)
    symbol = Column(String(20), nullable=False)
    is_base_unit = Column(Boolean, default=True)

