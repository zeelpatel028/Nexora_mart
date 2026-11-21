from typing import Any, List, Optional
from pydantic import BaseModel

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

def paginate(items: List[Any], total: int, page: int = 1, limit: int = 50) -> dict:
    total_pages = max(1, (total + limit - 1) // limit) if limit > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }
