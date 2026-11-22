import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from .models import GroceryPurchaseOrder
from .schemas import PurchaseOrderCreate, PurchaseOrderReceiveRequest, PurchaseOrderPaymentRequest
from .cache import invalidate_orders_cache
from ..grocery_product.models import GroceryProduct, GroceryProductBatch, GroceryStockMovement
from ..grocery_supplier.models import GrocerySupplier
from ....utils.id_generator import generate_next_id


class GroceryPurchaseOrderService:
    @staticmethod
    def list_orders(
        db: Session,
        store_id: int,
        supplier_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        query = db.query(GroceryPurchaseOrder).filter(
            GroceryPurchaseOrder.store_id == store_id,
            GroceryPurchaseOrder.is_deleted == False
        )

        if supplier_id:
            query = query.filter(GroceryPurchaseOrder.supplier_id == supplier_id)
        if status_filter:
            query = query.filter(GroceryPurchaseOrder.status == status_filter.lower())
        if payment_status:
            query = query.filter(GroceryPurchaseOrder.payment_status == payment_status.lower())
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(GroceryPurchaseOrder.order_code.ilike(term))

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        orders = query.order_by(GroceryPurchaseOrder.id.desc()).offset(offset).limit(limit).all()

        # Batch resolve supplier and product details
        supp_ids = [o.supplier_id for o in orders if o.supplier_id]
        prod_ids = [o.product_id for o in orders if o.product_id]

        supp_map = {}
        if supp_ids:
            for s in db.query(GrocerySupplier).filter(GrocerySupplier.id.in_(supp_ids)).all():
                supp_map[s.id] = f"{s.seller_name} ({s.store_name})"

        prod_map = {}
        prod_expiry_map = {}
        if prod_ids:
            for p in db.query(GroceryProduct).filter(GroceryProduct.id.in_(prod_ids)).all():
                prod_map[p.id] = p.name
                prod_expiry_map[p.id] = p.expiry_alert_enabled

        results = []
        for o in orders:
            results.append({
                "id": o.id,
                "store_id": o.store_id,
                "order_code": o.order_code,
                "supplier_id": o.supplier_id,
                "supplier_name": supp_map.get(o.supplier_id),
                "product_id": o.product_id,
                "product_name": prod_map.get(o.product_id),
                "qty": o.qty,
                "unit": o.unit,
                "purchase_price": o.purchase_price,
                "total_amount": o.total_amount,
                "expected_delivery_date": str(o.expected_delivery_date)[:10] if o.expected_delivery_date else None,
                "status": o.status,
                "received_at": str(o.received_at) if o.received_at else None,
                "expiry_date": str(o.expiry_date)[:10] if o.expiry_date else None,
                "payment_status": o.payment_status,
                "paid_at": str(o.paid_at) if o.paid_at else None,
                "created_at": str(o.created_at),
                "expiry_alert_enabled": prod_expiry_map.get(o.product_id, False)
            })

        return results, total

    @staticmethod
    def place_order(db: Session, store_id: int, data: PurchaseOrderCreate) -> dict:
        product = db.query(GroceryProduct).filter(
            GroceryProduct.id == data.product_id,
            GroceryProduct.store_id == store_id,
            GroceryProduct.is_deleted == False
        ).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        supplier = db.query(GrocerySupplier).filter(
            GrocerySupplier.id == data.supplier_id,
            GrocerySupplier.store_id == store_id,
            GrocerySupplier.is_deleted == False
        ).first()
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

        order_code = generate_next_id(db, store_id, "order")
        total_amt = round(data.qty * data.purchase_price, 2)

        exp_date = None
        if data.expected_delivery_date:
            try:
                exp_date = datetime.datetime.fromisoformat(data.expected_delivery_date.replace("Z", "+00:00"))
            except Exception:
                pass

        order = GroceryPurchaseOrder(
            store_id=store_id,
            order_code=order_code,
            supplier_id=supplier.id,
            product_id=product.id,
            qty=data.qty,
            unit=data.unit,
            purchase_price=data.purchase_price,  # Custom price for THIS order only! Never mutates product master table
            total_amount=total_amt,
            expected_delivery_date=exp_date,
            status="placed",
            payment_status="pending"
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        invalidate_orders_cache(store_id)

        return {
            "id": order.id,
            "order_code": order.order_code,
            "supplier_name": f"{supplier.seller_name} ({supplier.store_name})",
            "product_name": product.name,
            "qty": order.qty,
            "unit": order.unit,
            "purchase_price": order.purchase_price,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_status": order.payment_status
        }

    @staticmethod
    def receive_order(db: Session, store_id: int, order_id: int, data: PurchaseOrderReceiveRequest) -> dict:
        order = db.query(GroceryPurchaseOrder).filter(
            GroceryPurchaseOrder.id == order_id,
            GroceryPurchaseOrder.store_id == store_id,
            GroceryPurchaseOrder.is_deleted == False
        ).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")

        if order.status == "received":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order has already been received.")

        product = db.query(GroceryProduct).filter(
            GroceryProduct.id == order.product_id,
            GroceryProduct.store_id == store_id
        ).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated product not found")

        parsed_expiry = None
        if product.expiry_alert_enabled:
            if not data.expiry_date or not data.expiry_date.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Expiry date is required for products with expiry alert enabled."
                )
            try:
                parsed_expiry = datetime.datetime.fromisoformat(data.expiry_date.replace("Z", "+00:00"))
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid expiry date format. Please use YYYY-MM-DD."
                )
        elif data.expiry_date:
            try:
                parsed_expiry = datetime.datetime.fromisoformat(data.expiry_date.replace("Z", "+00:00"))
            except Exception:
                pass

        now = datetime.datetime.now(datetime.timezone.utc)

        # Single atomic database transaction:
        # 1. Increase product stock
        product.available_stock += order.qty
        product.updated_at = now

        # 2. Record stock movement
        movement = GroceryStockMovement(
            store_id=store_id,
            product_id=product.id,
            type="order_received",
            qty=order.qty,
            ref_id=order.order_code
        )
        db.add(movement)

        # 3. Create batch record if expiry or tracking enabled
        if product.expiry_alert_enabled and parsed_expiry:
            batch = GroceryProductBatch(
                store_id=store_id,
                product_id=product.id,
                purchase_order_id=order.id,
                qty=order.qty,
                remaining_qty=order.qty,
                expiry_date=parsed_expiry,
                received_at=now
            )
            db.add(batch)

        # 4. Mark order as received
        order.status = "received"
        order.received_at = now
        order.expiry_date = parsed_expiry
        order.updated_at = now

        db.commit()
        invalidate_orders_cache(store_id)

        return {
            "success": True,
            "message": f"Order {order.order_code} successfully received. Stock updated.",
            "order_code": order.order_code,
            "available_stock": product.available_stock,
            "status": order.status,
            "payment_status": order.payment_status
        }

    @staticmethod
    def pay_order(db: Session, store_id: int, order_id: int, data: PurchaseOrderPaymentRequest) -> dict:
        order = db.query(GroceryPurchaseOrder).filter(
            GroceryPurchaseOrder.id == order_id,
            GroceryPurchaseOrder.store_id == store_id,
            GroceryPurchaseOrder.is_deleted == False
        ).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")

        now = datetime.datetime.now(datetime.timezone.utc)
        order.payment_status = "paid"
        order.paid_at = now
        order.updated_at = now

        db.commit()
        invalidate_orders_cache(store_id)

        return {
            "success": True,
            "message": f"Payment recorded for order {order.order_code}.",
            "order_code": order.order_code,
            "payment_status": order.payment_status,
            "paid_at": str(order.paid_at)
        }
