from typing import Optional, List
from pydantic import BaseModel, Field


class BillItemInput(BaseModel):
    product_id: int
    product_name: str
    price_with_tax: float = Field(..., ge=0)
    gst_rate: float = Field(0.0, ge=0)
    unit: str = "Piece"
    qty: float = Field(..., gt=0)


class MakeBillRequest(BaseModel):
    customer_type: str = "walk_in"  # 'walk_in' | 'khata'
    customer_id: Optional[int] = None
    walk_in_name: Optional[str] = "Walk-in Customer"
    walk_in_phone: Optional[str] = None
    walk_in_address: Optional[str] = None
    template_id: Optional[str] = "modern_orange"
    items: List[BillItemInput] = Field(..., min_length=1)


class BillItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    price_with_tax: float
    base_price: float
    gst_rate: float
    tax_amount: float
    unit: str
    qty: float
    line_total: float

    class Config:
        from_attributes = True


class BillResponse(BaseModel):
    id: int
    store_id: int
    invoice_code: str
    customer_type: str
    customer_id: Optional[int]
    customer_name: Optional[str]
    customer_phone: Optional[str]
    walk_in_name: Optional[str]
    walk_in_phone: Optional[str]
    subtotal: float
    total_tax: float
    grand_total: float
    payment_status: str
    paid_at: Optional[str]
    template_id: str
    created_at: str
    items: List[BillItemResponse] = []

    class Config:
        from_attributes = True
