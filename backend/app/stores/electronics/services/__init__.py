from ..repositories import ElectronicsRepository

class ElectronicsService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return ElectronicsRepository.get_by_id(db, store_id, product_id)
