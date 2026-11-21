from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from ..models.invoice import Invoice

class InvoiceRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, invoice_id: int) -> Optional[Invoice]:
        return db.query(Invoice).filter(
            Invoice.id == invoice_id,
            Invoice.store_id == store_id
        ).first()

    @staticmethod
    def list(
        db: Session,
        store_id: int,
        customer_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Invoice], int]:
        query = db.query(Invoice).filter(Invoice.store_id == store_id)
        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
        total = query.count()
        invoices = query.order_by(Invoice.id.desc()).offset(offset).limit(limit).all()
        return invoices, total
