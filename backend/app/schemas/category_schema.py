from typing import List, Optional, Any
from pydantic import BaseModel, Field

class CategoryFieldBase(BaseModel):
    field_name: str = Field(..., min_length=1, max_length=100)
    field_label: str = Field(..., min_length=1, max_length=100)
    field_type: str = Field(..., description="text, number, date, select, boolean")
    is_required: bool = False
    options: Optional[List[str]] = None
    default_value: Optional[str] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    display_order: int = 0
    is_variant_field: bool = False

class CategoryFieldCreate(CategoryFieldBase):
    pass

class CategoryFieldUpdate(BaseModel):
    field_label: Optional[str] = None
    field_type: Optional[str] = None
    is_required: Optional[bool] = None
    options: Optional[List[str]] = None
    default_value: Optional[str] = None
    placeholder: Optional[str] = None
    display_order: Optional[int] = None
    is_variant_field: Optional[bool] = None

class CategoryFieldResponse(CategoryFieldBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    icon: Optional[str] = "storefront"

class CategoryCreate(CategoryBase):
    fields: Optional[List[CategoryFieldCreate]] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    is_system: bool = True
    is_active: bool = True

    class Config:
        from_attributes = True

class CategoryDetailResponse(CategoryResponse):
    fields: List[CategoryFieldResponse] = []

