from fastapi import HTTPException, status

class StoreAccessDeniedException(HTTPException):
    def __init__(self, detail: str = "Access forbidden: Store data isolation violation"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class EntityNotFoundException(HTTPException):
    def __init__(self, entity: str = "Record", detail: str = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail or f"{entity} not found or does not belong to your store."
        )

class InsufficientStockException(HTTPException):
    def __init__(self, product_name: str, available: float, requested: float):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for '{product_name}'. Available: {available}, Requested: {requested}."
        )

class DuplicateEntityException(HTTPException):
    def __init__(self, detail: str = "Duplicate record already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class InvalidOperationException(HTTPException):
    def __init__(self, detail: str = "Invalid operation requested"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
