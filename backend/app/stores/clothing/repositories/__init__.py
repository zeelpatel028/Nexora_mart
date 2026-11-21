from sqlalchemy.orm import Session
from ..models import ClothingProduct

class ClothingRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(ClothingProduct).filter(ClothingProduct.id == product_id, ClothingProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(ClothingProduct).filter(ClothingProduct.store_id == store_id).limit(limit).all()
