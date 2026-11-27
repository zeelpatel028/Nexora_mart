from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .models import GroceryReturn, GroceryRefund
from .schemas import GroceryReturnCreate
from ..grocery_billing.models import GroceryBill
from ..grocery_product.models import GroceryProduct, GroceryStockMovement
from ..grocery_finance.models import GroceryPayment
from ....utils.id_generator import generate_next_id


class GroceryReturnService:
    @staticmethod
    def list_returns(db: Session, store_id: int, limit: int = 50) -> List[dict]:
        rows = (
            db.query(GroceryReturn)
            .filter(GroceryReturn.store_id == store_id)
            .order_by(GroceryReturn.id.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": r.id,
                "store_id": r.store_id,
                "user_id": r.user_id,
                "bill_id": r.bill_id,
                "customer_id": r.customer_id,
                "return_code": r.return_code,
                "total_return_amount": r.total_return_amount,
                "reason": r.reason,
                "status": r.status,
                "created_at": str(r.created_at),
            }
            for r in rows
        ]

    @staticmethod
    def process_return(db: Session, store_id: int, user_id: int, data: GroceryReturnCreate) -> dict:
        target_bill_id = data.bill_id or data.invoice_id
        bill = None
        if target_bill_id:
            bill = db.query(GroceryBill).filter(
                GroceryBill.id == target_bill_id,
                GroceryBill.store_id == store_id,
                GroceryBill.is_deleted == False,
            ).first()
            if not bill:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

        return_code = generate_next_id(db, store_id, "return")
        refund_code = generate_next_id(db, store_id, "refund")
        total_refund = 0.0

        pids = [str(it.product_id) for it in data.items]
        prod_map = {
            str(p.id): p
            for p in db.query(GroceryProduct).filter(
                GroceryProduct.id.in_(pids),
                GroceryProduct.store_id == store_id,
            ).all()
        }

        for it in data.items:
            line_amt = round(float(it.quantity) * float(it.unit_price), 2)
            total_refund += line_amt
            prod = prod_map.get(str(it.product_id))
            if prod:
                prod.available_stock += float(it.quantity)
                db.add(
                    GroceryStockMovement(
                        store_id=store_id,
                        user_id=user_id,
                        product_id=prod.id,
                        type="return",
                        qty=float(it.quantity),
                        ref_id=return_code,
                    )
                )

        ret = GroceryReturn(
            store_id=store_id,
            user_id=user_id,
            bill_id=bill.id if bill else None,
            customer_id=bill.customer_id if bill else None,
            return_code=return_code,
            total_return_amount=round(total_refund, 2),
            reason=data.reason,
            status="completed",
        )
        db.add(ret)
        db.flush()

        refund = GroceryRefund(
            store_id=store_id,
            user_id=user_id,
            return_id=ret.id,
            bill_id=bill.id if bill else None,
            refund_code=refund_code,
            amount=round(total_refund, 2),
            refund_method=(data.refund_method or "CASH").upper(),
            notes=data.notes or data.reason,
        )
        db.add(refund)
        db.add(
            GroceryPayment(
                store_id=store_id,
                user_id=user_id,
                reference_type="refund",
                reference_id=ret.id,
                reference_code=refund_code,
                amount=round(total_refund, 2),
                payment_method=refund.refund_method,
                notes=f"Return {return_code}",
            )
        )
        db.commit()
        db.refresh(ret)
        return {
            "id": ret.id,
            "return_code": ret.return_code,
            "refund_code": refund_code,
            "total_return_amount": ret.total_return_amount,
            "status": ret.status,
            "created_at": str(ret.created_at),
        }
