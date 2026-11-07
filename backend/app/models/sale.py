"""
Backward compatibility layer mapping legacy Sale / SaleItem references
to the new Invoices and InvoiceItems multi-store database schema.
"""
from .invoice import Invoice, InvoiceItem

Sale = Invoice
SaleItem = InvoiceItem

__all__ = ["Sale", "SaleItem", "Invoice", "InvoiceItem"]
