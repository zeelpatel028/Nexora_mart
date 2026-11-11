from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BrandBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: bool = True

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None

class BrandResponse(BrandBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: int
    created_at: Optional[datetime] = None

