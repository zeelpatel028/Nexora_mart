import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.purchase import Purchase, PurchaseItem
from ..models.product import Product, ProductVariant
from ..models.inventory import Inventory, StockMovement
from ..models.partner import Supplier
from ..models.store import Store
from ..models.user import User
from ..schemas.purchase_schema import PurchaseCreate

class PurchaseService:
    @staticmethod
    def list_purchases(
        db: Session,
        store_id: int,
        supplier_id: Optional[int] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        query = db.query(Purchase).filter(Purchase.store_id == store_id)
        if supplier_id:
            query = query.filter(Purchase.supplier_id == supplier_id)

        total = query.count()
        p_val = getattr(page, 'default', page)
        l_val = getattr(limit, 'default', limit)
        p_int = int(p_val) if isinstance(p_val, (int, float, str)) else 1
        l_int = int(l_val) if isinstance(l_val, (int, float, str)) else 50
        offset = (max(p_int, 1) - 1) * l_int
        purchases = query.order_by(Purchase.id.desc()).offset(offset).limit(l_int).all()

        results = []
        for p in purchases:
            supp_name = p.supplier.name if p.supplier else "Direct Inward"
            results.append({
                "id": p.id,
                "store_id": p.store_id,
                "supplier_id": p.supplier_id,
                "supplier_name": supp_name,
                "invoice_number": p.invoice_number,
                "purchase_date": p.purchase_date,
                "total_amount": p.total_amount,
                "paid_amount": p.paid_amount,
                "payment_status": p.payment_status,
                "payment_method": p.payment_method,
                "notes": p.notes,
                "items_count": len(p.items)
            })
        return results, total

    @staticmethod
    def get_purchase_detail(db: Session, store_id: int, purchase_id: int) -> dict:
        p = db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.store_id == store_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Purchase invoice not found.")

        items = []
        for it in p.items:
            prod = db.query(Product).filter(Product.id == it.product_id).first()
            items.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": prod.name if prod else "Unknown Product",
                "variant_id": it.variant_id,
                "batch_number": it.batch_number,
                "expiry_date": it.expiry_date,
                "quantity": it.quantity,
                "unit_cost": it.unit_cost,
                "total_cost": it.total_cost
            })

        return {
            "id": p.id,
            "store_id": p.store_id,
            "supplier_id": p.supplier_id,
            "supplier_name": p.supplier.name if p.supplier else "Direct Inward",
            "invoice_number": p.invoice_number,
            "purchase_date": p.purchase_date,
            "total_amount": p.total_amount,
            "paid_amount": p.paid_amount,
            "payment_status": p.payment_status,
            "payment_method": p.payment_method,
            "notes": p.notes,
            "items_count": len(items),
            "items": items
        }

    @staticmethod
    def create_purchase(db: Session, store: Store, user: User, request: PurchaseCreate) -> dict:
        if not request.items:
            raise HTTPException(status_code=400, detail="Purchase order must contain at least one product line.")

        try:
            total_amount = sum(it.quantity * it.unit_cost for it in request.items)
            paid_amount = request.paid_amount or 0.0

            if paid_amount >= total_amount:
                pay_status = "PAID"
            elif paid_amount > 0:
                pay_status = "PARTIAL"
            else:
                pay_status = "UNPAID"

            purchase_date = datetime.datetime.now(datetime.timezone.utc)
            if request.purchase_date:
                try:
                    purchase_date = datetime.datetime.strptime(request.purchase_date[:10], "%Y-%m-%d")
                except Exception:
                    pass

            purchase = Purchase(
                store_id=store.id,
                supplier_id=request.supplier_id,
                invoice_number=request.invoice_number.strip(),
                purchase_date=purchase_date,
                total_amount=total_amount,
                paid_amount=paid_amount,
                payment_status=pay_status,
                payment_method=request.payment_method.upper(),
                notes=request.notes
            )
            db.add(purchase)
            db.flush()

            # Process items and increment inventory
            for item in request.items:
                prod = db.query(Product).filter(Product.id == item.product_id, Product.store_id == store.id).first()
                if not prod:
                    raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found in this store.")

                exp_date = None
                if item.expiry_date:
                    try:
                        exp_date = datetime.datetime.strptime(item.expiry_date[:10], "%Y-%m-%d")
                    except Exception:
                        pass

                purchase_item = PurchaseItem(
                    purchase_id=purchase.id,
                    product_id=prod.id,
                    variant_id=item.variant_id,
                    batch_number=item.batch_number,
                    expiry_date=exp_date,
                    quantity=item.quantity,
                    unit_cost=item.unit_cost,
                    total_cost=item.quantity * item.unit_cost
                )
                db.add(purchase_item)

                # Locate or create Inventory record
                inv_query = db.query(Inventory).filter(
                    Inventory.store_id == store.id,
                    Inventory.product_id == prod.id
                )
                if item.variant_id:
                    inv_query = inv_query.filter(Inventory.variant_id == item.variant_id)
                else:
                    inv_query = inv_query.filter(Inventory.variant_id == None)

                inv = inv_query.first()
                if not inv:
                    inv = Inventory(
                        store_id=store.id,
                        product_id=prod.id,
                        variant_id=item.variant_id,
                        quantity=0.0,
                        reorder_level=prod.min_stock_level or 5.0
                    )
                    db.add(inv)

                inv.quantity += item.quantity
                if item.batch_number:
                    inv.batch_number = item.batch_number
                if exp_date:
                    inv.expiry_date = exp_date

                # If variant, increment variant stock
                if item.variant_id:
                    v = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
                    if v:
                        v.stock_quantity += item.quantity

                # Record Stock Movement
                movement = StockMovement(
                    store_id=store.id,
                    product_id=prod.id,
                    variant_id=item.variant_id,
                    movement_type="PURCHASE",
                    quantity=item.quantity,
                    reference_id=purchase.id,
                    reference_type="PURCHASE",
                    unit_price=item.unit_cost,
                    notes=f"Inward from Supplier Invoice #{purchase.invoice_number}",
                    performed_by=user.id
                )
                db.add(movement)

            # Update supplier balance if unpaid
            if request.supplier_id and (total_amount - paid_amount) > 0:
                supplier = db.query(Supplier).filter(Supplier.id == request.supplier_id, Supplier.store_id == store.id).first()
                if supplier:
                    supplier.balance += (total_amount - paid_amount)

            db.commit()
            db.refresh(purchase)
            return PurchaseService.get_purchase_detail(db, store.id, purchase.id)

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Purchase inward transaction failed: {str(e)}")
