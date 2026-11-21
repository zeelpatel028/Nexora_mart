from ..repositories import ClothingRepository

class ClothingService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return ClothingRepository.get_by_id(db, store_id, product_id)
