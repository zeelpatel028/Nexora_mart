from pydantic import BaseModel
from typing import Optional, List

class AgroProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class AgroOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
