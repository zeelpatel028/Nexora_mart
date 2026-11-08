import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.inventory import Inventory, StockMovement
from ..models.product import Product, ProductVariant
from ..models.store import Store
from ..models.user import User
from ..schemas.inventory_schema import StockInRequest, StockOutRequest, StockAdjustRequest

class InventoryService:
    @staticmethod
    def list_inventory(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        low_stock_only: bool = False,
        expiring_only: bool = False
    ) -> List[dict]:
        query = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id).filter(
            Inventory.store_id == store_id,
            Product.is_active == True
        )

        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(pattern),
                    Product.sku.ilike(pattern),
                    Inventory.batch_number.ilike(pattern)
                )
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        soon = now + datetime.timedelta(days=30)

        results = []
        for inv, prod in query.order_by(Product.name).all():
            variant_name = None
            if inv.variant_id:
                v = db.query(ProductVariant).filter(ProductVariant.id == inv.variant_id).first()
                if v:
                    variant_name = v.name

            is_low = inv.quantity <= inv.reorder_level
            is_exp = bool(inv.expiry_date and inv.expiry_date <= now)
            is_soon = bool(inv.expiry_date and now < inv.expiry_date <= soon)

            if low_stock_only and not is_low:
                continue
            if expiring_only and not (is_exp or is_soon):
                continue

            results.append({
                "id": inv.id,
                "store_id": inv.store_id,
                "product_id": inv.product_id,
                "product_name": prod.name,
                "product_sku": prod.sku,
                "category_name": prod.category.name if prod.category else "",
                "variant_id": inv.variant_id,
                "variant_name": variant_name,
                "quantity": inv.quantity,
                "reorder_level": inv.reorder_level,
                "unit": prod.unit or "piece",
                "batch_number": inv.batch_number,
                "expiry_date": inv.expiry_date,
                "is_low_stock": is_low,
                "is_expired": is_exp,
                "is_expiring_soon": is_soon
            })
        return results

    @staticmethod
    def stock_in(db: Session, store: Store, user: User, request: StockInRequest) -> dict:
        prod = db.query(Product).filter(Product.id == request.product_id, Product.store_id == store.id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found in this store.")

        inv_query = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.product_id == prod.id
        )
        if request.variant_id:
            inv_query = inv_query.filter(Inventory.variant_id == request.variant_id)
        else:
            inv_query = inv_query.filter(Inventory.variant_id == None)

        inv = inv_query.first()
        if not inv:
            inv = Inventory(
                store_id=store.id,
                product_id=prod.id,
                variant_id=request.variant_id,
                quantity=0.0,
                reorder_level=prod.min_stock_level or 5.0
            )
            db.add(inv)

        inv.quantity += request.quantity
        if request.batch_number:
            inv.batch_number = request.batch_number
        if request.expiry_date:
            try:
                inv.expiry_date = datetime.datetime.strptime(request.expiry_date[:10], "%Y-%m-%d")
            except Exception:
                pass

        # If variant, also update ProductVariant stock
        if request.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == request.variant_id).first()
            if variant:
                variant.stock_quantity += request.quantity

        movement = StockMovement(
            store_id=store.id,
            product_id=prod.id,
            variant_id=request.variant_id,
            movement_type="IN",
            quantity=request.quantity,
            unit_price=request.unit_cost or prod.purchase_price or 0.0,
            notes=request.notes or "Manual Stock In",
            performed_by=user.id
        )
        db.add(movement)
        db.commit()

        return {
            "success": True,
            "message": f"Added {request.quantity} {prod.unit or 'units'} to inventory.",
            "current_quantity": inv.quantity
        }

    @staticmethod
    def stock_out(db: Session, store: Store, user: User, request: StockOutRequest) -> dict:
        prod = db.query(Product).filter(Product.id == request.product_id, Product.store_id == store.id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found.")

        inv_query = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.product_id == prod.id
        )
        if request.variant_id:
            inv_query = inv_query.filter(Inventory.variant_id == request.variant_id)
        else:
            inv_query = inv_query.filter(Inventory.variant_id == None)

        inv = inv_query.first()
        if not inv or inv.quantity < request.quantity:
            current_qty = inv.quantity if inv else 0.0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory. Requested: {request.quantity}, Available: {current_qty}"
            )

        inv.quantity -= request.quantity

        if request.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == request.variant_id).first()
            if variant:
                variant.stock_quantity = max(0.0, variant.stock_quantity - request.quantity)

        movement = StockMovement(
            store_id=store.id,
            product_id=prod.id,
            variant_id=request.variant_id,
            movement_type="OUT",
            quantity=request.quantity,
            notes=f"Stock Out: {request.reason} - {request.notes or ''}",
            performed_by=user.id
        )
        db.add(movement)
        db.commit()

        return {
            "success": True,
            "message": f"Deducted {request.quantity} {prod.unit or 'units'} from inventory.",
            "current_quantity": inv.quantity
        }

    @staticmethod
    def adjust_stock(db: Session, store: Store, user: User, request: StockAdjustRequest) -> dict:
        prod = db.query(Product).filter(Product.id == request.product_id, Product.store_id == store.id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found.")

        inv_query = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.product_id == prod.id
        )
        if request.variant_id:
            inv_query = inv_query.filter(Inventory.variant_id == request.variant_id)
        else:
            inv_query = inv_query.filter(Inventory.variant_id == None)

        inv = inv_query.first()
        if not inv:
            inv = Inventory(
                store_id=store.id,
                product_id=prod.id,
                variant_id=request.variant_id,
                quantity=0.0,
                reorder_level=prod.min_stock_level or 5.0
            )
            db.add(inv)

        old_quantity = inv.quantity
        diff = request.actual_quantity - old_quantity
        inv.quantity = request.actual_quantity

        if request.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == request.variant_id).first()
            if variant:
                variant.stock_quantity = request.actual_quantity

        movement = StockMovement(
            store_id=store.id,
            product_id=prod.id,
            variant_id=request.variant_id,
            movement_type="ADJUSTMENT",
            quantity=diff,
            notes=f"Stock Count Adjustment (was {old_quantity}, set to {request.actual_quantity}): {request.notes}",
            performed_by=user.id
        )
        db.add(movement)
        db.commit()

        return {
            "success": True,
            "message": f"Inventory adjusted from {old_quantity} to {request.actual_quantity}",
            "current_quantity": inv.quantity
        }

    @staticmethod
    def get_stock_movements(db: Session, store_id: int, product_id: Optional[int] = None, limit: int = 100) -> List[dict]:
        query = db.query(StockMovement, Product).join(Product, StockMovement.product_id == Product.id).filter(
            StockMovement.store_id == store_id
        )
        if product_id:
            query = query.filter(StockMovement.product_id == product_id)

        rows = query.order_by(StockMovement.id.desc()).limit(limit).all()
        return [
            {
                "id": m.id,
                "product_id": m.product_id,
                "product_name": p.name,
                "variant_id": m.variant_id,
                "movement_type": m.movement_type,
                "quantity": m.quantity,
                "reference_type": m.reference_type,
                "reference_id": m.reference_id,
                "notes": m.notes,
                "created_at": m.created_at
            }
            for m, p in rows
        ]

