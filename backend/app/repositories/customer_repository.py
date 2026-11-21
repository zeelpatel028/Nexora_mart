from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.partner import Customer

class CustomerRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, customer_id: int) -> Optional[Customer]:
        return db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.store_id == store_id,
            Customer.is_active == True
        ).first()

    @staticmethod
    def list(
        db: Session,
        store_id: int,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Customer], int]:
        query = db.query(Customer).filter(
            Customer.store_id == store_id,
            Customer.is_active == True
        )
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(Customer.name.ilike(term), Customer.phone.ilike(term), Customer.email.ilike(term))
            )
        total = query.count()
        customers = query.order_by(Customer.name).offset(offset).limit(limit).all()
        return customers, total
