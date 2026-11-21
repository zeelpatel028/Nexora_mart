import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class InvoiceItemCreate(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = "Piece"
    selling_price: float = Field(..., ge=0)
    gst_rate: Optional[float] = 0.0

class InvoiceItemResponse(BaseModel):
    id: int
    product_id: str
    product_name: Optional[str] = None
    quantity: float
    unit: str
    selling_price: float
    gst_rate: float
    taxable_amount: float
    gst_amount: float
    total_amount: float

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_type: str = "WALK_IN"  # "WALK_IN" or "KHATA"
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    items: List[InvoiceItemCreate] = Field(..., min_length=1)
    discount_amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0
    payment_method: Optional[str] = "CASH"
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: int
    store_id: int
    invoice_number: str
    invoice_date: datetime.datetime
    customer_id: Optional[int] = None
    customer_type: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    subtotal: float
    taxable_amount: float
    gst_amount: float
    discount_amount: float
    total_amount: float
    paid_amount: float
    pending_amount: float
    payment_status: str  # PAID, PARTIAL, UNPAID
    payment_method: str
    notes: Optional[str] = None
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    store_gst: Optional[str] = None
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True
