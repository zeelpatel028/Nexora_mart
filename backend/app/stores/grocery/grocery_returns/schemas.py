from typing import Optional, List, Union
from pydantic import BaseModel, Field


class GroceryReturnItemInput(BaseModel):
    product_id: Union[str, int]
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class GroceryReturnCreate(BaseModel):
    bill_id: Optional[int] = None
    invoice_id: Optional[int] = None
    items: List[GroceryReturnItemInput] = Field(..., min_length=1)
    reason: Optional[str] = "Customer Return"
    refund_method: str = "CASH"
    notes: Optional[str] = None
