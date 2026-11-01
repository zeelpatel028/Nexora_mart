"""
NMART Backend Entrypoint
Allows running the server with any of these standard commands from the backend directory:
- uvicorn app.main:app --reload
- uvicorn main:app --reload
- python main.py
"""
import sys
from pathlib import Path

# Add backend directory to path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.main import app, create_application

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

