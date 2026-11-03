"""
Nexora Mart - Root Entrypoint for Render / Hosting Platforms
Allows 'uvicorn main:app --host 0.0.0.0 --port $PORT' to execute
whether Render's Root Directory is set to repo root or 'backend'.
"""
import os
import sys
from pathlib import Path

_ROOT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _ROOT_DIR / "backend"

if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from backend.main import app, create_application  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_dev = os.environ.get("ENVIRONMENT", "development") == "development"
    uvicorn.run("backend.main:app", host=host, port=port, reload=is_dev)

