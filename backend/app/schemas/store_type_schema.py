from typing import Optional
from pydantic import BaseModel

class StoreTypeResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class StoreTypeCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True

class StoreTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

