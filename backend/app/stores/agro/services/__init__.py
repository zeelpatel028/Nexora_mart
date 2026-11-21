from ..repositories import AgroRepository

class AgroService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return AgroRepository.get_by_id(db, store_id, product_id)
