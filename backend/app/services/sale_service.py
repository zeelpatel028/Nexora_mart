import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.invoice import Invoice, InvoiceItem
from ..models.product import Product
from ..models.inventory import ProductStock, StockAdjustment
from ..models.partner import Customer, DebitCustomer
from ..models.finance import Payment
from ..models.store import Store, DocumentSequence
from ..models.user import User
from ..schemas.sale_schema import SaleCreate
from ..category_rules.rule_registry import CategoryRuleRegistry

class SaleService:
    @staticmethod
    def list_sales(
        db: Session,
        store_id: int,
        customer_id: Optional[int] = None,
        payment_status: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        query = db.query(Invoice).filter(Invoice.store_id == store_id)

        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
        if payment_status:
            query = query.filter(Invoice.payment_status == payment_status.upper())

        total = query.count()
        p_val = getattr(page, 'default', page)
        l_val = getattr(limit, 'default', limit)
        p_int = int(p_val) if isinstance(p_val, (int, float, str)) else 1
        l_int = int(l_val) if isinstance(l_val, (int, float, str)) else 50
        offset = (max(p_int, 1) - 1) * l_int
        invoices = query.order_by(Invoice.id.desc()).offset(offset).limit(l_int).all()

        results = []
        for inv in invoices:
            cust_name = inv.customer.name if inv.customer else "Walk-in Customer"
            results.append({
                "id": inv.id,
                "store_id": inv.store_id,
                "customer_id": inv.customer_id,
                "customer_name": cust_name,
                "invoice_number": inv.invoice_number,
                "sale_date": inv.invoice_date,
                "subtotal": inv.subtotal,
                "tax_amount": inv.tax_amount,
                "discount_amount": inv.discount_amount,
                "total_amount": inv.total_amount,
                "paid_amount": inv.paid_amount,
                "payment_status": inv.payment_status,
                "payment_method": inv.payment_method,
                "notes": inv.notes,
                "items_count": len(inv.items)
            })

        return results, total

    @staticmethod
    def get_sale_detail(db: Session, store_id: int, sale_id: int) -> dict:
        inv = db.query(Invoice).filter(Invoice.id == sale_id, Invoice.store_id == store_id).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Sale invoice not found.")

        items = []
        for it in inv.items:
            prod = db.query(Product).filter(Product.id == it.product_id).first()
            items.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": prod.name if prod else "Unknown Product",
                "variant_id": it.variant_id,
                "variant_name": None,
                "batch_number": it.batch_number,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "discount": it.discount,
                "total_price": it.total_price
            })

        return {
            "id": inv.id,
            "store_id": inv.store_id,
            "customer_id": inv.customer_id,
            "customer_name": inv.customer.name if inv.customer else "Walk-in Customer",
            "invoice_number": inv.invoice_number,
            "sale_date": inv.invoice_date,
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "discount_amount": inv.discount_amount,
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "payment_status": inv.payment_status,
            "payment_method": inv.payment_method,
            "notes": inv.notes,
            "items_count": len(items),
            "items": items
        }

    @staticmethod
    def create_sale(db: Session, store: Store, user: User, request: SaleCreate) -> dict:
        if not request.items:
            raise HTTPException(status_code=400, detail="Sale must contain at least one line item.")

        now = datetime.datetime.now(datetime.timezone.utc)

        # 1. Generate sequential invoice number via document_sequences
        seq = db.query(DocumentSequence).filter(
            DocumentSequence.store_id == store.id,
            DocumentSequence.document_type == "INVOICE"
        ).first()

        if seq:
            invoice_num = f"{seq.prefix}-{seq.next_number:0{seq.padding}d}"
            seq.next_number += 1
        else:
            count = db.query(Invoice).filter(Invoice.store_id == store.id).count() + 1
            invoice_num = request.invoice_number or f"INV-{now.strftime('%Y%m%d')}-{count:04d}"

        subtotal = 0.0
        prepared_items = []
        category_code = store.shop_category.code if store.shop_category else "default"
        category_rule = CategoryRuleRegistry.get_rule_for_category(category_code)

        for item in request.items:
            product = db.query(Product).filter(
                Product.id == item.product_id,
                Product.store_id == store.id,
                Product.is_active == True
            ).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found in this store.")

            stock = db.query(ProductStock).filter(
                ProductStock.store_id == store.id,
                ProductStock.product_id == product.id
            ).first()

            available_qty = stock.quantity if stock else 0.0
            if available_qty < item.quantity and not (store.configuration and store.configuration.allow_negative_stock):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Available: {available_qty}, Requested: {item.quantity}"
                )

            line_total = (item.unit_price * item.quantity) - (item.discount or 0.0)
            subtotal += line_total

            prepared_items.append({
                "product": product,
                "stock": stock,
                "item_data": item,
                "line_total": max(0.0, line_total)
            })

        total_amount = subtotal + (request.tax_amount or 0.0) - (request.discount_amount or 0.0)
        total_amount = max(0.0, total_amount)

        paid_amount = request.paid_amount if request.paid_amount is not None else total_amount
        if paid_amount >= total_amount:
            pay_status = "PAID"
        elif paid_amount > 0:
            pay_status = "PARTIAL"
        else:
            pay_status = "UNPAID"

        # Create Invoice
        invoice = Invoice(
            store_id=store.id,
            customer_id=request.customer_id,
            invoice_number=invoice_num,
            invoice_date=now,
            subtotal=subtotal,
            tax_amount=request.tax_amount or 0.0,
            discount_amount=request.discount_amount or 0.0,
            total_amount=total_amount,
            paid_amount=paid_amount,
            payment_status=pay_status,
            payment_method=request.payment_method.upper(),
            notes=request.notes
        )
        db.add(invoice)
        db.flush()

        # Add line items & adjust stock
        for prep in prepared_items:
            prod = prep["product"]
            stk = prep["stock"]
            item_req = prep["item_data"]

            inv_item = InvoiceItem(
                store_id=store.id,
                invoice_id=invoice.id,
                product_id=prod.id,
                variant_id=item_req.variant_id,
                batch_number=item_req.batch_number or (stk.batch_number if stk else None),
                quantity=item_req.quantity,
                unit_price=item_req.unit_price,
                discount=item_req.discount or 0.0,
                tax_amount=0.0,
                total_price=prep["line_total"]
            )
            db.add(inv_item)

            if stk:
                prev_qty = stk.quantity
                stk.quantity -= item_req.quantity
                # Record Stock Adjustment
                adj = StockAdjustment(
                    store_id=store.id,
                    product_id=prod.id,
                    adjustment_type="SUBTRACT",
                    quantity=item_req.quantity,
                    previous_quantity=prev_qty,
                    new_quantity=stk.quantity,
                    reason=f"Sale Invoice #{invoice.invoice_number}",
                    adjusted_by=user.id
                )
                db.add(adj)

        # Record Payment if paid_amount > 0
        if paid_amount > 0:
            payment = Payment(
                store_id=store.id,
                reference_type="INVOICE",
                reference_id=invoice.id,
                amount=paid_amount,
                payment_method=request.payment_method.upper(),
                notes=f"Payment for invoice {invoice.invoice_number}"
            )
            db.add(payment)

        # Update customer balance and debit_customers if credit/partial
        unpaid = total_amount - paid_amount
        if request.customer_id and unpaid > 0:
            cust = db.query(Customer).filter(Customer.id == request.customer_id, Customer.store_id == store.id).first()
            if cust:
                cust.balance += unpaid
                deb = db.query(DebitCustomer).filter(DebitCustomer.customer_id == cust.id, DebitCustomer.store_id == store.id).first()
                if deb:
                    deb.outstanding_balance += unpaid
                else:
                    deb = DebitCustomer(
                        store_id=store.id,
                        customer_id=cust.id,
                        total_credit_limit=cust.credit_limit or 10000.0,
                        outstanding_balance=unpaid,
                        status="ACTIVE"
                    )
                    db.add(deb)

        db.commit()
        db.refresh(invoice)
        return SaleService.get_sale_detail(db, store.id, invoice.id)
