from sqlalchemy.orm import Session
from ..models import HandloomProduct

class HandloomRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(HandloomProduct).filter(HandloomProduct.id == product_id, HandloomProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(HandloomProduct).filter(HandloomProduct.store_id == store_id).limit(limit).all()
