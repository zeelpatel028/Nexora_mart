import datetime
from decimal import Decimal
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from ..database.connection import Base


class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    store_name = Column(String(200), nullable=False, default="Tulsi Mart")
    allow_negative_stock = Column(Boolean, default=False, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    enable_barcode_scanner = Column(Boolean, default=True, nullable=False)
    tax_inclusive_pricing = Column(Boolean, default=False, nullable=False)
    show_logo_on_invoice = Column(Boolean, default=True, nullable=False)
    auto_print_invoice = Column(Boolean, default=False, nullable=False)
    tax_enabled = Column(Boolean, default=True, nullable=False)
    default_gst_rate = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    prices_include_tax = Column(Boolean, default=False, nullable=False)
    payment_cash_enabled = Column(Boolean, default=True, nullable=False)
    payment_upi_enabled = Column(Boolean, default=True, nullable=False)
    payment_card_enabled = Column(Boolean, default=True, nullable=False)
    security_require_otp = Column(Boolean, default=False, nullable=False)
    security_session_timeout = Column(Integer, default=30, nullable=False)
    home_cash_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    currency_symbol = Column(String(10), nullable=True, default="₹")
    currency_code = Column(String(10), nullable=True, default="INR")
    invoice_prefix = Column(String(30), nullable=True, default="INV")
    theme_mode = Column(String(20), nullable=True, default="light")
    primary_color = Column(String(30), nullable=True, default="#FF6A1A")
    invoice_terms = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="store_settings", uselist=False)
