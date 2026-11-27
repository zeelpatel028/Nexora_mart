import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case
from fastapi import HTTPException, status
from .models import GrocerySupplier
from .schemas import GrocerySupplierCreate, GrocerySupplierUpdate
from .cache import get_cached_suppliers, set_cached_suppliers, invalidate_suppliers_cache
from ....utils.id_generator import generate_next_id
from ....utils.pdf import _generate_fallback_pdf_statement


class GrocerySupplierService:
    @staticmethod
    def get_dashboard_metrics(db: Session, store_id: int) -> dict:
        total_suppliers = db.query(func.count(GrocerySupplier.id)).filter(
            GrocerySupplier.store_id == store_id,
            GrocerySupplier.is_deleted == False
        ).scalar() or 0

        # Aggregate purchase orders in SQL
        from ..grocery_purchase_order.models import GroceryPurchaseOrder
        agg = db.query(
            func.coalesce(func.sum(case((GroceryPurchaseOrder.status == "placed", 1), else_=0)), 0),
            func.coalesce(
                func.sum(case((GroceryPurchaseOrder.payment_status == "pending", GroceryPurchaseOrder.total_amount), else_=0.0)),
                0.0,
            ),
            func.coalesce(func.sum(GroceryPurchaseOrder.total_amount), 0.0),
        ).filter(
            GroceryPurchaseOrder.store_id == store_id,
            GroceryPurchaseOrder.is_deleted == False
        ).first()

        pending_orders = int(agg[0] or 0) if agg else 0
        pending_payments = float(agg[1] or 0.0) if agg else 0.0
        total_purchase = float(agg[2] or 0.0) if agg else 0.0

        return {
            "total_suppliers": total_suppliers,
            "total_pending_orders": pending_orders,
            "total_pending_payments": round(pending_payments, 2),
            "total_purchase_amount": round(total_purchase, 2)
        }

    @staticmethod
    def list_suppliers(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        cache_key = f"{search or ''}:{page}:{limit}"
        cached = get_cached_suppliers(store_id, cache_key)
        if cached:
            return cached["items"], cached["total"]

        query = db.query(GrocerySupplier).filter(
            GrocerySupplier.store_id == store_id,
            GrocerySupplier.is_deleted == False
        )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    GrocerySupplier.store_name.ilike(term),
                    GrocerySupplier.seller_name.ilike(term),
                    GrocerySupplier.phone.ilike(term),
                    GrocerySupplier.supplier_code.ilike(term)
                )
            )

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        suppliers = query.order_by(GrocerySupplier.id.desc()).offset(offset).limit(limit).all()

        # Aggregate purchase totals for fetched suppliers in a single query
        from ..grocery_purchase_order.models import GroceryPurchaseOrder
        supp_ids = [s.id for s in suppliers]
        aggregates: Dict[int, Dict[str, Any]] = {}
        if supp_ids:
            agg_rows = db.query(
                GroceryPurchaseOrder.supplier_id,
                func.count(GroceryPurchaseOrder.id).label("total_orders"),
                func.sum(GroceryPurchaseOrder.total_amount).label("total_amt")
            ).filter(
                GroceryPurchaseOrder.store_id == store_id,
                GroceryPurchaseOrder.supplier_id.in_(supp_ids),
                GroceryPurchaseOrder.is_deleted == False
            ).group_by(GroceryPurchaseOrder.supplier_id).all()

            pending_rows = db.query(
                GroceryPurchaseOrder.supplier_id,
                func.sum(GroceryPurchaseOrder.total_amount).label("pending_amt")
            ).filter(
                GroceryPurchaseOrder.store_id == store_id,
                GroceryPurchaseOrder.supplier_id.in_(supp_ids),
                GroceryPurchaseOrder.payment_status == "pending",
                GroceryPurchaseOrder.is_deleted == False
            ).group_by(GroceryPurchaseOrder.supplier_id).all()

            for sid, count, amt in agg_rows:
                aggregates[sid] = {"total_orders": count or 0, "total_amt": float(amt or 0.0), "pending_amt": 0.0}
            for sid, p_amt in pending_rows:
                if sid in aggregates:
                    aggregates[sid]["pending_amt"] = float(p_amt or 0.0)

        results = []
        for s in suppliers:
            agg = aggregates.get(s.id, {"total_orders": 0, "total_amt": 0.0, "pending_amt": 0.0})
            results.append({
                "id": s.id,
                "store_id": s.store_id,
                "supplier_code": s.supplier_code,
                "store_name": s.store_name,
                "seller_name": s.seller_name,
                "phone": s.phone,
                "email": s.email,
                "address": s.address,
                "gst_number": s.gst_number,
                "bank_name": s.bank_name,
                "account_holder": s.account_holder,
                "account_number": s.account_number,
                "ifsc": s.ifsc,
                "upi_id": s.upi_id,
                "is_active": s.is_active,
                "total_orders_count": agg["total_orders"],
                "total_purchase_amount": agg["total_amt"],
                "pending_payment_amount": agg["pending_amt"],
                "total_orders": agg["total_orders"],
                "total_purchases": agg["total_amt"],
                "pending_balance": agg["pending_amt"]
            })

        set_cached_suppliers(store_id, cache_key, {"items": results, "total": total})
        return results, total

    @staticmethod
    def create_supplier(db: Session, store_id: int, data: GrocerySupplierCreate) -> GrocerySupplier:
        from ....models.store import Store
        st = db.query(Store).filter(Store.id == store_id).first()
        code = generate_next_id(db, store_id, "supplier")
        supplier = GrocerySupplier(
            store_id=store_id,
            user_id=st.user_id if st else None,
            supplier_code=code,
            store_name=data.store_name.strip(),
            seller_name=data.seller_name.strip(),
            phone=data.phone.strip(),
            email=data.email.strip() if data.email else None,
            address=data.address.strip() if data.address else None,
            gst_number=data.gst_number.strip() if data.gst_number else None,
            bank_name=data.bank_name.strip() if data.bank_name else None,
            account_holder=data.account_holder.strip() if data.account_holder else None,
            account_number=data.account_number.strip() if data.account_number else None,
            ifsc=data.ifsc.strip() if data.ifsc else None,
            upi_id=data.upi_id.strip() if data.upi_id else None,
            is_active=True
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        invalidate_suppliers_cache(store_id)
        return supplier

    @staticmethod
    def get_supplier_detail(db: Session, store_id: int, supplier_id: int) -> dict:
        supplier = db.query(GrocerySupplier).filter(
            GrocerySupplier.id == supplier_id,
            GrocerySupplier.store_id == store_id,
            GrocerySupplier.is_deleted == False
        ).first()
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

        from ..grocery_purchase_order.models import GroceryPurchaseOrder
        from ..grocery_finance.models import GroceryPayment
        orders = db.query(GroceryPurchaseOrder).filter(
            GroceryPurchaseOrder.store_id == store_id,
            GroceryPurchaseOrder.supplier_id == supplier_id,
            GroceryPurchaseOrder.is_deleted == False
        ).order_by(GroceryPurchaseOrder.id.desc()).all()

        total_orders = len(orders)
        total_amt = sum(float(o.total_amount or 0.0) for o in orders)
        pending_amt = sum(float(o.total_amount or 0.0) for o in orders if o.payment_status == "pending")
        received_orders = [o for o in orders if o.status == "received"]
        order_ids = [o.id for o in orders]
        pmts = []
        if order_ids:
            pmts = db.query(GroceryPayment).filter(
                GroceryPayment.store_id == store_id,
                GroceryPayment.reference_type == "supplier_order",
                GroceryPayment.reference_id.in_(order_ids),
            ).order_by(GroceryPayment.id.desc()).all()

        return {
            "supplier": {
                "id": supplier.id,
                "store_id": supplier.store_id,
                "user_id": supplier.user_id,
                "supplier_code": supplier.supplier_code,
                "store_name": supplier.store_name,
                "seller_name": supplier.seller_name,
                "phone": supplier.phone,
                "email": supplier.email,
                "address": supplier.address,
                "gst_number": supplier.gst_number,
                "bank_name": supplier.bank_name,
                "account_holder": supplier.account_holder,
                "account_number": supplier.account_number,
                "ifsc": supplier.ifsc,
                "upi_id": supplier.upi_id,
                "is_active": supplier.is_active,
                "total_orders_count": total_orders,
                "received_orders_count": len(received_orders),
                "total_purchase_amount": total_amt,
                "pending_payment_amount": pending_amt,
                "total_orders": total_orders,
                "total_purchases": total_amt,
                "pending_balance": pending_amt,
            },
            "metrics": {
                "total_orders": total_orders,
                "received_orders": len(received_orders),
                "total_amount": round(total_amt, 2),
                "pending_amount": round(pending_amt, 2),
            },
            "orders": [
                {
                    "id": o.id,
                    "order_code": o.order_code,
                    "qty": o.qty,
                    "unit": o.unit,
                    "purchase_price": o.purchase_price,
                    "total_amount": o.total_amount,
                    "expected_delivery_date": str(o.expected_delivery_date)[:10] if o.expected_delivery_date else None,
                    "status": o.status,
                    "payment_status": o.payment_status,
                    "created_at": str(o.created_at)
                } for o in orders
            ],
            "received_orders": [
                {
                    "id": o.id,
                    "order_code": o.order_code,
                    "qty": o.qty,
                    "unit": o.unit,
                    "total_amount": o.total_amount,
                    "received_at": str(o.received_at) if o.received_at else None,
                    "payment_status": o.payment_status,
                } for o in received_orders
            ],
            "payments": [
                {
                    "id": p.id,
                    "reference_code": p.reference_code,
                    "amount": p.amount,
                    "payment_method": p.payment_method,
                    "payment_date": str(p.payment_date),
                    "notes": p.notes,
                } for p in pmts
            ],
        }

    @staticmethod
    def update_supplier(db: Session, store_id: int, supplier_id: int, data: GrocerySupplierUpdate) -> GrocerySupplier:
        supplier = db.query(GrocerySupplier).filter(
            GrocerySupplier.id == supplier_id,
            GrocerySupplier.store_id == store_id,
            GrocerySupplier.is_deleted == False
        ).first()
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

        for key, val in data.model_dump(exclude_unset=True).items():
            if val is not None:
                setattr(supplier, key, val)

        supplier.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(supplier)
        invalidate_suppliers_cache(store_id)
        return supplier

    @staticmethod
    def delete_supplier(db: Session, store_id: int, supplier_id: int):
        supplier = db.query(GrocerySupplier).filter(
            GrocerySupplier.id == supplier_id,
            GrocerySupplier.store_id == store_id
        ).first()
        if not supplier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

        supplier.is_deleted = True
        supplier.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        invalidate_suppliers_cache(store_id)
        return {"success": True, "message": "Supplier deleted successfully"}

    @staticmethod
    def generate_statement_pdf(db: Session, store_id: int, supplier_id: int) -> bytes:
        data = GrocerySupplierService.get_supplier_detail(db, store_id, supplier_id)
        supp = data["supplier"]
        orders = data["orders"]
        return _generate_fallback_pdf_statement("Supplier Statement", f"{supp['seller_name']} ({supp['store_name']})", orders)
