from typing import Optional, List
from pydantic import BaseModel, Field


class GroceryProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    supplier_id: Optional[int] = None
    purchase_price_with_tax: float = Field(0.0, ge=0)
    purchase_gst_rate: float = Field(0.0, ge=0)
    purchase_unit: str = "Piece"
    selling_price_with_tax: float = Field(0.0, ge=0)
    selling_unit: str = "Piece"
    selling_gst_rate: float = Field(0.0, ge=0)
    available_stock: float = Field(0.0, ge=0)
    low_stock_enabled: bool = False
    low_stock_qty: float = Field(5.0, ge=0)
    expiry_alert_enabled: bool = False


class GroceryProductCreate(GroceryProductBase):
    pass


class GroceryProductUpdate(BaseModel):
    name: Optional[str] = None
    supplier_id: Optional[int] = None
    purchase_price_with_tax: Optional[float] = None
    purchase_gst_rate: Optional[float] = None
    purchase_unit: Optional[str] = None
    selling_price_with_tax: Optional[float] = None
    selling_unit: Optional[str] = None
    selling_gst_rate: Optional[float] = None
    available_stock: Optional[float] = None
    low_stock_enabled: Optional[bool] = None
    low_stock_qty: Optional[float] = None
    expiry_alert_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class GroceryProductResponse(GroceryProductBase):
    id: int
    store_id: int
    product_code: str
    is_active: bool
    supplier_name: Optional[str] = None
    is_low_stock: bool = False
    has_expired_batches: bool = False

    class Config:
        from_attributes = True


class GroceryProductListResponse(BaseModel):
    items: List[GroceryProductResponse]
    total: int
    page: int
    limit: int
