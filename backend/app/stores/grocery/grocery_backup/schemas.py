from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class GroceryBackupResponse(BaseModel):
    id: int
    store_id: int
    file_url: str
    size: int
    created_at: str

    class Config:
        from_attributes = True


class RestoreBackupRequest(BaseModel):
    backup_data: Dict[str, Any]
