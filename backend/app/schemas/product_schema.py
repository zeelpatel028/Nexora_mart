from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProductVariantBase(BaseModel):
    name: Optional[str] = "Standard Variant"
    sku: Optional[str] = None
    barcode: Optional[str] = None
    additional_price: float = 0.0
    selling_price: float = 0.0
    attributes: Dict[str, Any] = {}
    stock_quantity: float = 0.0

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int
    is_active: bool

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    purchase_price: float = 0.0
    selling_price: float = Field(..., ge=0)
    mrp: Optional[float] = None
    unit: Optional[str] = "piece"
    min_stock_level: int = 5
    is_active: bool = True
    has_variants: bool = False
    attributes: Dict[str, Any] = {}  # Dynamic category-specific fields

class ProductCreate(ProductBase):
    category_id: Optional[int] = None  # If omitted, defaults to current store's category
    initial_stock: Optional[float] = 0.0
    variants: Optional[List[ProductVariantCreate]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    unit: Optional[str] = None
    min_stock_level: Optional[int] = None
    is_active: Optional[bool] = None
    has_variants: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None
    variants: Optional[List[ProductVariantCreate]] = None

class ProductResponse(ProductBase):
    id: int
    store_id: int
    category_id: int
    current_stock: float = 0.0
    category_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    variants: List[ProductVariantResponse] = []
    category_code: Optional[str] = None
