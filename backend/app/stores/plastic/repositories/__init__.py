from sqlalchemy.orm import Session
from ..models import PlasticProduct

class PlasticRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(PlasticProduct).filter(PlasticProduct.id == product_id, PlasticProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(PlasticProduct).filter(PlasticProduct.store_id == store_id).limit(limit).all()
