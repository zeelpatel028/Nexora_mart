import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    store_type = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="owner")  # 'owner', 'manager', 'cashier'
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="SET NULL", use_alter=True, name="fk_users_store_id"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    owned_stores = relationship("Store", back_populates="owner", foreign_keys="Store.owner_id")
    store = relationship("Store", back_populates="members", foreign_keys=[store_id])

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.surname}"
