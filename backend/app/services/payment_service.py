import datetime
from typing import Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.partner import Customer, Supplier
from ..models.ledger import CustomerLedger, SupplierLedger, InvoicePayment, PurchaseOrderPayment
from ..models.invoice import Invoice
from ..models.purchase import Purchase
from ..models.store import Store
from ..models.user import User


class PaymentService:
    """
    Handles Khata customer settlements and supplier payment vouchers with running balances.
    """

    @classmethod
    def record_customer_payment(
        cls,
        db: Session,
        store: Store,
        user: User,
        customer_id: int,
        amount: float,
        payment_method: str = "CASH",
        notes: Optional[str] = None,
        invoice_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Receive payment from Khata customer and update their outstanding balance."""
        customer = db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.store_id == store.id
        ).with_for_update().first()

        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found.")

        if amount <= 0:
            raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

        # Update customer balance
        customer.balance = max(0.0, (customer.balance or 0.0) - amount)

        # Record ledger entry
        ledger_entry = CustomerLedger(
            store_id=store.id,
            customer_id=customer.id,
            transaction_type="PAYMENT",
            reference_type="RECEIPT",
            reference_id=f"REC-{datetime.date.today().strftime('%Y%m%d')}-{customer.id}",
            debit=0.0,
            credit=amount,
            balance=customer.balance,
            description=f"Received payment via {payment_method}. {notes or ''}"
        )
        db.add(ledger_entry)

        # If allocated to a specific invoice, update that invoice
        if invoice_id:
            inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.store_id == store.id).first()
            if inv:
                inv.paid_amount = (inv.paid_amount or 0.0) + amount
                if inv.paid_amount >= inv.total_amount:
                    inv.payment_status = "PAID"
                else:
                    inv.payment_status = "PARTIAL"

                inv_pay = InvoicePayment(
                    store_id=store.id,
                    invoice_id=inv.id,
                    amount=amount,
                    payment_method=payment_method,
                    payment_date=datetime.datetime.now(datetime.timezone.utc),
                    notes=notes
                )
                db.add(inv_pay)

        db.commit()
        db.refresh(customer)

        return {
            "success": True,
            "message": f"Payment of ₹{amount:,.2f} recorded for {customer.name}.",
            "customer_id": customer.id,
            "new_balance": customer.balance,
            "amount_paid": amount
        }

    @classmethod
    def record_supplier_payment(
        cls,
        db: Session,
        store: Store,
        user: User,
        supplier_id: int,
        amount: float,
        payment_method: str = "CASH",
        notes: Optional[str] = None,
        purchase_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Pay supplier and reduce pending payable balance."""
        supplier = db.query(Supplier).filter(
            Supplier.id == supplier_id,
            Supplier.store_id == store.id
        ).with_for_update().first()

        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found.")

        if amount <= 0:
            raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

        supplier.balance = max(0.0, (supplier.balance or 0.0) - amount)

        ledger_entry = SupplierLedger(
            store_id=store.id,
            supplier_id=supplier.id,
            transaction_type="PAYMENT",
            reference_type="VOUCHER",
            reference_id=f"VOUCHER-{datetime.date.today().strftime('%Y%m%d')}-{supplier.id}",
            debit=amount,
            credit=0.0,
            balance=supplier.balance,
            description=f"Paid to supplier via {payment_method}. {notes or ''}"
        )
        db.add(ledger_entry)

        if purchase_id:
            purchase = db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.store_id == store.id).first()
            if purchase:
                purchase.paid_amount = (purchase.paid_amount or 0.0) + amount
                if purchase.paid_amount >= purchase.total_amount:
                    purchase.payment_status = "Paid"
                else:
                    purchase.payment_status = "Partially Paid"

                po_pay = PurchaseOrderPayment(
                    store_id=store.id,
                    purchase_order_id=purchase.id,
                    amount=amount,
                    payment_method=payment_method,
                    payment_date=datetime.datetime.now(datetime.timezone.utc),
                    notes=notes
                )
                db.add(po_pay)

        db.commit()
        db.refresh(supplier)

        return {
            "success": True,
            "message": f"Payment of ₹{amount:,.2f} recorded for {supplier.name}.",
            "supplier_id": supplier.id,
            "new_balance": supplier.balance,
            "amount_paid": amount
        }
