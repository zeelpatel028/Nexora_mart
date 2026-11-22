"""
Grocery Lookup Models: GST Rates and Measurement Units
"""
from sqlalchemy import Column, Integer, String, Float
from ....config.database import Base


class GroceryGSTRate(Base):
    __tablename__ = "grocery_gst_rates"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    rate = Column(Float, nullable=False, unique=True)


class GroceryUnit(Base):
    __tablename__ = "grocery_units"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    short_name = Column(String(20), nullable=False)
