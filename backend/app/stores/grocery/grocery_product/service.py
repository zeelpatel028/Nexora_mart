import datetime
from typing import Optional, List, Dict, Any, Tuple, Union
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from .models import GroceryProduct, GroceryProductBatch, GroceryStockMovement
from .schemas import GroceryProductCreate, GroceryProductUpdate
from .cache import get_cached_products, set_cached_products, invalidate_products_cache
from ..grocery_supplier.models import GrocerySupplier
from ....utils.id_generator import generate_next_id, preview_next_id


class GroceryProductService:
    @staticmethod
    def preview_id(db: Session, store_id: int) -> str:
        return preview_next_id(db, store_id, "product")

    @staticmethod
    def list_products(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        low_stock_only: bool = False,
        expiring_only: bool = False,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        cache_key = f"{search or ''}:{low_stock_only}:{expiring_only}:{page}:{limit}"
        cached = get_cached_products(store_id, cache_key)
        if cached:
            return cached["items"], cached["total"]

        query = db.query(GroceryProduct).filter(
            GroceryProduct.store_id == store_id,
            GroceryProduct.is_deleted == False
        )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    GroceryProduct.name.ilike(term),
                    GroceryProduct.product_code.ilike(term)
                )
            )

        if low_stock_only:
            query = query.filter(
                GroceryProduct.low_stock_enabled == True,
                GroceryProduct.available_stock <= GroceryProduct.low_stock_qty
            )

        total = query.count()
        offset = (max(page, 1) - 1) * limit
        products = query.order_by(GroceryProduct.id.desc()).offset(offset).limit(limit).all()

        # Fetch supplier names in one query
        supplier_ids = [p.supplier_id for p in products if p.supplier_id]
        supplier_map = {}
        if supplier_ids:
            supps = db.query(GrocerySupplier.id, GrocerySupplier.seller_name, GrocerySupplier.store_name).filter(
                GrocerySupplier.id.in_(supplier_ids)
            ).all()
            for sid, sname, stname in supps:
                supplier_map[sid] = f"{sname} ({stname})" if stname else sname

        results = []
        now = datetime.datetime.now(datetime.timezone.utc)
        for p in products:
            is_low = bool(p.low_stock_enabled and p.available_stock <= p.low_stock_qty)
            results.append({
                "id": p.id,
                "store_id": p.store_id,
                "product_code": p.product_code,
                "name": p.name,
                "supplier_id": p.supplier_id,
                "supplier_name": supplier_map.get(p.supplier_id),
                "purchase_price_with_tax": p.purchase_price_with_tax,
                "purchase_gst_rate": p.purchase_gst_rate,
                "purchase_unit": p.purchase_unit,
                "selling_price_with_tax": p.selling_price_with_tax,
                "selling_unit": p.selling_unit,
                "selling_gst_rate": p.selling_gst_rate,
                "available_stock": p.available_stock,
                "low_stock_enabled": p.low_stock_enabled,
                "low_stock_qty": p.low_stock_qty,
                "expiry_alert_enabled": p.expiry_alert_enabled,
                "is_active": p.is_active,
                "is_low_stock": is_low,
                "has_expired_batches": False
            })

        set_cached_products(store_id, cache_key, {"items": results, "total": total})
        return results, total

    @staticmethod
    def create_product(db: Session, store_id: int, data: GroceryProductCreate) -> GroceryProduct:
        code = generate_next_id(db, store_id, "product")
        product = GroceryProduct(
            store_id=store_id,
            product_code=code,
            name=data.name.strip(),
            product_name=data.name.strip(),
            supplier_id=data.supplier_id,
            purchase_price_with_tax=data.purchase_price_with_tax,
            purchase_gst_rate=data.purchase_gst_rate,
            purchase_unit=data.purchase_unit,
            selling_price_with_tax=data.selling_price_with_tax,
            selling_unit=data.selling_unit,
            selling_gst_rate=data.selling_gst_rate,
            available_stock=data.available_stock,
            low_stock_enabled=data.low_stock_enabled,
            low_stock_qty=data.low_stock_qty,
            expiry_alert_enabled=data.expiry_alert_enabled,
            is_active=True
        )
        db.add(product)
        db.flush()

        # If starting available stock > 0, record initial stock adjustment
        if data.available_stock > 0:
            movement = GroceryStockMovement(
                store_id=store_id,
                product_id=product.id,
                type="adjust",
                qty=data.available_stock,
                ref_id="INITIAL_STOCK"
            )
            db.add(movement)

        db.commit()
        db.refresh(product)
        invalidate_products_cache(store_id)
        return product

    @staticmethod
    def get_product_detail(db: Session, store_id: int, product_id: Union[str, int]) -> dict:
        p = db.query(GroceryProduct).filter(
            GroceryProduct.id == product_id,
            GroceryProduct.store_id == store_id,
            GroceryProduct.is_deleted == False
        ).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        supp_name = None
        if p.supplier_id:
            s = db.query(GrocerySupplier).filter(GrocerySupplier.id == p.supplier_id).first()
            if s:
                supp_name = f"{s.seller_name} ({s.store_name})"

        batches = db.query(GroceryProductBatch).filter(
            GroceryProductBatch.product_id == p.id,
            GroceryProductBatch.store_id == store_id,
            GroceryProductBatch.is_deleted == False
        ).order_by(GroceryProductBatch.received_at.desc()).all()

        return {
            "id": p.id,
            "store_id": p.store_id,
            "product_code": p.product_code,
            "name": p.name,
            "supplier_id": p.supplier_id,
            "supplier_name": supp_name,
            "purchase_price_with_tax": p.purchase_price_with_tax,
            "purchase_gst_rate": p.purchase_gst_rate,
            "purchase_unit": p.purchase_unit,
            "selling_price_with_tax": p.selling_price_with_tax,
            "selling_unit": p.selling_unit,
            "selling_gst_rate": p.selling_gst_rate,
            "available_stock": p.available_stock,
            "low_stock_enabled": p.low_stock_enabled,
            "low_stock_qty": p.low_stock_qty,
            "expiry_alert_enabled": p.expiry_alert_enabled,
            "is_active": p.is_active,
            "is_low_stock": bool(p.low_stock_enabled and p.available_stock <= p.low_stock_qty),
            "batches": [
                {
                    "id": b.id,
                    "qty": b.qty,
                    "remaining_qty": b.remaining_qty,
                    "expiry_date": str(b.expiry_date)[:10] if b.expiry_date else None,
                    "received_at": str(b.received_at)
                } for b in batches
            ]
        }

    @staticmethod
    def update_product(db: Session, store_id: int, product_id: Union[str, int], data: GroceryProductUpdate) -> GroceryProduct:
        p = db.query(GroceryProduct).filter(
            GroceryProduct.id == product_id,
            GroceryProduct.store_id == store_id,
            GroceryProduct.is_deleted == False
        ).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        for key, val in data.dict(exclude_unset=True).items():
            if val is not None:
                setattr(p, key, val)

        p.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(p)
        invalidate_products_cache(store_id)
        return p

    @staticmethod
    def delete_product(db: Session, store_id: int, product_id: Union[str, int]):
        p = db.query(GroceryProduct).filter(
            GroceryProduct.id == product_id,
            GroceryProduct.store_id == store_id
        ).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        p.is_deleted = True
        p.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        invalidate_products_cache(store_id)
        return {"success": True, "message": "Product deleted successfully"}
