import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, synonym
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False, index=True)
    shop_category = Column(String(100), nullable=True)
    store_type = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    plain_password = Column(String(255), nullable=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id"), nullable=True, index=True)
    role = Column(String(50), default="owner", index=True)  # 'owner', 'manager', 'cashier'
    is_active = Column(Boolean, default=True, index=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Aliases
    user_id = synonym("id")
    password_hash = synonym("hashed_password")

    # Relationships
    stores = relationship("Store", back_populates="owner", cascade="all, delete-orphan")
    shop_category_rel = relationship("ShopCategory", foreign_keys=[shop_category_id])
    otps = relationship("PasswordResetOtp", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user")
    employees = relationship("Employee", back_populates="user")
    stock_adjustments = relationship("StockAdjustment", back_populates="user")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.surname}".strip()

    @property
    def name(self) -> str:
        return self.full_name

    @property
    def store_id(self):
        if self.stores:
            return self.stores[0].id
        return None

    @store_id.setter
    def store_id(self, val):
        pass


class PasswordResetOtp(Base):
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False, index=True)
    otp_type = Column(String(50), default="RESET_PASSWORD")
    is_used = Column(Boolean, default=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User", back_populates="otps")
