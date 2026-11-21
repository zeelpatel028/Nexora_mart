from pydantic import BaseModel
from typing import Optional, List

class FurnitureProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class FurnitureOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
