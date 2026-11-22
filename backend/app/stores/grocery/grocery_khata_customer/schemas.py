from typing import Optional, List
from pydantic import BaseModel, Field


class GroceryCustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=5, max_length=50)
    address: Optional[str] = None


class GroceryCustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class GroceryCustomerResponse(BaseModel):
    id: int
    store_id: int
    customer_code: str
    name: str
    phone: str
    address: Optional[str]
    is_active: bool
    total_bills_count: int = 0
    total_bill_amount: float = 0.0
    pending_bill_count: int = 0
    pending_bill_amount: float = 0.0

    class Config:
        from_attributes = True


class GroceryCustomerDashboard(BaseModel):
    total_customers: int
    total_pending_bills: int
    total_pending_amount: float


class CustomerPaymentPayload(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"  # CASH, UPI, CARD, BANK
    notes: Optional[str] = None
