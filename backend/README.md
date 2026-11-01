# NMART Backend API

FastAPI application providing secure RESTful API endpoints for the NMART Merchant Platform.

## Architecture

- **`app/routes/`**: API Route definitions and endpoint mappings.
- **`app/controllers/`**: HTTP Request validation, status codes, and response serialization.
- **`app/services/`**: Core business logic and database interactions.
- **`app/models/`**: SQLAlchemy database ORM models.
- **`app/schemas/`**: Pydantic input/output validation models.
- **`app/database/`**: Database engine and session lifecycle management.
- **`app/middleware/`**: CORS configuration and JWT Bearer authentication guards.
- **`app/utils/`**: Password hashing (bcrypt) and JWT token generation.
- **`app/core/`**: Centralized environment configuration and settings.

## Setup Instructions

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # Windows PowerShell
   .venv\Scripts\Activate.ps1
   # macOS/Linux
   source .venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   copy .env.example .env
   ```

4. **Run the development server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **API Documentation**:
   - Swagger Interactive UI: `http://localhost:8000/docs`
   - ReDoc UI: `http://localhost:8000/redoc`
