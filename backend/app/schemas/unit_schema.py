from pydantic import BaseModel

class UnitResponse(BaseModel):
    id: int
    name: str
    symbol: str
    is_base_unit: bool

    class Config:
        from_attributes = True

