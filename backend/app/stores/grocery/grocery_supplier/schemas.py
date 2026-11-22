from typing import Optional, List
from pydantic import BaseModel, EmailStr


class GrocerySupplierBase(BaseModel):
    store_name: str
    seller_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_holder: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    upi_id: Optional[str] = None


class GrocerySupplierCreate(GrocerySupplierBase):
    pass


class GrocerySupplierUpdate(BaseModel):
    store_name: Optional[str] = None
    seller_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_holder: Optional[str] = None
    account_number: Optional[str] = None
    ifsc: Optional[str] = None
    upi_id: Optional[str] = None


class GrocerySupplierResponse(GrocerySupplierBase):
    id: int
    store_id: int
    supplier_code: str
    is_active: bool
    total_orders_count: int = 0
    total_purchase_amount: float = 0.0
    pending_payment_amount: float = 0.0

    class Config:
        from_attributes = True


class GrocerySupplierDashboard(BaseModel):
    total_suppliers: int
    total_pending_orders: int
    total_pending_payments: float
    total_purchase_amount: float
