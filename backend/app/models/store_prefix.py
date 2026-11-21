import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base


class StorePrefix(Base):
    """
    Store-specific custom prefixes for auto-generating unique document and entity IDs.
    Default prefixes follow standard Tulsi Mart accounting formats.
    """
    __tablename__ = "store_prefixes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Document & Entity Prefixes
    invoice_prefix = Column(String(20), default="INV", nullable=False)
    debit_customer_prefix = Column(String(20), default="DC", nullable=False)
    walk_in_customer_prefix = Column(String(20), default="WC", nullable=False)
    supplier_prefix = Column(String(20), default="SUP", nullable=False)
    order_prefix = Column(String(20), default="ORD", nullable=False)
    product_prefix = Column(String(20), default="PRD", nullable=False)
    employee_prefix = Column(String(20), default="EMP", nullable=False)
    return_prefix = Column(String(20), default="RET", nullable=False)
    refund_prefix = Column(String(20), default="REF", nullable=False)
    expense_prefix = Column(String(20), default="EXP", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    store = relationship("Store", back_populates="prefixes")
