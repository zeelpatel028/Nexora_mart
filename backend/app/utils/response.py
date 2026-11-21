from typing import Any, Optional
from fastapi.responses import JSONResponse

def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> dict:
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(detail: str = "An error occurred", status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": detail,
            "detail": detail
        }
    )
