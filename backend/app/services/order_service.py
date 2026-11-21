import datetime
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.purchase import Purchase, PurchaseItem
from ..models.product import Product
from ..models.inventory import Inventory, ProductStock
from ..models.partner import Supplier
from ..models.ledger import SupplierLedger, ProductBatchRecord, StockMovementRecord, PurchaseOrderPayment
from ..models.store import Store
from ..models.user import User
from ..services.prefix_service import PrefixService
from ..schemas.purchase_order_schema import (
    PurchaseOrderCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest
)


class OrderService:
    """
    Complete purchase order management service:
    - Placing orders with custom purchase prices (isolated from master product price)
    - Transactional order receiving with batch creation, expiry date capture, stock increment, and supplier ledger updates
    - Order payments with ledger tracking
    """

    @classmethod
    def list_orders(
        cls,
        db: Session,
        store_id: int,
        supplier_id: Optional[int] = None,
        order_status: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = db.query(Purchase).filter(Purchase.store_id == store_id)

        if supplier_id:
            query = query.filter(Purchase.supplier_id == supplier_id)
        if order_status:
            query = query.filter(Purchase.payment_status.ilike(f"%{order_status}%"))
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.outerjoin(Purchase.supplier).filter(
                (Purchase.invoice_number.ilike(term)) | (Supplier.name.ilike(term))
            )

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        purchases = query.order_by(Purchase.id.desc()).offset(offset).limit(limit).all()

        results = []
        for p in purchases:
            supp_name = p.supplier.name if p.supplier else "Direct Supplier"
            first_item = p.items[0] if p.items else None
            prod_name = first_item.product.name if first_item and first_item.product else "Multiple Products"
            if len(p.items) > 1:
                prod_name += f" (+{len(p.items) - 1} more)"

            total_qty = sum(it.quantity for it in p.items)
            results.append({
                "id": p.id,
                "store_id": p.store_id,
                "order_number": p.invoice_number,
                "supplier_id": p.supplier_id,
                "supplier_name": supp_name,
                "product_name": prod_name,
                "quantity": total_qty,
                "total_amount": p.total_amount,
                "paid_amount": p.paid_amount,
                "order_status": "Received" if p.notes and "RECEIVED" in p.notes else "Pending",
                "payment_status": p.payment_status or "Pending",
                "expected_delivery_date": p.created_at + datetime.timedelta(days=3),
                "created_at": p.created_at,
                "items": [
                    {
                        "id": it.id,
                        "product_id": str(it.product_id),
                        "product_name": it.product.name if it.product else "Product",
                        "quantity": it.quantity,
                        "received_quantity": it.quantity if (p.notes and "RECEIVED" in p.notes) else 0.0,
                        "unit": it.product.unit if it.product and it.product.unit else "Piece",
                        "purchase_price": it.unit_cost,
                        "gst_rate": 0.0,
                        "total_amount": it.total_cost,
                        "batch_number": it.batch_number,
                        "expiry_date": it.expiry_date,
                    }
                    for it in p.items
                ]
            })
        return results, total

    @classmethod
    def place_order(
        cls,
        db: Session,
        store: Store,
        user: User,
        data: PurchaseOrderCreate
    ) -> Dict[str, Any]:
        """
        Place a new purchase order.
        Important: Saves custom purchase price inside the order item WITHOUT overwriting the master product price.
        Stock is NOT increased here; stock increases only when the order is received!
        """
        supplier = db.query(Supplier).filter(Supplier.id == data.supplier_id, Supplier.store_id == store.id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Selected supplier not found.")

        order_number = PrefixService.generate_id(db, store.id, "order")
        total_amount = sum(it.quantity * it.purchase_price for it in data.items)

        purchase = Purchase(
            store_id=store.id,
            supplier_id=supplier.id,
            invoice_number=order_number,
            purchase_date=datetime.datetime.now(datetime.timezone.utc),
            total_amount=total_amount,
            paid_amount=0.0,
            payment_status="Pending",
            payment_method="PENDING",
            notes=f"STATUS:ORDERED | Notes: {data.notes or ''}",
        )
        db.add(purchase)
        db.flush()

        for it in data.items:
            product = db.query(Product).filter(Product.id == it.product_id, Product.store_id == store.id).first()
            if not product:
                continue

            item_total = it.quantity * it.purchase_price
            order_item = PurchaseItem(
                store_id=store.id,
                purchase_id=purchase.id,
                product_id=product.id,
                quantity=it.quantity,
                unit_cost=it.purchase_price,  # Isolated to this order item
                total_cost=item_total
            )
            db.add(order_item)

        db.commit()
        db.refresh(purchase)

        return {
            "success": True,
            "message": f"Purchase order {order_number} placed successfully.",
            "order_id": purchase.id,
            "order_number": order_number,
            "total_amount": total_amount,
            "order_status": "Ordered"
        }

    @classmethod
    def receive_order(
        cls,
        db: Session,
        store: Store,
        user: User,
        order_id: int,
        data: PurchaseOrderReceiveRequest
    ) -> Dict[str, Any]:
        """
        Atomic receive order confirmation:
        1. Checks order is not already received (prevents double receive).
        2. Increases product stock.
        3. Creates product batch record.
        4. Saves expiry date if provided.
        5. Logs stock movement audit record.
        6. Updates order status to Received.
        7. Updates supplier ledger balance.
        """
        purchase = db.query(Purchase).filter(
            Purchase.id == order_id,
            Purchase.store_id == store.id
        ).with_for_update().first()

        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase order not found.")

        if purchase.notes and "RECEIVED" in purchase.notes:
            raise HTTPException(status_code=400, detail="This order has already been received. Duplicate receive blocked.")

        received_qty = data.received_quantity
        batch_num = data.batch_number or f"BATCH-{datetime.date.today().strftime('%Y%m%d')}-{order_id}"

        # Update stock for each item in the order
        for item in purchase.items:
            product = db.query(Product).filter(Product.id == item.product_id, Product.store_id == store.id).first()
            if not product:
                continue

            prev_stock = product.current_stock or 0.0
            new_stock = prev_stock + received_qty
            product.current_stock = new_stock

            # Update Inventory table
            inv = db.query(Inventory).filter(
                Inventory.store_id == store.id,
                Inventory.product_id == product.id
            ).first()
            if not inv:
                inv = Inventory(
                    store_id=store.id,
                    product_id=product.id,
                    quantity=new_stock,
                    reorder_level=5.0
                )
                db.add(inv)
            else:
                inv.quantity += received_qty

            if data.expiry_date:
                inv.expiry_date = data.expiry_date
                inv.batch_number = batch_num

            # 2 & 3: Create Product Batch record
            batch_record = ProductBatchRecord(
                store_id=store.id,
                product_id=product.id,
                batch_number=batch_num,
                expiry_date=data.expiry_date,
                purchase_price=item.unit_cost,
                selling_price=product.selling_price or 0.0,
                current_quantity=received_qty,
                initial_quantity=received_qty,
                is_active=True
            )
            db.add(batch_record)

            # 5: Create Stock Movement record
            movement = StockMovementRecord(
                store_id=store.id,
                product_id=product.id,
                adjustment_type="PURCHASE_RECEIVE",
                quantity=received_qty,
                reason=f"Received order #{purchase.invoice_number} (Batch: {batch_num})",
                adjusted_by=user.id
            )
            db.add(movement)

        # 6: Update order status
        purchase.notes = f"STATUS:RECEIVED | Batch: {batch_num} | {data.notes or ''}"

        # 7: Update supplier ledger
        if purchase.supplier:
            supplier = purchase.supplier
            supplier.balance = (supplier.balance or 0.0) + purchase.total_amount
            ledger_entry = SupplierLedger(
                store_id=store.id,
                supplier_id=supplier.id,
                transaction_type="PURCHASE",
                reference_type="PURCHASE_ORDER",
                reference_id=purchase.invoice_number,
                credit=purchase.total_amount,
                debit=0.0,
                balance=supplier.balance,
                description=f"Received goods for Purchase Order {purchase.invoice_number}"
            )
            db.add(ledger_entry)

        db.commit()
        db.refresh(purchase)

        return {
            "success": True,
            "message": f"Order {purchase.invoice_number} received successfully. Stock and batch records updated.",
            "order_status": "Received",
            "batch_number": batch_num,
            "supplier_balance": purchase.supplier.balance if purchase.supplier else 0.0
        }

    @classmethod
    def pay_order(
        cls,
        db: Session,
        store: Store,
        user: User,
        order_id: int,
        data: PurchaseOrderPaymentRequest
    ) -> Dict[str, Any]:
        """
        Record full or partial payment against a purchase order.
        Updates order payment status and creates supplier ledger entry.
        """
        purchase = db.query(Purchase).filter(
            Purchase.id == order_id,
            Purchase.store_id == store.id
        ).with_for_update().first()

        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase order not found.")

        amount = data.amount
        current_paid = purchase.paid_amount or 0.0
        new_paid = current_paid + amount
        purchase.paid_amount = new_paid

        if new_paid >= purchase.total_amount:
            purchase.payment_status = "Paid"
        else:
            purchase.payment_status = "Partially Paid"

        purchase.payment_method = data.payment_method

        # Record payment log
        payment_log = PurchaseOrderPayment(
            store_id=store.id,
            purchase_order_id=purchase.id,
            amount=amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date or datetime.datetime.now(datetime.timezone.utc),
            notes=data.notes
        )
        db.add(payment_log)

        # Update supplier ledger
        if purchase.supplier:
            supplier = purchase.supplier
            supplier.balance = max(0.0, (supplier.balance or 0.0) - amount)
            ledger_entry = SupplierLedger(
                store_id=store.id,
                supplier_id=supplier.id,
                transaction_type="PAYMENT",
                reference_type="PURCHASE_ORDER",
                reference_id=purchase.invoice_number,
                debit=amount,
                credit=0.0,
                balance=supplier.balance,
                description=f"Payment for Purchase Order {purchase.invoice_number} via {data.payment_method}"
            )
            db.add(ledger_entry)

        db.commit()
        db.refresh(purchase)

        return {
            "success": True,
            "message": f"Payment of ₹{amount:,.2f} recorded successfully.",
            "payment_status": purchase.payment_status,
            "paid_amount": purchase.paid_amount,
            "remaining_balance": max(0.0, purchase.total_amount - purchase.paid_amount),
            "supplier_balance": purchase.supplier.balance if purchase.supplier else 0.0
        }
