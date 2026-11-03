"""
NMART Backend Entrypoint
Production-ready for Render, Docker, and local development.
Supports:
- uvicorn app.main:app --host 0.0.0.0 --port $PORT
- uvicorn main:app --reload
- python main.py
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.main import app, create_application

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_dev = os.environ.get("ENVIRONMENT", "development") == "development"
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)
