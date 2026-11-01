from typing import List, Optional
from pydantic import BaseModel, Field
import datetime

class SaleItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    batch_number: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    discount: float = 0.0

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    variant_id: Optional[int] = None
    variant_name: Optional[str] = None
    batch_number: Optional[str] = None
    quantity: float
    unit_price: float
    discount: float
    total_price: float

    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    invoice_number: Optional[str] = None  # Auto-generated if omitted
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    paid_amount: float = 0.0
    payment_method: str = "CASH"  # 'CASH', 'CARD', 'UPI', 'CREDIT'
    notes: Optional[str] = None
    items: List[SaleItemCreate]

class SaleResponse(BaseModel):
    id: int
    store_id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    invoice_number: str
    sale_date: datetime.datetime
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    paid_amount: float
    payment_status: str
    payment_method: str
    notes: Optional[str] = None
    items_count: int = 0

    class Config:
        from_attributes = True

class SaleDetailResponse(SaleResponse):
    items: List[SaleItemResponse] = []

