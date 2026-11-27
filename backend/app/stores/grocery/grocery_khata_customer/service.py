import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status
from .models import GroceryCustomer
from .schemas import GroceryCustomerCreate, GroceryCustomerUpdate, CustomerPaymentPayload
from .cache import get_cached_customers, set_cached_customers, invalidate_customers_cache
from ..grocery_billing.models import GroceryBill, GroceryInvoice
from ..grocery_finance.models import GroceryPayment
from ....utils.id_generator import generate_next_id
from ....utils.pdf import generate_khata_statement_pdf


class GroceryKhataCustomerService:
    @staticmethod
    def get_dashboard_metrics(db: Session, store_id: int) -> dict:
        total_cust = db.query(func.count(GroceryCustomer.id)).filter(
            GroceryCustomer.store_id == store_id,
            GroceryCustomer.is_deleted == False
        ).scalar() or 0

        pending_bills = db.query(
            func.count(GroceryBill.id).label("count"),
            func.sum(GroceryBill.grand_total).label("total")
        ).filter(
            GroceryBill.store_id == store_id,
            GroceryBill.customer_type == "khata",
            GroceryBill.payment_status == "unpaid",
            GroceryBill.is_deleted == False
        ).first()

        p_count = pending_bills[0] if pending_bills else 0
        p_amt = float(pending_bills[1] or 0.0) if pending_bills else 0.0

        return {
            "total_customers": total_cust,
            "total_pending_bills": p_count,
            "total_pending_amount": round(p_amt, 2)
        }

    @staticmethod
    def list_customers(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        cache_key = f"{search or ''}:{page}:{limit}"
        cached = get_cached_customers(store_id, cache_key)
        if cached:
            return cached["items"], cached["total"]

        query = db.query(GroceryCustomer).filter(
            GroceryCustomer.store_id == store_id,
            GroceryCustomer.is_deleted == False
        )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    GroceryCustomer.name.ilike(term),
                    GroceryCustomer.phone.ilike(term),
                    GroceryCustomer.customer_code.ilike(term)
                )
            )

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        customers = query.order_by(GroceryCustomer.id.desc()).offset(offset).limit(limit).all()

        # Efficient single aggregate query across customer bills
        cust_ids = [c.id for c in customers]
        aggregates: Dict[int, Dict[str, Any]] = {}
        if cust_ids:
            all_bills_agg = db.query(
                GroceryBill.customer_id,
                func.count(GroceryBill.id).label("total_bills"),
                func.sum(GroceryBill.grand_total).label("total_amt")
            ).filter(
                GroceryBill.store_id == store_id,
                GroceryBill.customer_id.in_(cust_ids),
                GroceryBill.is_deleted == False
            ).group_by(GroceryBill.customer_id).all()

            unpaid_bills_agg = db.query(
                GroceryBill.customer_id,
                func.count(GroceryBill.id).label("pending_bills"),
                func.sum(GroceryBill.grand_total).label("pending_amt")
            ).filter(
                GroceryBill.store_id == store_id,
                GroceryBill.customer_id.in_(cust_ids),
                GroceryBill.payment_status == "unpaid",
                GroceryBill.is_deleted == False
            ).group_by(GroceryBill.customer_id).all()

            for cid, count, amt in all_bills_agg:
                aggregates[cid] = {"total_bills": count, "total_amt": float(amt or 0.0), "pending_bills": 0, "pending_amt": 0.0}
            for cid, count, amt in unpaid_bills_agg:
                if cid in aggregates:
                    aggregates[cid]["pending_bills"] = count
                    aggregates[cid]["pending_amt"] = float(amt or 0.0)

        results = []
        for c in customers:
            agg = aggregates.get(c.id, {"total_bills": 0, "total_amt": 0.0, "pending_bills": 0, "pending_amt": 0.0})
            results.append({
                "id": c.id,
                "store_id": c.store_id,
                "customer_code": c.customer_code,
                "name": c.name,
                "phone": c.phone,
                "address": c.address,
                "is_active": c.is_active,
                "total_bills_count": agg["total_bills"],
                "total_bill_amount": agg["total_amt"],
                "pending_bill_count": agg["pending_bills"],
                "pending_bill_amount": agg["pending_amt"],
                "total_bills": agg["total_bills"],
                "unpaid_bills": agg["pending_bills"],
                "total_due": agg["pending_amt"]
            })

        set_cached_customers(store_id, cache_key, {"items": results, "total": total})
        return results, total

    @staticmethod
    def create_customer(db: Session, store_id: int, data: GroceryCustomerCreate) -> GroceryCustomer:
        from ....models.store import Store
        st = db.query(Store).filter(Store.id == store_id).first()
        code = generate_next_id(db, store_id, "debit_customer")
        customer = GroceryCustomer(
            store_id=store_id,
            user_id=st.user_id if st else None,
            customer_code=code,
            name=data.name.strip(),
            phone=data.phone.strip(),
            address=data.address.strip() if data.address else None,
            is_active=True
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        invalidate_customers_cache(store_id)
        return customer

    @staticmethod
    def get_customer_detail(
        db: Session,
        store_id: int,
        customer_id: int,
        tab_filter: Optional[str] = None
    ) -> dict:
        customer = db.query(GroceryCustomer).filter(
            GroceryCustomer.id == customer_id,
            GroceryCustomer.store_id == store_id,
            GroceryCustomer.is_deleted == False
        ).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

        bill_query = db.query(GroceryBill).filter(
            GroceryBill.store_id == store_id,
            GroceryBill.customer_id == customer_id,
            GroceryBill.is_deleted == False
        )
        all_bills = bill_query.order_by(GroceryBill.created_at.desc()).all()

        total_bills = len(all_bills)
        total_amount = sum(float(b.grand_total or 0.0) for b in all_bills)
        pending_bills = [b for b in all_bills if b.payment_status == "unpaid"]
        pending_amount = sum(float(b.grand_total or 0.0) for b in pending_bills)

        filtered_bills = all_bills
        if tab_filter == "paid":
            filtered_bills = [b for b in all_bills if b.payment_status == "paid"]
        elif tab_filter == "unpaid":
            filtered_bills = pending_bills

        paid_bills = [b for b in all_bills if b.payment_status == "paid"]
        total_paid = sum(float(b.grand_total or 0.0) for b in paid_bills)

        return {
            "customer": {
                "id": customer.id,
                "store_id": customer.store_id,
                "customer_code": customer.customer_code,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "total_bills_count": total_bills,
                "total_bill_amount": round(total_amount, 2),
                "pending_bill_count": len(pending_bills),
                "pending_bill_amount": round(pending_amount, 2),
                "unpaid_bills": len(pending_bills),
                "total_due": round(pending_amount, 2),
            },
            "metrics": {
                "total_bills": total_bills,
                "unpaid_bills": len(pending_bills),
                "total_billed": round(total_amount, 2),
                "total_paid": round(total_paid, 2),
                "total_due": round(pending_amount, 2),
            },
            "payments": [
                {
                    "id": b.id,
                    "invoice_code": b.invoice_code,
                    "amount": float(b.grand_total or 0.0),
                    "payment_method": "SETTLED",
                    "created_at": str(b.paid_at or b.updated_at or b.created_at),
                }
                for b in paid_bills
            ],
            "bills": [
                {
                    "id": b.id,
                    "invoice_code": b.invoice_code,
                    "grand_total": b.grand_total,
                    "subtotal": b.subtotal,
                    "total_tax": b.total_tax,
                    "payment_status": b.payment_status,
                    "paid_at": str(b.paid_at) if b.paid_at else None,
                    "created_at": str(b.created_at)
                } for b in filtered_bills
            ]
        }

    @staticmethod
    def record_payment(db: Session, store_id: int, customer_id: int, data: CustomerPaymentPayload) -> dict:
        customer = db.query(GroceryCustomer).filter(
            GroceryCustomer.id == customer_id,
            GroceryCustomer.store_id == store_id,
            GroceryCustomer.is_deleted == False
        ).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

        # Find unpaid bills in chronological order
        unpaid_bills = db.query(GroceryBill).filter(
            GroceryBill.store_id == store_id,
            GroceryBill.customer_id == customer_id,
            GroceryBill.payment_status == "unpaid",
            GroceryBill.is_deleted == False
        ).order_by(GroceryBill.created_at.asc()).all()

        if not unpaid_bills:
            return {"success": True, "message": "No pending bills for this customer.", "remaining_unsettled": 0.0}

        remaining_payment = data.amount
        settled_count = 0
        now = datetime.datetime.now(datetime.timezone.utc)

        for bill in unpaid_bills:
            if remaining_payment >= bill.grand_total:
                remaining_payment -= bill.grand_total
                bill.payment_status = "paid"
                bill.paid_amount = bill.grand_total
                bill.paid_at = now
                bill.updated_at = now
                inv = db.query(GroceryInvoice).filter(GroceryInvoice.bill_id == bill.id).first()
                if inv:
                    inv.payment_status = "paid"
                settled_count += 1
            else:
                break

        db.add(
            GroceryPayment(
                store_id=store_id,
                user_id=customer.user_id,
                reference_type="khata",
                reference_id=customer.id,
                reference_code=customer.customer_code,
                amount=round(float(data.amount), 2),
                payment_method=(data.payment_method or "CASH").upper(),
                payment_date=now,
                notes=data.notes or f"Khata payment from {customer.name}",
            )
        )

        db.commit()
        invalidate_customers_cache(store_id)
        return {
            "success": True,
            "message": f"Successfully settled {settled_count} bill(s).",
            "amount_paid": data.amount,
            "bills_settled": settled_count
        }

    @staticmethod
    def generate_statement_pdf(db: Session, store_id: int, customer_id: int) -> bytes:
        data = GroceryKhataCustomerService.get_customer_detail(db, store_id, customer_id)
        cust = data["customer"]
        bills = data["bills"]
        return generate_khata_statement_pdf(cust, bills)
