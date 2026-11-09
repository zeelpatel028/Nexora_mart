import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: float
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "PENDING"
    items: List[OrderItemCreate] = []

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    store_id: int
    order_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    notes: Optional[str] = None
    created_at: datetime.datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

