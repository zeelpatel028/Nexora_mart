from typing import Optional
from pydantic import BaseModel, Field
from .category_schema import CategoryResponse

class StoreBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    tax_number: Optional[str] = None
    currency: str = "USD"

class StoreCreate(StoreBase):
    category_id: int

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    tax_number: Optional[str] = None
    currency: Optional[str] = None

class StoreResponse(StoreBase):
    id: int
    category_id: int
    owner_id: int
    is_active: bool
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

