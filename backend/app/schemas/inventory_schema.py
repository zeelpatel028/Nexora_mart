from typing import Optional, List
from pydantic import BaseModel, Field
import datetime

class InventoryResponse(BaseModel):
    id: int
    store_id: int
    product_id: int
    product_name: str
    product_sku: Optional[str] = None
    category_name: Optional[str] = None
    variant_id: Optional[int] = None
    variant_name: Optional[str] = None
    quantity: float
    reorder_level: float
    unit: str = "piece"
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime.datetime] = None
    is_low_stock: bool = False
    is_expired: bool = False
    is_expiring_soon: bool = False

    class Config:
        from_attributes = True

class StockInRequest(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: float = Field(..., gt=0)
    unit_cost: Optional[float] = 0.0
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    notes: Optional[str] = "Stock In"

class StockOutRequest(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: float = Field(..., gt=0)
    reason: str = Field(..., description="DAMAGED, EXPIRED, THEFT, CORRECTION, etc.")
    notes: Optional[str] = None

class StockAdjustRequest(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    actual_quantity: float = Field(..., ge=0)
    notes: Optional[str] = "Physical audit count adjustment"

class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    variant_id: Optional[int] = None
    movement_type: str
    quantity: float
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

