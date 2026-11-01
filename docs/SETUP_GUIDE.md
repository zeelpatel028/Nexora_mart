# NMART Local Setup & Developer Guide

Follow this guide to set up, run, test, and deploy the NMART project.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher (for backend)

---

## 1. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:5173`

4. **Run code quality checks**:
   ```bash
   npm run lint
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 2. Backend Setup (Optional for Full-Stack)

The frontend works out-of-the-box in standalone mode with realistic simulated auth responses. To enable the persistent Python FastAPI backend:

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Copy environment variables**:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env      # macOS/Linux
   ```

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive Swagger documentation: `http://localhost:8000/docs`

6. **Default Demo Merchant Account**:
   - **Email**: `demo@nmart.com`
   - **Password**: `password123`
   *(Or click "Create Account" on the frontend to register any custom merchant store)*

---

## 3. Environment Variables Reference

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:8000/api` |

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Project name displayed in Swagger | `NMART API` |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./nmart.db` |
| `SECRET_KEY` | JWT signing secret | `nmart_development_super_secret_jwt_key_2026` |
| `ALLOWED_ORIGINS`| Permitted CORS domains | `http://localhost:5173,http://localhost:3000` |

---

## 4. Production Deployment

### Frontend (Static SPA hosting on Vercel, Netlify, Cloudflare Pages)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Fallback**: Ensure routing rewrites `/index.html` for all paths.

### Backend (Docker, Render, AWS, Railway)
- Use standard ASGI runner:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
