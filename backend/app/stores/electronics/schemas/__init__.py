from pydantic import BaseModel
from typing import Optional, List

class ElectronicsProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class ElectronicsOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
