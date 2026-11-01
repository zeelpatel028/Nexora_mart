from typing import Optional
from pydantic import BaseModel, Field, EmailStr

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    credit_limit: float = 0.0

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
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

    class Config:
        from_attributes = True


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    is_active: Optional[bool] = None

class SupplierResponse(SupplierBase):
    id: int
    store_id: int
    balance: float
    is_active: bool

    class Config:
        from_attributes = True

