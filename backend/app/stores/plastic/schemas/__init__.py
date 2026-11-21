from pydantic import BaseModel
from typing import Optional, List

class PlasticProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class PlasticOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
