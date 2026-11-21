from ..repositories import FurnitureRepository

class FurnitureService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return FurnitureRepository.get_by_id(db, store_id, product_id)
