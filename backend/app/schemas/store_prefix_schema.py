from typing import Optional
from pydantic import BaseModel, Field

class StorePrefixBase(BaseModel):
    invoice_prefix: str = Field("INV", max_length=20)
    debit_customer_prefix: str = Field("DC", max_length=20)
    walk_in_customer_prefix: str = Field("WC", max_length=20)
    supplier_prefix: str = Field("SUP", max_length=20)
    order_prefix: str = Field("ORD", max_length=20)
    product_prefix: str = Field("PRD", max_length=20)
    employee_prefix: str = Field("EMP", max_length=20)
    return_prefix: str = Field("RET", max_length=20)
    refund_prefix: str = Field("REF", max_length=20)
    expense_prefix: str = Field("EXP", max_length=20)

class StorePrefixUpdate(BaseModel):
    invoice_prefix: Optional[str] = None
    debit_customer_prefix: Optional[str] = None
    walk_in_customer_prefix: Optional[str] = None
    supplier_prefix: Optional[str] = None
    order_prefix: Optional[str] = None
    product_prefix: Optional[str] = None
    employee_prefix: Optional[str] = None
    return_prefix: Optional[str] = None
    refund_prefix: Optional[str] = None
    expense_prefix: Optional[str] = None

class StorePrefixResponse(StorePrefixBase):
    id: int
    store_id: int

    class Config:
        from_attributes = True
