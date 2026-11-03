# 🚀 Deploying Nexora Mart FastAPI Backend on Render

This guide explains how to deploy the backend on [Render](https://render.com) using either:
- **Option A (Recommended)**: Setting Root Directory to `backend`
- **Option B**: Setting Root Directory to `backend/app`
- **Option C**: Using Render Blueprint (`render.yaml` — 1-click automatic setup)

---

## Option A (Recommended): Root Directory = `backend`

1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your Git repository (`Nexora/Nmart`).
3. Fill in the service configuration:
   - **Name**: `nmart-backend`
   - **Region**: Select your closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
     *(Or multi-worker production)*:
     ```bash
     gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT
     ```

4. Under **Health Check Path**, enter:
   ```text
   /health
   ```

5. Under **Environment Variables**, add:
   | Key | Example Value | Description |
   |---|---|---|
   | `ENVIRONMENT` | `production` | Enables production settings |
   | `PROJECT_NAME` | `NMART API` | API service branding |
   | `SECRET_KEY` | *(Click "Generate")* | Strong random key for JWT auth |
   | `ALGORITHM` | `HS256` | JWT signing algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES`| `1440` | Token expiration (24h) |
   | `DATABASE_URL` | `sqlite:///./nmart.db` | Or paste Render PostgreSQL URL |
   | `ALLOWED_ORIGINS` | `https://*.onrender.com,http://localhost:5173` | Allowed frontend domains |
   | `REDIS_ENABLED` | `false` | Set `false` unless using Redis |

6. Click **Create Web Service**. Render will build and deploy your API!

---

## Option B: Root Directory = `backend/app`

If you configure **Root Directory** as `backend/app` on Render:
- **Root Directory**: `backend/app`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- **Health Check Path**: `/health`
- **Environment Variables**: Same as Option A.

---

## Option C: Automatic 1-Click Setup with `render.yaml`

If you use Render Blueprints:
1. Click **New +** → **Blueprint**.
2. Select your repository. Render will automatically detect [`render.yaml`](file:///d:/Nexora/Nmart/render.yaml) at the repository root and provision the service with all settings pre-configured!

---

## Verifying Deployment

Once deployed, your service URL will be something like:
`https://nmart-backend.onrender.com`

Test the endpoints in your browser or curl:
- **Health check**: `https://nmart-backend.onrender.com/health` → `{"status": "healthy"}`
- **Interactive Swagger Docs**: `https://nmart-backend.onrender.com/docs`
- **Analytics Overview**: `https://nmart-backend.onrender.com/api/reports/analytics-overview`

