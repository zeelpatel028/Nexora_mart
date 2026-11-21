from ..repositories import GroceryRepository

class GroceryService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return GroceryRepository.get_by_id(db, store_id, product_id)
