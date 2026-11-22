from typing import Optional
from pydantic import BaseModel


class GrocerySettingResponse(BaseModel):
    store_id: int
    theme: str
    language: str
    currency_code: str
    currency_symbol: str
    bill_template_id: str
    bill_sound_enabled: bool
    bill_sound_id: str

    class Config:
        from_attributes = True


class GrocerySettingUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    currency_code: Optional[str] = None
    currency_symbol: Optional[str] = None
    bill_template_id: Optional[str] = None
    bill_sound_enabled: Optional[bool] = None
    bill_sound_id: Optional[str] = None
