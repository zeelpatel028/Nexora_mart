import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class PurchaseOrderItemCreate(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = "Piece"
    purchase_price: float = Field(..., ge=0)
    gst_rate: Optional[float] = 0.0

class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: str
    product_name: str
    quantity: float
    received_quantity: float
    unit: str
    purchase_price: float
    gst_rate: float
    total_amount: float
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseOrderItemCreate] = Field(..., min_length=1)
    expected_delivery_date: Optional[datetime.datetime] = None
    notes: Optional[str] = None

class PurchaseOrderReceiveRequest(BaseModel):
    received_quantity: float = Field(..., gt=0)
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime.datetime] = None
    notes: Optional[str] = None

class PurchaseOrderPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    payment_date: Optional[datetime.datetime] = None
    notes: Optional[str] = None

class PurchaseOrderResponse(BaseModel):
    id: int
    store_id: int
    order_number: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    order_date: datetime.datetime
    expected_delivery_date: Optional[datetime.datetime] = None
    total_amount: float
    paid_amount: float
    order_status: str  # Pending, Ordered, Partially Received, Received, Cancelled
    payment_status: str # Pending, Partially Paid, Paid
    notes: Optional[str] = None
    items: List[PurchaseOrderItemResponse] = []

    class Config:
        from_attributes = True
