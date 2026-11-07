import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship, synonym
from ..database.connection import Base

class ShopCategory(Base):
    __tablename__ = "shop_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_system = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    stores = relationship("Store", back_populates="shop_category")
    attributes = relationship("ProductAttribute", back_populates="shop_category")
    product_categories = relationship("ProductCategory", back_populates="shop_category")

    @property
    def fields(self):
        return self.attributes


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_category_id = Column(Integer, ForeignKey("shop_categories.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(50), nullable=True, index=True)
    currency = Column(String(10), default="INR", nullable=False)
    currency_symbol = Column(String(10), default="₹", nullable=False)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Backward compatibility properties
    owner_id = synonym("user_id")
    category_id = synonym("shop_category_id")

    # Relationships
    owner = relationship("User", back_populates="stores", foreign_keys=[user_id])
    shop_category = relationship("ShopCategory", back_populates="stores")

    @property
    def category(self):
        return self.shop_category
    
    owner_details = relationship("StoreOwnerDetails", back_populates="store", uselist=False, cascade="all, delete-orphan")
    addresses = relationship("StoreAddress", back_populates="store", cascade="all, delete-orphan")
    business_details = relationship("StoreBusinessDetails", back_populates="store", uselist=False, cascade="all, delete-orphan")
    configuration = relationship("StoreConfiguration", back_populates="store", uselist=False, cascade="all, delete-orphan")
    sequences = relationship("DocumentSequence", back_populates="store", cascade="all, delete-orphan")

    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    product_categories = relationship("ProductCategory", back_populates="store", cascade="all, delete-orphan")
    product_stock = relationship("ProductStock", back_populates="store", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    debit_customers = relationship("DebitCustomer", back_populates="store", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="store", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="store", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="store", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="store", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="store", cascade="all, delete-orphan")
    returns = relationship("Return", back_populates="store", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="store", cascade="all, delete-orphan")
    stock_adjustments = relationship("StockAdjustment", back_populates="store", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="store")


class StoreOwnerDetails(Base):
    __tablename__ = "store_owner_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    owner_name = Column(String(150), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    pan_number = Column(String(50), nullable=True, index=True)
    aadhaar_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="owner_details")


class StoreAddress(Base):
    __tablename__ = "store_addresses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    postal_code = Column(String(20), nullable=True, index=True)
    is_primary = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="addresses")


class StoreBusinessDetails(Base):
    __tablename__ = "store_business_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    legal_name = Column(String(200), nullable=True)
    business_type = Column(String(100), default="Retail")
    gstin = Column(String(50), nullable=True, index=True)
    trade_license_no = Column(String(100), nullable=True)
    tax_type = Column(String(50), default="GST", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="business_details")


class StoreConfiguration(Base):
    __tablename__ = "store_configurations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    enable_barcode_scanner = Column(Boolean, default=True, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    tax_rate = Column(Float, default=0.0, nullable=False)
    invoice_prefix = Column(String(20), default="INV", nullable=False)
    invoice_footer_note = Column(Text, default="Thank you for shopping with us!")
    allow_negative_stock = Column(Boolean, default=False, nullable=False)
    dark_mode_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="configuration")


class DocumentSequence(Base):
    __tablename__ = "document_sequences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False, index=True)  # 'INVOICE', 'ORDER', 'PURCHASE', 'RETURN', 'REFUND'
    prefix = Column(String(20), nullable=False)
    next_number = Column(Integer, default=1, nullable=False)
    padding = Column(Integer, default=4, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store", back_populates="sequences")
