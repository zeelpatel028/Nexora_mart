from ..repositories import MedicalRepository

class MedicalService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return MedicalRepository.get_by_id(db, store_id, product_id)
