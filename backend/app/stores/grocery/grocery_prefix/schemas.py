from typing import Dict, Optional
from pydantic import BaseModel, Field, field_validator


class PrefixItem(BaseModel):
    key: str
    prefix_value: str = Field(..., min_length=2, max_length=5)

    @field_validator("prefix_value")
    @classmethod
    def validate_prefix(cls, v: str) -> str:
        val = v.strip().upper()
        if not val.isalnum():
            raise ValueError("Prefix must contain only letters and numbers")
        return val


class GroceryPrefixesResponse(BaseModel):
    store_id: int
    prefixes: Dict[str, str]


class GroceryPrefixesUpdateRequest(BaseModel):
    prefixes: Dict[str, str]


class IdPreviewResponse(BaseModel):
    store_code: str
    key: str
    prefix: str
    next_id: str
