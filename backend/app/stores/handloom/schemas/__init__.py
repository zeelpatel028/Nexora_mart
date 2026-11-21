from pydantic import BaseModel
from typing import Optional, List

class HandloomProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class HandloomOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
