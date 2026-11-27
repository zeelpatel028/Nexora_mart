"""
Grocery Purchase Order & Order Item Models
"""
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from ....config.database import Base


class GroceryPurchaseOrder(Base):
    __tablename__ = "grocery_purchase_orders"
    __table_args__ = (
        Index("ix_grocery_po_store_code", "store_id", "order_code"),
        Index("ix_grocery_po_store_supp", "store_id", "supplier_id"),
        Index("ix_grocery_po_store_prod", "store_id", "product_id"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    order_code = Column(String(100), nullable=False, index=True)
    order_number = Column(String(100), nullable=True)
    supplier_id = Column(Integer, ForeignKey("grocery_suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="SET NULL"), nullable=True, index=True)

    qty = Column(Float, nullable=False)
    unit = Column(String(50), default="Piece", nullable=False)
    purchase_price = Column(Float, nullable=False)  # For THIS order only - never updates product table
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0, nullable=True)
    expected_delivery_date = Column(DateTime, nullable=True)

    status = Column(String(50), default="placed", nullable=False)  # 'placed' | 'received'
    received_at = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)

    payment_status = Column(String(50), default="pending", nullable=False)  # 'pending' | 'paid'
    paid_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)


class GroceryOrder(Base):
    __tablename__ = "grocery_orders"
    __table_args__ = (
        Index("ix_grocery_orders_store_code", "store_id", "order_code"),
        Index("ix_grocery_orders_store_supp", "store_id", "supplier_id"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    order_code = Column(String(100), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("grocery_suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    total_amount = Column(Float, default=0.0, nullable=False)
    paid_amount = Column(Float, default=0.0, nullable=False)
    expected_delivery_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="placed", nullable=False)
    payment_status = Column(String(50), default="pending", nullable=False)
    received_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    items = relationship("GroceryOrderItem", back_populates="order", cascade="all, delete-orphan")


class GroceryOrderItem(Base):
    __tablename__ = "grocery_order_items"
    __table_args__ = (
        Index("ix_grocery_order_items_store_ord", "store_id", "order_id"),
        {"extend_existing": True},
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("grocery_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("grocery_products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(255), nullable=False)
    ordered_qty = Column(Float, nullable=False)
    received_qty = Column(Float, default=0.0, nullable=False)
    unit = Column(String(50), default="Piece", nullable=False)
    purchase_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    order = relationship("GroceryOrder", back_populates="items")
