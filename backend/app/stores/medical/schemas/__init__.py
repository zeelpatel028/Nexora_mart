from pydantic import BaseModel
from typing import Optional, List

class MedicalProductSchema(BaseModel):
    name: str
    price: float
    stock: float
    unit: str = 'Piece'

class MedicalOrderSchema(BaseModel):
    supplier_id: int
    items: List[dict]
