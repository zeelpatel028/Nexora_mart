from sqlalchemy.orm import Session
from ..models import AgroProduct

class AgroRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(AgroProduct).filter(AgroProduct.id == product_id, AgroProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(AgroProduct).filter(AgroProduct.store_id == store_id).limit(limit).all()
