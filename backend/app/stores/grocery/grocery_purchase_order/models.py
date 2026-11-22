"""
Grocery Purchase Order Model
"""
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import synonym
from ....config.database import Base


class GroceryPurchaseOrder(Base):
    __tablename__ = "grocery_purchase_orders"
    __table_args__ = (
        Index("ix_grocery_po_store_code", "store_id", "order_code"),
        Index("ix_grocery_po_store_supp", "store_id", "supplier_id"),
        Index("ix_grocery_po_store_prod", "store_id", "product_id"),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
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
