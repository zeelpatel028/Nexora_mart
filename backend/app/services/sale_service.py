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
        date_str: Optional[str] = None,
        start_date_str: Optional[str] = None,
        end_date_str: Optional[str] = None,
        search: Optional[str] = None,
        customer_id: Optional[int] = None,
        payment_status: Optional[str] = None,
        payment_method: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        from sqlalchemy import or_

        query = db.query(Invoice).filter(Invoice.store_id == store_id)

        # Date filtering (Single date e.g. YYYY-MM-DD for "Today" filter)
        if date_str:
            try:
                target_date = datetime.date.fromisoformat(date_str.strip())
                start_dt = datetime.datetime.combine(target_date, datetime.time.min)
                end_dt = datetime.datetime.combine(target_date, datetime.time.max)
                query = query.filter(Invoice.invoice_date >= start_dt, Invoice.invoice_date <= end_dt)
            except Exception:
                pass
        elif start_date_str and end_date_str:
            try:
                s_date = datetime.date.fromisoformat(start_date_str.strip())
                e_date = datetime.date.fromisoformat(end_date_str.strip())
                start_dt = datetime.datetime.combine(s_date, datetime.time.min)
                end_dt = datetime.datetime.combine(e_date, datetime.time.max)
                query = query.filter(Invoice.invoice_date >= start_dt, Invoice.invoice_date <= end_dt)
            except Exception:
                pass

        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
        if payment_status:
            query = query.filter(Invoice.payment_status == payment_status.upper())
        if payment_method:
            query = query.filter(Invoice.payment_method == payment_method.upper())

        # Search by Invoice #, Customer name, or Customer phone
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.outerjoin(Invoice.customer).filter(
                or_(
                    Invoice.invoice_number.ilike(term),
                    Customer.name.ilike(term),
                    Customer.phone.ilike(term)
                )
            )

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
            cust_phone = inv.customer.phone if inv.customer else None
            balance = max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0))
            results.append({
                "id": inv.id,
                "store_id": inv.store_id,
                "customer_id": inv.customer_id,
                "customer_name": cust_name,
                "customer_phone": cust_phone,
                "invoice_number": inv.invoice_number,
                "sale_date": inv.invoice_date,
                "invoice_date": inv.invoice_date,
                "created_at": inv.created_at or inv.invoice_date,
                "subtotal": float(inv.subtotal or 0.0),
                "tax_amount": float(inv.tax_amount or 0.0),
                "discount_amount": float(inv.discount_amount or 0.0),
                "total_amount": float(inv.total_amount or 0.0),
                "paid_amount": float(inv.paid_amount or 0.0),
                "balance_amount": balance,
                "payment_status": inv.payment_status or "PAID",
                "payment_method": inv.payment_method or "CASH",
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
            p_name = prod.name or prod.product_name if prod else f"Product #{it.product_id}"
            items.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": p_name,
                "variant_id": it.variant_id,
                "variant_name": None,
                "batch_number": it.batch_number,
                "quantity": float(it.quantity or 1.0),
                "unit_price": float(it.unit_price or 0.0),
                "discount": float(it.discount or 0.0),
                "total_price": float(it.total_price or 0.0)
            })

        cust_name = inv.customer.name if inv.customer else "Walk-in Customer"
        cust_phone = inv.customer.phone if inv.customer else None
        balance = max(0.0, float(inv.total_amount or 0.0) - float(inv.paid_amount or 0.0))

        return {
            "id": inv.id,
            "store_id": inv.store_id,
            "customer_id": inv.customer_id,
            "customer_name": cust_name,
            "customer_phone": cust_phone,
            "invoice_number": inv.invoice_number,
            "sale_date": inv.invoice_date,
            "invoice_date": inv.invoice_date,
            "created_at": inv.created_at or inv.invoice_date,
            "subtotal": float(inv.subtotal or 0.0),
            "tax_amount": float(inv.tax_amount or 0.0),
            "discount_amount": float(inv.discount_amount or 0.0),
            "total_amount": float(inv.total_amount or 0.0),
            "paid_amount": float(inv.paid_amount or 0.0),
            "balance_amount": balance,
            "payment_status": inv.payment_status or "PAID",
            "payment_method": inv.payment_method or "CASH",
            "notes": inv.notes,
            "items_count": len(items),
            "items": items
        }

    @staticmethod
    def create_sale(db: Session, store: Store, user: User, request: SaleCreate) -> dict:
        if not request.items:
            raise HTTPException(status_code=400, detail="Sale must contain at least one line item.")

        now = datetime.datetime.now(datetime.timezone.utc)
        payment_method = (request.payment_method or "CASH").upper()

        # 1. Resolve or auto-register customer
        customer_id = request.customer_id
        if not customer_id and request.customer_name and request.customer_name.strip():
            existing_cust = None
            if request.customer_phone and request.customer_phone.strip():
                existing_cust = db.query(Customer).filter(
                    Customer.store_id == store.id,
                    Customer.phone == request.customer_phone.strip()
                ).first()
            if existing_cust:
                customer_id = existing_cust.id
            else:
                new_cust = Customer(
                    store_id=store.id,
                    name=request.customer_name.strip(),
                    phone=request.customer_phone.strip() if request.customer_phone else None,
                    balance=0.0,
                    credit_limit=10000.0,
                    is_active=True
                )
                db.add(new_cust)
                db.flush()
                customer_id = new_cust.id

        # If payment is DEBIT_CUSTOMER, customer selection is required
        if payment_method == "DEBIT_CUSTOMER" and not customer_id:
            raise HTTPException(
                status_code=400,
                detail="Debit Customer (Credit / Khata) sale requires selecting or entering a customer name."
            )

        # 2. Generate sequential invoice number via document_sequences
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

            available_qty = stock.quantity if stock else (product.current_stock or 0.0)
            if available_qty < item.quantity and not (store.configuration and store.configuration.allow_negative_stock):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name or product.product_name}'. Available: {available_qty}, Requested: {item.quantity}"
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
        total_amount = max(0.0, round(total_amount, 2))

        # Determine paid amount and payment status
        if payment_method == "DEBIT_CUSTOMER":
            paid_amount = float(request.paid_amount or 0.0)
            if paid_amount >= total_amount and total_amount > 0:
                pay_status = "PAID"
            elif paid_amount > 0:
                pay_status = "PARTIAL"
            else:
                pay_status = "DEBIT"
        else:
            paid_amount = float(request.paid_amount) if request.paid_amount is not None else total_amount
            if paid_amount >= total_amount:
                pay_status = "PAID"
            elif paid_amount > 0:
                pay_status = "PARTIAL"
            else:
                pay_status = "UNPAID"

        # Create Invoice
        invoice = Invoice(
            store_id=store.id,
            customer_id=customer_id,
            invoice_number=invoice_num,
            invoice_date=now,
            subtotal=subtotal,
            tax_amount=request.tax_amount or 0.0,
            discount_amount=request.discount_amount or 0.0,
            total_amount=total_amount,
            paid_amount=paid_amount,
            payment_status=pay_status,
            payment_method=payment_method,
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

            # Synchronize multi-store product_inventory table
            if hasattr(prod, 'inventory_record') and prod.inventory_record:
                from decimal import Decimal
                try:
                    prod.inventory_record.current_stock -= Decimal(str(item_req.quantity))
                    prod.inventory_record.last_stock_update = now
                except Exception:
                    pass

            # Synchronize product current_stock
            if hasattr(prod, 'current_stock') and prod.current_stock is not None:
                try:
                    prod.current_stock = max(0.0, float(prod.current_stock) - float(item_req.quantity))
                except Exception:
                    pass

        # Record Payment if paid_amount > 0
        if paid_amount > 0:
            payment = Payment(
                store_id=store.id,
                reference_type="INVOICE",
                reference_id=invoice.id,
                amount=paid_amount,
                payment_method=payment_method,
                notes=f"Payment for invoice {invoice.invoice_number}"
            )
            db.add(payment)

        # Update customer balance and debit_customers if credit/partial
        unpaid = total_amount - paid_amount
        if customer_id and unpaid > 0:
            cust = db.query(Customer).filter(Customer.id == customer_id, Customer.store_id == store.id).first()
            if cust:
                cust.balance = float(cust.balance or 0.0) + unpaid
                deb = db.query(DebitCustomer).filter(DebitCustomer.customer_id == cust.id, DebitCustomer.store_id == store.id).first()
                if deb:
                    deb.outstanding_balance = float(deb.outstanding_balance or 0.0) + unpaid
                    deb.last_payment_date = now
                else:
                    deb = DebitCustomer(
                        store_id=store.id,
                        customer_id=cust.id,
                        total_credit_limit=float(cust.credit_limit or 10000.0),
                        outstanding_balance=unpaid,
                        last_payment_date=now,
                        status="ACTIVE"
                    )
                    db.add(deb)

        db.commit()
        db.refresh(invoice)
        return SaleService.get_sale_detail(db, store.id, invoice.id)
