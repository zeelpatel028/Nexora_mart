from typing import List, Optional
from pydantic import BaseModel


class GSTRateResponse(BaseModel):
    id: int
    rate: float

    class Config:
        from_attributes = True


class UnitResponse(BaseModel):
    id: int
    name: str
    short_name: str
    symbol: Optional[str] = None

    class Config:
        from_attributes = True
