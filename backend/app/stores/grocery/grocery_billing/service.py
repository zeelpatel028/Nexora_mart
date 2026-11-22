import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_
from fastapi import HTTPException, status
from .models import GroceryBill, GroceryBillItem
from .schemas import MakeBillRequest
from .cache import invalidate_billing_cache
from ..grocery_product.models import GroceryProduct, GroceryStockMovement
from ..grocery_khata_customer.models import GroceryCustomer
from ....models.store import Store
from ....utils.id_generator import generate_next_id
from ....utils.pdf import generate_invoice_pdf


class GroceryBillingService:
    @staticmethod
    def make_bill(db: Session, store: Store, user_id: int, data: MakeBillRequest) -> dict:
        if not data.items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one item is required.")

        cust_type = data.customer_type.lower().strip()
        customer = None
        if cust_type == "khata":
            if not data.customer_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Khata customer ID is required.")
            customer = db.query(GroceryCustomer).filter(
                GroceryCustomer.id == data.customer_id,
                GroceryCustomer.store_id == store.id,
                GroceryCustomer.is_deleted == False
            ).first()
            if not customer:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khata customer not found.")

        # Generate sequential invoice code: S001_INV_0001
        invoice_code = generate_next_id(db, store.id, "invoice")
        now = datetime.datetime.now(datetime.timezone.utc)

        # Single transactional pass
        total_subtotal = 0.0
        total_tax_amount = 0.0
        grand_total_amount = 0.0

        bill_items: List[GroceryBillItem] = []
        stock_movements: List[GroceryStockMovement] = []

        # Fetch all referenced products
        pids = [item.product_id for item in data.items]
        prod_map = {
            p.id: p for p in db.query(GroceryProduct).filter(
                GroceryProduct.id.in_(pids),
                GroceryProduct.store_id == store.id
            ).all()
        }

        for item_in in data.items:
            prod = prod_map.get(item_in.product_id)
            if not prod:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product '{item_in.product_name}' not found."
                )

            # Check stock
            if prod.available_stock < item_in.qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{prod.name}'. Available: {prod.available_stock}, Requested: {item_in.qty}."
                )

            # GST formula: Taxable = PriceWithTax / (1 + GST / 100)
            gst_rate = float(item_in.gst_rate or 0.0)
            unit_price_with_tax = float(item_in.price_with_tax)
            unit_base_price = round(unit_price_with_tax / (1.0 + (gst_rate / 100.0)), 4) if gst_rate > 0 else unit_price_with_tax
            unit_tax_amt = round(unit_price_with_tax - unit_base_price, 4)

            line_tot = round(unit_price_with_tax * item_in.qty, 2)
            line_subtotal = round(unit_base_price * item_in.qty, 2)
            line_tax = round(unit_tax_amt * item_in.qty, 2)

            total_subtotal += line_subtotal
            total_tax_amount += line_tax
            grand_total_amount += line_tot

            # Reduce product stock
            prod.available_stock -= item_in.qty
            prod.updated_at = now

            # Stock movement
            movement = GroceryStockMovement(
                store_id=store.id,
                product_id=prod.id,
                type="sale",
                qty=item_in.qty,
                ref_id=invoice_code
            )
            stock_movements.append(movement)

            # Bill line item - saved ONLY here!
            b_item = GroceryBillItem(
                store_id=store.id,
                product_id=prod.id,
                product_name=item_in.product_name or prod.name,
                price_with_tax=unit_price_with_tax,
                base_price=unit_base_price,
                gst_rate=gst_rate,
                tax_amount=unit_tax_amt,
                unit=item_in.unit or prod.selling_unit,
                qty=item_in.qty,
                line_total=line_tot
            )
            bill_items.append(b_item)

        # Payment status: Walk-in is paid immediately; Khata is unpaid by default
        is_paid = (cust_type == "walk_in")
        payment_status_val = "paid" if is_paid else "unpaid"
        paid_at_val = now if is_paid else None

        bill = GroceryBill(
            store_id=store.id,
            invoice_code=invoice_code,
            customer_type=cust_type,
            customer_id=customer.id if customer else None,
            walk_in_name=data.walk_in_name if cust_type == "walk_in" else None,
            walk_in_phone=data.walk_in_phone if cust_type == "walk_in" else None,
            walk_in_address=data.walk_in_address if cust_type == "walk_in" else None,
            subtotal=round(total_subtotal, 2),
            total_tax=round(total_tax_amount, 2),
            grand_total=round(grand_total_amount, 2),
            payment_status=payment_status_val,
            paid_at=paid_at_val,
            template_id=data.template_id or "modern_orange",
            created_by=user_id
        )

        db.add(bill)
        db.flush()

        for bi in bill_items:
            bi.bill_id = bill.id
            db.add(bi)
        for sm in stock_movements:
            db.add(sm)

        db.commit()
        db.refresh(bill)
        invalidate_billing_cache(store.id)

        return GroceryBillingService.get_invoice_detail(db, store.id, bill.id)

    @staticmethod
    def list_invoices(
        db: Session,
        store_id: int,
        customer_id: Optional[int] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        query = db.query(GroceryBill).filter(
            GroceryBill.store_id == store_id,
            GroceryBill.is_deleted == False
        )

        if customer_id:
            query = query.filter(GroceryBill.customer_id == customer_id)
        if payment_status:
            query = query.filter(GroceryBill.payment_status == payment_status.lower())
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    GroceryBill.invoice_code.ilike(term),
                    GroceryBill.walk_in_name.ilike(term),
                    GroceryBill.walk_in_phone.ilike(term)
                )
            )

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        bills = query.order_by(GroceryBill.id.desc()).offset(offset).limit(limit).all()

        results = []
        for b in bills:
            cust_name = b.walk_in_name or "Walk-in"
            cust_phone = b.walk_in_phone or ""
            if b.customer_id:
                c = db.query(GroceryCustomer).filter(GroceryCustomer.id == b.customer_id).first()
                if c:
                    cust_name = c.name
                    cust_phone = c.phone

            results.append({
                "id": b.id,
                "store_id": b.store_id,
                "invoice_code": b.invoice_code,
                "customer_type": b.customer_type,
                "customer_id": b.customer_id,
                "customer_name": cust_name,
                "customer_phone": cust_phone,
                "subtotal": b.subtotal,
                "total_tax": b.total_tax,
                "grand_total": b.grand_total,
                "payment_status": b.payment_status,
                "paid_at": str(b.paid_at) if b.paid_at else None,
                "template_id": b.template_id,
                "created_at": str(b.created_at)
            })

        return results, total

    @staticmethod
    def get_invoice_detail(db: Session, store_id: int, bill_id: int) -> dict:
        bill = db.query(GroceryBill).options(
            selectinload(GroceryBill.items)
        ).filter(
            GroceryBill.id == bill_id,
            GroceryBill.store_id == store_id,
            GroceryBill.is_deleted == False
        ).first()

        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

        store = db.query(Store).filter(Store.id == store_id).first()
        store_name = store.name if store else "Tulsi Mart"
        store_phone = store.phone if store else ""
        store_address = store.address if store else ""
        store_gst = getattr(store, "gst_number", None) or getattr(store, "tax_number", "N/A")

        cust_name = bill.walk_in_name or "Walk-in Customer"
        cust_phone = bill.walk_in_phone or ""
        cust_addr = bill.walk_in_address or ""

        if bill.customer_id:
            c = db.query(GroceryCustomer).filter(GroceryCustomer.id == bill.customer_id).first()
            if c:
                cust_name = c.name
                cust_phone = c.phone
                cust_addr = c.address or ""

        items_list = []
        for it in bill.items:
            items_list.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product_name,
                "price_with_tax": it.price_with_tax,
                "base_price": it.base_price,
                "gst_rate": it.gst_rate,
                "tax_amount": it.tax_amount,
                "unit": it.unit,
                "qty": it.qty,
                "line_total": it.line_total
            })

        return {
            "id": bill.id,
            "store_id": bill.store_id,
            "invoice_code": bill.invoice_code,
            "store_name": store_name,
            "store_phone": store_phone,
            "store_address": store_address,
            "store_gst": store_gst,
            "customer_type": bill.customer_type,
            "customer_id": bill.customer_id,
            "customer_name": cust_name,
            "customer_phone": cust_phone,
            "customer_address": cust_addr,
            "subtotal": bill.subtotal,
            "total_tax": bill.total_tax,
            "grand_total": bill.grand_total,
            "payment_status": bill.payment_status,
            "paid_at": str(bill.paid_at) if bill.paid_at else None,
            "template_id": bill.template_id,
            "created_at": str(bill.created_at),
            "items": items_list
        }

    @staticmethod
    def generate_pdf(db: Session, store_id: int, bill_id: int) -> bytes:
        data = GroceryBillingService.get_invoice_detail(db, store_id, bill_id)
        return generate_invoice_pdf(data)
