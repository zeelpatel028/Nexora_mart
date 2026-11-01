from typing import List, Optional
from pydantic import BaseModel, Field
import datetime

class PurchaseItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit_cost: float = Field(..., ge=0)

class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    variant_id: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime.datetime] = None
    quantity: float
    unit_cost: float
    total_cost: float

    class Config:
        from_attributes = True

class PurchaseCreate(BaseModel):
    supplier_id: Optional[int] = None
    invoice_number: str = Field(..., min_length=1)
    purchase_date: Optional[str] = None
    paid_amount: float = 0.0
    payment_method: str = "CASH"
    notes: Optional[str] = None
    items: List[PurchaseItemCreate]

class PurchaseResponse(BaseModel):
    id: int
    store_id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    invoice_number: str
    purchase_date: datetime.datetime
    total_amount: float
    paid_amount: float
    payment_status: str
    payment_method: str
    notes: Optional[str] = None
    items_count: int = 0

    class Config:
        from_attributes = True

class PurchaseDetailResponse(PurchaseResponse):
    items: List[PurchaseItemResponse] = []

