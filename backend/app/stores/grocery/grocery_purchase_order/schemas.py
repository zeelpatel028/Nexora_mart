from typing import Optional, List
from pydantic import BaseModel, Field


class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    product_id: int
    qty: float = Field(..., gt=0)
    unit: str = "Piece"
    purchase_price: float = Field(..., ge=0)
    expected_delivery_date: Optional[str] = None


class PurchaseOrderReceiveRequest(BaseModel):
    expiry_date: Optional[str] = None  # Required if product.expiry_alert_enabled is True


class PurchaseOrderPaymentRequest(BaseModel):
    paid: bool = True


class PurchaseOrderResponse(BaseModel):
    id: int
    store_id: int
    order_code: str
    supplier_id: Optional[int]
    supplier_name: Optional[str]
    product_id: Optional[int]
    product_name: Optional[str]
    qty: float
    unit: str
    purchase_price: float
    total_amount: float
    expected_delivery_date: Optional[str]
    status: str
    received_at: Optional[str]
    expiry_date: Optional[str]
    payment_status: str
    paid_at: Optional[str]
    created_at: str
    expiry_alert_enabled: bool = False

    class Config:
        from_attributes = True
