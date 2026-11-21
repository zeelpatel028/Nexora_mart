from sqlalchemy.orm import Session
from ..models import ElectronicsProduct

class ElectronicsRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(ElectronicsProduct).filter(ElectronicsProduct.id == product_id, ElectronicsProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(ElectronicsProduct).filter(ElectronicsProduct.store_id == store_id).limit(limit).all()
