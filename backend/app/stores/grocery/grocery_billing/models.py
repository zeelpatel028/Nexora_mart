"""
Grocery Billing and Invoice Models
"""
import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from ....config.database import Base


class GroceryBill(Base):
    __tablename__ = "grocery_bills"
    __table_args__ = (
        Index("ix_grocery_bills_store_cust_pay", "store_id", "customer_id", "payment_status"),
        Index("ix_grocery_bills_store_created", "store_id", "created_at"),
        Index("ix_grocery_bills_store_inv_code", "store_id", "invoice_code"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_code = Column(String(100), nullable=False, index=True)
    customer_type = Column(String(50), nullable=False)  # 'walk_in' | 'khata'
    customer_id = Column(Integer, ForeignKey("grocery_customers.id", ondelete="SET NULL"), nullable=True, index=True)

    walk_in_name = Column(String(255), nullable=True)
    walk_in_phone = Column(String(50), nullable=True)
    walk_in_address = Column(Text, nullable=True)

    subtotal = Column(Float, default=0.0, nullable=False)  # Base price sum without tax
    total_tax = Column(Float, default=0.0, nullable=False)  # GST sum
    discount_amount = Column(Float, default=0.0, nullable=False)
    grand_total = Column(Float, default=0.0, nullable=False)  # Final amount payable
    paid_amount = Column(Float, default=0.0, nullable=False)
    payment_method = Column(String(50), default="CASH", nullable=False)
    idempotency_key = Column(String(120), nullable=True, index=True)

    payment_status = Column(String(50), default="unpaid", nullable=False)  # 'paid' | 'unpaid'
    paid_at = Column(DateTime, nullable=True)
    template_id = Column(String(50), default="modern_orange", nullable=False)
    created_by = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    items = relationship("GroceryBillItem", back_populates="bill", cascade="all, delete-orphan")


class GroceryInvoice(Base):
    __tablename__ = "grocery_invoices"
    __table_args__ = (
        Index("ix_grocery_invoices_store_num", "store_id", "invoice_number"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    bill_id = Column(Integer, ForeignKey("grocery_bills.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("grocery_customers.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_number = Column(String(100), nullable=False, index=True)
    subtotal = Column(Float, default=0.0, nullable=False)
    total_tax = Column(Float, default=0.0, nullable=False)
    grand_total = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(50), default="unpaid", nullable=False)
    template_id = Column(String(50), default="modern_orange", nullable=False)
    invoice_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)


class GroceryBillItem(Base):
    __tablename__ = "grocery_bill_items"
    __table_args__ = (
        Index("ix_grocery_bill_items_store_bill", "store_id", "bill_id"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    bill_id = Column(Integer, ForeignKey("grocery_bills.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="SET NULL"), nullable=True, index=True)

    product_name = Column(String(255), nullable=False)
    price_with_tax = Column(Float, nullable=False)  # Price as edited for THIS bill only
    base_price = Column(Float, nullable=False)  # Price without tax
    gst_rate = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    unit = Column(String(50), default="Piece", nullable=False)
    qty = Column(Float, default=1.0, nullable=False)
    line_total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    bill = relationship("GroceryBill", back_populates="items")
