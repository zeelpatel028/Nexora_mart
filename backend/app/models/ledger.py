import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from ..database.connection import Base


class CustomerLedger(Base):
    """
    Tracks debit/credit ledger transactions for Khata customers.
    """
    __tablename__ = "customer_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)

    transaction_type = Column(String(50), nullable=False, index=True)  # 'SALE', 'PAYMENT', 'RETURN', 'ADJUSTMENT'
    reference_type = Column(String(50), nullable=True)                 # 'INVOICE', 'RECEIPT', 'CREDIT_NOTE'
    reference_id = Column(String(100), nullable=True, index=True)
    debit = Column(Float, default=0.0, nullable=False)                 # Amount charged to customer
    credit = Column(Float, default=0.0, nullable=False)                # Amount received from customer
    balance = Column(Float, default=0.0, nullable=False, index=True)   # Running balance
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store")
    customer = relationship("Customer")


class SupplierLedger(Base):
    """
    Tracks debit/credit ledger transactions for suppliers.
    """
    __tablename__ = "supplier_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)

    transaction_type = Column(String(50), nullable=False, index=True)  # 'PURCHASE', 'PAYMENT', 'RETURN', 'ADJUSTMENT'
    reference_type = Column(String(50), nullable=True)                 # 'PURCHASE_ORDER', 'VOUCHER'
    reference_id = Column(String(100), nullable=True, index=True)
    debit = Column(Float, default=0.0, nullable=False)                 # Amount paid to supplier
    credit = Column(Float, default=0.0, nullable=False)                # Amount owed to supplier (from order)
    balance = Column(Float, default=0.0, nullable=False, index=True)   # Running balance
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store")
    supplier = relationship("Supplier")


from .product import ProductBatch as ProductBatchRecord
from .inventory import StockMovement as StockMovementRecord


class InvoicePayment(Base):
    """
    Tracks multiple payments against a specific invoice.
    """
    __tablename__ = "invoice_payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)

    amount = Column(Float, nullable=False, index=True)
    payment_method = Column(String(50), default="CASH")  # CASH, UPI, CARD, CHEQUE, BANK_TRANSFER
    payment_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store")
    invoice = relationship("Invoice")


class PurchaseOrderPayment(Base):
    """
    Tracks payments made against purchase orders.
    """
    __tablename__ = "purchase_order_payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE"), nullable=False, index=True)

    amount = Column(Float, nullable=False, index=True)
    payment_method = Column(String(50), default="CASH")  # CASH, UPI, BANK_TRANSFER, CHEQUE
    payment_date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    store = relationship("Store")
    purchase = relationship("Purchase")
