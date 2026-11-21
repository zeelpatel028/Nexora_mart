from ..repositories import PlasticRepository

class PlasticService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return PlasticRepository.get_by_id(db, store_id, product_id)
