from typing import Optional, List
from pydantic import BaseModel, Field

class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    supplier_code: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    supplier_code: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    is_active: Optional[bool] = None

class SupplierResponse(SupplierBase):
    id: int
    store_id: int
    balance: float
    is_active: bool
    total_orders_count: Optional[int] = 0
    total_purchase_amount: Optional[float] = 0.0
    pending_payment_amount: Optional[float] = 0.0

    class Config:
        from_attributes = True

class SupplierPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    payment_date: Optional[str] = None
    notes: Optional[str] = None

class SupplierStatementResponse(BaseModel):
    supplier: SupplierResponse
    total_purchases_amount: float
    total_paid_amount: float
    pending_balance: float
    orders: List[dict] = []
    payments: List[dict] = []
