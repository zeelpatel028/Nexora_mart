from typing import Optional
from pydantic import BaseModel, Field


class GroceryExpenseCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=120)
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    expense_date: Optional[str] = None
    description: Optional[str] = None
    receipt_url: Optional[str] = None


class GroceryPaymentCreate(BaseModel):
    reference_type: str = Field(..., min_length=1, max_length=50)
    reference_id: Optional[int] = None
    reference_code: Optional[str] = None
    amount: float = Field(..., gt=0)
    payment_method: str = "CASH"
    notes: Optional[str] = None
