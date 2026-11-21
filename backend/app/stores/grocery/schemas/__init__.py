from pydantic import BaseModel
from typing import Optional, List

class GroceryProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class GroceryOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
