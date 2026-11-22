"""
Grocery Store Backup Model
"""
import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from ....config.database import Base


class GroceryBackup(Base):
    __tablename__ = "grocery_backups"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    size = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
