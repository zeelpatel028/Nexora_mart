# Tulsi Mart – Backend Deployment Guide

## 1. Deployment Stack
- **API Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn ASGI Server with multiple workers
- **Cloud Hosting**: Render Web Service
- **Database**: Aiven Cloud Managed PostgreSQL with SSL
- **ORM & Migrations**: SQLAlchemy 2.0 & Alembic

---

## 2. Environment Configuration
Create a `.env` file on Render or production host:
```bash
# Application Environment
ENVIRONMENT=production
DEBUG=false
APP_NAME="Tulsi Mart API"

# Security
SECRET_KEY="<generate_strong_64_char_secret_key>"
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# Aiven Cloud PostgreSQL Connection
DATABASE_URL=postgresql://avnadmin:<password>@<host>:<port>/defaultdb?sslmode=require

# CORS Settings
ALLOWED_ORIGINS="*"
```

---

## 3. Render Build & Start Commands
- **Build Command**:
  ```bash
  pip install -r backend/requirements.txt && cd backend && alembic upgrade head
  ```
- **Start Command**:
  ```bash
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
  ```

---

## 4. Health Check Endpoint
- Health Check URL: `GET /health` or `GET /api/v1/health`
- Response: `{"status": "healthy", "service": "tulsi-mart-api", "version": "2.0.0"}`
