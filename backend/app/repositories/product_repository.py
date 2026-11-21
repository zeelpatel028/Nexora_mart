from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.product import Product

class ProductRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(
            Product.id == product_id,
            Product.store_id == store_id,
            Product.is_active == True
        ).first()

    @staticmethod
    def list(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        low_stock_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Product], int]:
        query = db.query(Product).filter(
            Product.store_id == store_id,
            Product.is_active == True
        )
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(Product.name.ilike(term), Product.sku.ilike(term), Product.barcode.ilike(term))
            )
        if low_stock_only:
            query = query.filter(Product.current_stock <= Product.min_stock_level)

        total = query.count()
        products = query.order_by(Product.name).offset(offset).limit(limit).all()
        return products, total
