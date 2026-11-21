from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.partner import Supplier

class SupplierRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, supplier_id: int) -> Optional[Supplier]:
        return db.query(Supplier).filter(
            Supplier.id == supplier_id,
            Supplier.store_id == store_id,
            Supplier.is_active == True
        ).first()

    @staticmethod
    def list(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Supplier], int]:
        query = db.query(Supplier).filter(
            Supplier.store_id == store_id,
            Supplier.is_active == True
        )
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(Supplier.name.ilike(term), Supplier.company_name.ilike(term), Supplier.phone.ilike(term))
            )
        total = query.count()
        suppliers = query.order_by(Supplier.name).offset(offset).limit(limit).all()
        return suppliers, total
