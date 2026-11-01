from typing import Optional
from pydantic import BaseModel, Field
import datetime

class ExpenseBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    expense_date: Optional[str] = None
    description: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    store_id: int
    expense_date: datetime.datetime

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    reference_type: str = Field(..., description="SALE, PURCHASE, CUSTOMER_CREDIT")
    reference_id: Optional[int] = None
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    store_id: int
    reference_type: str
    reference_id: Optional[int] = None
    amount: float
    payment_method: str
    transaction_date: datetime.datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

