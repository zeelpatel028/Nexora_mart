import datetime
from typing import Optional, Dict, Any
from ..utils.security import create_access_token, decode_access_token
from ..core.config import settings

def create_store_token(user_id: int, store_id: Optional[int] = None, email: str = "", role: str = "OWNER") -> str:
    """Helper to create standard Tulsi Mart JWT token containing user and store context."""
    data = {
        "sub": str(user_id),
        "user_id": user_id,
        "email": email,
        "store_id": store_id,
        "role": role,
    }
    return create_access_token(data)

__all__ = ["create_access_token", "decode_access_token", "create_store_token"]
