from pydantic import BaseModel
from typing import Optional, List

class ClothingProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class ClothingOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
