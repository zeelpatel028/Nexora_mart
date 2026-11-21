from ..repositories import HandloomRepository

class HandloomService:
    @staticmethod
    def get_product(db, store_id: int, product_id: str):
        return HandloomRepository.get_by_id(db, store_id, product_id)
