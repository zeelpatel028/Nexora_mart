import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.return_order import Return, ReturnItem, Refund
from ..models.invoice import Invoice, InvoiceItem
from ..models.product import Product
from ..models.inventory import ProductStock, StockAdjustment
from ..models.store import Store, DocumentSequence
from ..models.user import User

class ReturnService:
    @staticmethod
    def list_returns(db: Session, store_id: int, page: int = 1, limit: int = 50) -> Tuple[List[dict], int]:
        query = db.query(Return).filter(Return.store_id == store_id)
        total = query.count()
        offset = (max(page, 1) - 1) * limit
        returns = query.order_by(Return.id.desc()).offset(offset).limit(limit).all()

        results = []
        for ret in returns:
            results.append({
                "id": ret.id,
                "store_id": ret.store_id,
                "invoice_id": ret.invoice_id,
                "customer_id": ret.customer_id,
                "customer_name": ret.customer.name if ret.customer else "Walk-in Customer",
                "return_number": ret.return_number,
                "return_date": ret.return_date,
                "total_return_amount": ret.total_return_amount,
                "reason": ret.reason,
                "status": ret.status,
                "items_count": len(ret.items)
            })
        return results, total

    @staticmethod
    def get_return_detail(db: Session, store_id: int, return_id: int) -> dict:
        ret = db.query(Return).filter(Return.id == return_id, Return.store_id == store_id).first()
        if not ret:
            raise HTTPException(status_code=404, detail="Return record not found.")

        items = []
        for item in ret.items:
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Unknown Product",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_refund_amount": item.total_refund_amount,
                "condition_note": item.condition_note
            })

        return {
            "id": ret.id,
            "store_id": ret.store_id,
            "invoice_id": ret.invoice_id,
            "customer_id": ret.customer_id,
            "customer_name": ret.customer.name if ret.customer else "Walk-in Customer",
            "return_number": ret.return_number,
            "return_date": ret.return_date,
            "total_return_amount": ret.total_return_amount,
            "reason": ret.reason,
            "status": ret.status,
            "items": items
        }

    @staticmethod
    def process_return(
        db: Session,
        store: Store,
        user: User,
        invoice_id: int,
        items: List[dict],
        reason: Optional[str] = None,
        refund_method: str = "CASH"
    ) -> dict:
        """
        Processes an eligible sales return, restores product stock and inventory,
        creates StockAdjustment audit logs, issues refund, and saves to database.
        """
        if not items:
            raise HTTPException(status_code=400, detail="Return must contain at least one item.")

        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.store_id == store.id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Original invoice not found in this store.")

        now = datetime.datetime.now(datetime.timezone.utc)

        # Generate return document sequence number
        seq = db.query(DocumentSequence).filter(
            DocumentSequence.store_id == store.id,
            DocumentSequence.document_type == "RETURN"
        ).first()
        if seq:
            ret_num = f"{seq.prefix}-{seq.next_number:0{seq.padding}d}"
            seq.next_number += 1
        else:
            count = db.query(Return).filter(Return.store_id == store.id).count() + 1
            ret_num = f"RET-STR{store.id:03d}-{count:06d}"

        total_return_amount = 0.0
        prepared_return_items = []

        for it in items:
            p_id = it.get("product_id")
            qty = float(it.get("quantity", 0))
            if qty <= 0:
                raise HTTPException(status_code=400, detail=f"Invalid return quantity {qty} for product.")

            prod = db.query(Product).filter(Product.id == p_id, Product.store_id == store.id).first()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Product '{p_id}' not found in this store.")

            unit_price = float(it.get("unit_price") or prod.selling_price)
            line_refund = unit_price * qty
            total_return_amount += line_refund

            prepared_return_items.append({
                "product": prod,
                "quantity": qty,
                "unit_price": unit_price,
                "total_refund": line_refund,
                "condition_note": it.get("condition_note")
            })

        # Create Return record
        ret_order = Return(
            store_id=store.id,
            invoice_id=invoice.id,
            customer_id=invoice.customer_id,
            return_number=ret_num,
            return_date=now,
            total_return_amount=total_return_amount,
            reason=reason or "Customer Return",
            status="COMPLETED"
        )
        db.add(ret_order)
        db.flush()

        # Add line items & RESTORE STOCK
        for prep in prepared_return_items:
            prod = prep["product"]
            qty = prep["quantity"]

            ret_item = ReturnItem(
                store_id=store.id,
                return_id=ret_order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=prep["unit_price"],
                total_refund_amount=prep["total_refund"],
                condition_note=prep["condition_note"]
            )
            db.add(ret_item)

            # Restore quantity in ProductStock
            stk = db.query(ProductStock).filter(
                ProductStock.store_id == store.id,
                ProductStock.product_id == prod.id
            ).first()
            prev_qty = stk.quantity if stk else 0.0
            if stk:
                stk.quantity += qty
            else:
                stk = ProductStock(
                    store_id=store.id,
                    product_id=prod.id,
                    quantity=qty
                )
                db.add(stk)

            # Log Stock Adjustment audit trail
            adj = StockAdjustment(
                store_id=store.id,
                product_id=prod.id,
                adjustment_type="ADD",
                quantity=qty,
                previous_quantity=prev_qty,
                new_quantity=prev_qty + qty,
                reason=f"Sales Return #{ret_order.return_number} (Invoice #{invoice.invoice_number})",
                adjusted_by=user.id
            )
            db.add(adj)

            # Restore quantity in multi-store product_inventory table
            if hasattr(prod, 'inventory_record') and prod.inventory_record:
                try:
                    prod.inventory_record.current_stock += Decimal(str(qty))
                    prod.inventory_record.last_stock_update = now
                except Exception:
                    pass

        # Create Refund record
        count_ref = db.query(Refund).filter(Refund.store_id == store.id).count() + 1
        ref_num = f"REF-STR{store.id:03d}-{count_ref:06d}"
        refund = Refund(
            store_id=store.id,
            return_id=ret_order.id,
            invoice_id=invoice.id,
            refund_number=ref_num,
            amount=total_return_amount,
            refund_method=refund_method.upper(),
            refund_date=now,
            notes=f"Refund for return #{ret_order.return_number}"
        )
        db.add(refund)

        db.commit()
        db.refresh(ret_order)
        return ReturnService.get_return_detail(db, store.id, ret_order.id)

