# 🚀 Deploying Nexora Mart FastAPI Backend on Render

This guide outlines the production deployment setup for **Nexora Mart** on [Render](https://render.com) connecting to **Aiven Cloud MySQL** and serving **Vercel React Frontend**.

---

## 1. Key Production Settings for Render

### Service Configuration
* **Name**: `nexora-mart` (or your chosen name)
* **Region**: Select your closest region (e.g., Singapore, Frankfurt, Oregon)
* **Branch**: `main`
* **Root Directory**: `backend` *(Recommended)* OR leave empty (both are supported)
* **Runtime**: `Python 3`
* **Python Version**: `3.11.9` (Explicitly pinned via `.python-version` & `runtime.txt`)
* **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
* **Start Command**:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
* **Health Check Path**:
  ```text
  /
  ```
  *(Both `GET /` and `HEAD /` return `{"status": "success", "message": "Nexora Mart API Running"}` with HTTP 200 OK)*

---

## 2. Required Render Environment Variables

In your Render Dashboard (**Environment** tab), add the following environment variables:

| Variable Name | Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Prevents Render from picking experimental Python versions |
| `ENVIRONMENT` | `production` | Enables production security mode |
| `PROJECT_NAME` | `NMART API` | API Service Name |
| `API_V1_PREFIX` | `/api` | Base API routing prefix |
| `SECRET_KEY` | *(Your Secure JWT Secret)* | Secure random string for JWT authentication |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24-hour token expiration |
| `DATABASE_URL` | `mysql+pymysql://avnadmin:<PASSWORD>@tulsi-mart-08-zeelptl028-e556.e.aivencloud.com:18925/defaultdb` | Aiven Cloud MySQL connection string |
| `DB_SSL_MODE` | `REQUIRED` | Enforces SSL encryption with Aiven Cloud |
| `ALLOWED_ORIGINS` | `https://nexora-mart.vercel.app,https://nexora-mart-i996.onrender.com,http://localhost:5173,http://localhost:3000` | Allowed frontend domains |
| `REDIS_ENABLED` | `false` *(or `true` if using Upstash)* | Redis in-memory cache toggle |
| `REDIS_URL` | `rediss://default:<TOKEN>@accepted-stinkbug-193374.upstash.io:6379` | Optional Upstash Redis endpoint |

---

## 3. Deployment Issues Fixed

### Issue 1: `HEAD / HTTP/1.1` 405 Method Not Allowed
* **Root Cause**: Render's container health check issues an HTTP `HEAD /` probe. Standard `@app.get("/")` only accepted `GET`, returning `405 Method Not Allowed`.
* **Fix**: Added `@app.head("/", include_in_schema=False)` and `@app.head("/health", include_in_schema=False)` returning `200 OK` with `{"status": "success", "message": "Nexora Mart API Running"}`.

### Issue 2: `No open ports detected, continuing to scan...`
* **Root Cause**: The application previously bound to `127.0.0.1` (localhost only) or missed dynamic `$PORT` expansion.
* **Fix**: Set entrypoint to listen on `--host 0.0.0.0 --port $PORT` and provided root/backend `main:app` delegators so the server binds to `0.0.0.0` on Render's dynamic port.

### Issue 3: Python 3.14 Version Incompatibility
* **Root Cause**: Render defaulting to experimental Python versions where pre-compiled wheels for `cryptography`, `pydantic-core`, and `bcrypt` fail to build.
* **Fix**: Pinned `3.11.9` across `.python-version`, `runtime.txt`, and `render.yaml`.

### Issue 4: Vercel Frontend CORS
* **Root Cause**: Mismatched or missing CORS origins when making cross-origin requests from Vercel to Render.
* **Fix**: Configured `CORSMiddleware` with regex `^https://([a-zA-Z0-9_-]+\.)*(vercel\.app|onrender\.com)$`, full HTTP methods `GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD`, and `allow_credentials=True`.

---

## 4. Verifying Your Live Deployment

Once deployed to Render:
1. **Health Check**:
   ```bash
   curl -I https://nexora-mart-i996.onrender.com/
   ```
   *Expected: HTTP/1.1 200 OK*

2. **JSON Root Status**:
   ```bash
   curl https://nexora-mart-i996.onrender.com/
   ```
   *Expected:*
   ```json
   {
       "status": "success",
       "message": "Nexora Mart API Running",
       "service": "NMART API",
       "version": "2.0.0",
       "environment": "production",
       "docs_url": "/docs",
       "redoc_url": "/redoc"
   }
   ```

3. **Interactive Swagger Documentation**:
   Visit `https://nexora-mart-i996.onrender.com/docs` in your browser.
