import datetime
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.invoice import Invoice, InvoiceItem
from ..models.product import Product
from ..models.inventory import Inventory, ProductStock
from ..models.partner import Customer, DebitCustomer
from ..models.ledger import CustomerLedger, StockMovementRecord, InvoicePayment
from ..models.store import Store
from ..models.user import User
from ..services.prefix_service import PrefixService
from ..schemas.invoice_schema import InvoiceCreate


class BillingService:
    """
    High-performance, transaction-safe billing service:
    - Calculates GST according to Indian GST standards (Inclusive / Exclusive)
    - Supports Walk-in Customers and Khata Credit Customers
    - Allows bill-time custom unit prices without modifying master catalog prices
    - Performs atomic stock deduction with concurrency safeguards
    - Synchronizes customer Khata ledgers and generates compliant invoice sequences
    """

    @classmethod
    def calculate_gst_breakdown(cls, total_selling_price: float, gst_rate: float) -> Tuple[float, float]:
        """
        Calculates taxable base amount and total GST amount from GST-inclusive selling price:
        Taxable Amount = Selling Price / (1 + GST Rate / 100)
        GST Amount = Selling Price - Taxable Amount
        """
        if gst_rate <= 0:
            return round(total_selling_price, 2), 0.0
        taxable = total_selling_price / (1.0 + (gst_rate / 100.0))
        gst = total_selling_price - taxable
        return round(taxable, 2), round(gst, 2)

    @classmethod
    def make_bill(
        cls,
        db: Session,
        store: Store,
        user: User,
        data: InvoiceCreate
    ) -> Dict[str, Any]:
        """
        Generates and saves customer bill in a single atomic database transaction.
        """
        if not data.items:
            raise HTTPException(status_code=400, detail="Cannot generate bill with empty item list.")

        # 1. Generate unique invoice number
        invoice_number = PrefixService.generate_id(db, store.id, "invoice")

        # 2. Check Customer & Khata status
        customer = None
        if data.customer_id:
            customer = db.query(Customer).filter(
                Customer.id == data.customer_id,
                Customer.store_id == store.id
            ).first()

        customer_name = customer.name if customer else (data.customer_name or "Walk-in Customer")
        customer_phone = customer.phone if customer else (data.customer_phone or "")

        # 3. Process items and calculate totals
        total_taxable = 0.0
        total_gst = 0.0
        subtotal = 0.0
        processed_items = []

        for item_data in data.items:
            product = db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.store_id == store.id
            ).with_for_update().first()

            if not product:
                raise HTTPException(status_code=404, detail=f"Product '{item_data.product_id}' not found.")

            # Validate and decrement stock
            current_qty = product.current_stock or 0.0
            if current_qty < item_data.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Available: {current_qty}, Requested: {item_data.quantity}"
                )

            # Atomic Stock update on Product
            prev_stock = current_qty
            product.current_stock = max(0.0, current_qty - item_data.quantity)

            # Update Inventory table
            inv = db.query(Inventory).filter(
                Inventory.store_id == store.id,
                Inventory.product_id == product.id
            ).first()
            if inv:
                inv.quantity = max(0.0, inv.quantity - item_data.quantity)

            # Record stock movement audit log
            movement = StockMovementRecord(
                store_id=store.id,
                product_id=product.id,
                adjustment_type="SALE",
                quantity=item_data.quantity,
                reason=f"Invoice #{invoice_number} sold to {customer_name}",
                adjusted_by=user.id
            )
            db.add(movement)

            # Calculate item line totals
            line_total = item_data.quantity * item_data.selling_price
            subtotal += line_total
            taxable, gst = cls.calculate_gst_breakdown(line_total, item_data.gst_rate or 0.0)
            total_taxable += taxable
            total_gst += gst

            processed_items.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "quantity": item_data.quantity,
                "unit": item_data.unit or product.unit or "Piece",
                "selling_price": item_data.selling_price,
                "gst_rate": item_data.gst_rate or 0.0,
                "taxable_amount": taxable,
                "gst_amount": gst,
                "total_amount": line_total
            })

        # Apply discount
        discount = data.discount_amount or 0.0
        grand_total = max(0.0, subtotal - discount)
        paid_amount = min(grand_total, max(0.0, data.paid_amount or 0.0))
        pending_amount = max(0.0, grand_total - paid_amount)

        # Determine payment status
        if paid_amount >= grand_total:
            payment_status = "PAID"
        elif paid_amount > 0:
            payment_status = "PARTIAL"
        else:
            payment_status = "UNPAID"

        # 4. Save Invoice
        invoice = Invoice(
            store_id=store.id,
            customer_id=customer.id if customer else None,
            invoice_number=invoice_number,
            invoice_date=datetime.datetime.now(datetime.timezone.utc),
            subtotal=round(subtotal, 2),
            tax_amount=round(total_gst, 2),
            discount_amount=round(discount, 2),
            total_amount=round(grand_total, 2),
            paid_amount=round(paid_amount, 2),
            payment_status=payment_status,
            payment_method=data.payment_method or "CASH",
            notes=f"TYPE:{data.customer_type} | Customer: {customer_name} | {data.notes or ''}",
        )
        db.add(invoice)
        db.flush()

        # 5. Save Invoice Items
        for it in processed_items:
            inv_item = InvoiceItem(
                store_id=store.id,
                invoice_id=invoice.id,
                product_id=it["product_id"],
                quantity=it["quantity"],
                unit_price=it["selling_price"],
                discount=0.0,
                tax_amount=it["gst_amount"],
                total_price=it["total_amount"]
            )
            db.add(inv_item)

        # 6. Save Payment entry
        if paid_amount > 0:
            payment_rec = InvoicePayment(
                store_id=store.id,
                invoice_id=invoice.id,
                amount=paid_amount,
                payment_method=data.payment_method or "CASH",
                payment_date=datetime.datetime.now(datetime.timezone.utc),
                notes=f"Initial payment for {invoice_number}"
            )
            db.add(payment_rec)

        # 7. Update Customer Ledger if Khata Customer
        if customer and (data.customer_type == "KHATA" or pending_amount > 0):
            # Customer balance increases by unpaid portion
            customer.balance = (customer.balance or 0.0) + pending_amount
            ledger_entry = CustomerLedger(
                store_id=store.id,
                customer_id=customer.id,
                transaction_type="SALE",
                reference_type="INVOICE",
                reference_id=invoice_number,
                debit=grand_total,
                credit=paid_amount,
                balance=customer.balance,
                description=f"Bill #{invoice_number} (Paid: ₹{paid_amount:,.2f}, Pending: ₹{pending_amount:,.2f})"
            )
            db.add(ledger_entry)

        db.commit()
        db.refresh(invoice)

        # Store branding for invoice template
        owner_name = store.owner.first_name if store.owner else ""
        address = store.addresses[0].address_line1 if store.addresses else ""
        phone = store.owner.phone if store.owner else ""

        return {
            "success": True,
            "message": f"Bill {invoice_number} generated successfully.",
            "invoice_id": invoice.id,
            "invoice_number": invoice_number,
            "invoice_date": invoice.invoice_date.isoformat(),
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "store_name": store.name,
            "store_address": address,
            "store_phone": phone,
            "store_gst": store.business_details.gst_number if store.business_details else None,
            "subtotal": round(subtotal, 2),
            "taxable_amount": round(total_taxable, 2),
            "gst_amount": round(total_gst, 2),
            "discount_amount": round(discount, 2),
            "grand_total": round(grand_total, 2),
            "paid_amount": round(paid_amount, 2),
            "pending_amount": round(pending_amount, 2),
            "payment_status": payment_status,
            "payment_method": data.payment_method,
            "items": processed_items
        }

    @classmethod
    def get_invoice_detail(cls, db: Session, store_id: int, invoice_id: int) -> Dict[str, Any]:
        """Fetch complete invoice data formatted for printable templates & PDF sharing."""
        invoice = db.query(Invoice).filter(
            Invoice.id == invoice_id,
            Invoice.store_id == store_id
        ).first()

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found.")

        store = invoice.store
        cust = invoice.customer
        cust_name = cust.name if cust else "Walk-in Customer"
        cust_phone = cust.phone if cust else ""
        if invoice.notes and "Customer: " in invoice.notes:
            try:
                cust_name = invoice.notes.split("Customer: ")[1].split(" |")[0]
            except Exception:
                pass

        items_data = []
        for it in invoice.items:
            prod_name = it.product.name if it.product else "Item"
            unit = it.product.unit if it.product and it.product.unit else "Piece"
            line_total = it.total_price
            taxable, gst = cls.calculate_gst_breakdown(line_total, 0.0)

            items_data.append({
                "id": it.id,
                "product_id": str(it.product_id),
                "product_name": prod_name,
                "quantity": it.quantity,
                "unit": unit,
                "selling_price": it.unit_price,
                "gst_rate": 0.0,
                "taxable_amount": taxable,
                "gst_amount": it.tax_amount or 0.0,
                "total_amount": line_total
            })

        address = store.addresses[0].address_line1 if store.addresses else ""
        phone = store.owner.phone if store.owner else ""

        return {
            "id": invoice.id,
            "store_id": invoice.store_id,
            "invoice_number": invoice.invoice_number,
            "invoice_date": invoice.invoice_date,
            "customer_id": invoice.customer_id,
            "customer_type": "KHATA" if invoice.customer_id else "WALK_IN",
            "customer_name": cust_name,
            "customer_phone": cust_phone,
            "store_name": store.name,
            "store_address": address,
            "store_phone": phone,
            "store_gst": store.business_details.gst_number if store.business_details else None,
            "subtotal": invoice.subtotal,
            "taxable_amount": max(0.0, invoice.subtotal - invoice.tax_amount),
            "gst_amount": invoice.tax_amount,
            "discount_amount": invoice.discount_amount,
            "total_amount": invoice.total_amount,
            "paid_amount": invoice.paid_amount,
            "pending_amount": max(0.0, invoice.total_amount - invoice.paid_amount),
            "payment_status": invoice.payment_status,
            "payment_method": invoice.payment_method,
            "notes": invoice.notes,
            "items": items_data
        }
