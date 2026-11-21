from typing import Optional, List
from pydantic import BaseModel, Field

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    customer_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    credit_limit: float = 0.0

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    customer_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    credit_limit: Optional[float] = None
    is_active: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int
    store_id: int
    balance: float
    is_active: bool
    total_outstanding: Optional[float] = 0.0
    total_paid: Optional[float] = 0.0
    total_bills: Optional[int] = 0
    transaction_count: Optional[int] = 0
    last_transaction_date: Optional[str] = None

    class Config:
        from_attributes = True

class CustomerPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    payment_date: Optional[str] = None
    notes: Optional[str] = None

class CustomerStatementResponse(BaseModel):
    customer: CustomerResponse
    total_bills_amount: float
    total_paid_amount: float
    outstanding_balance: float
    transactions: List[dict] = []
