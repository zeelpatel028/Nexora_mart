from typing import List
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

    class Config:
        from_attributes = True
