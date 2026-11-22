from sqlalchemy.orm import Session
from app.stores.grocery.grocery_product.models import GroceryProduct

class GroceryRepository:
    @staticmethod
    def get_by_id(db: Session, store_id: int, product_id: str):
        return db.query(GroceryProduct).filter(GroceryProduct.id == product_id, GroceryProduct.store_id == store_id).first()

    @staticmethod
    def list(db: Session, store_id: int, limit: int = 50):
        return db.query(GroceryProduct).filter(GroceryProduct.store_id == store_id).limit(limit).all()
