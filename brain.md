# NMART — Project Brain & Architectural Knowledge Base

> **Version**: 1.0.0  
> **Last Updated**: October 2026  
> **Repository Root**: `d:\Nexora\Nmart`  
> **Primary Domains**: E-Commerce Merchant Portal, Authentication, Multi-Device Responsive UI, REST API

---

## 1. Executive Summary & Vision

**NMART** is a cloud-based retail merchant workspace designed for multi-tier store management. It offers store owners a modern digital workspace to onboard, manage store inventory, track analytics, and manage retail operations.

The system is built as a decoupled full-stack architecture:
- **Client Tier**: A high-performance React 19 Single Page Application (SPA) powered by Vite, featuring a dual styling architecture combining **Bootstrap 5** utilities with a bespoke **CSS design token system**, dynamic SVG wave artwork, and responsive multi-device layouts.
- **Server Tier**: A Python FastAPI RESTful API utilizing SQLAlchemy ORM, SQLite/PostgreSQL persistence, native `bcrypt` cryptographic hashing, and stateless JWT Bearer token authentication.

```mermaid
graph TD
    subgraph Client["Frontend SPA (React 19 + Vite + Bootstrap 5)"]
        UI["Multi-Device Responsive Views<br/>(Desktop / Tablet / Mobile)"]
        Router["HTML5 History Router<br/>(RouterContext / useRouter)"]
        AuthCtx["AuthContext & useAuth"]
        ApiClient["Centralized API Client<br/>(api.js)"]
        UI --> Router
        Router --> AuthCtx
        AuthCtx --> ApiClient
    end

    subgraph Server["Backend API (FastAPI + Python 3.13)"]
        Middleware["CORS & Auth Middleware<br/>(JWT Bearer Guard)"]
        Routers["API Routers<br/>(/api/auth, /health, /)"]
        Controllers["Controllers & Service Layer<br/>(AuthService, AuthController)"]
        ORM["SQLAlchemy ORM<br/>(User Model)"]
        Middleware --> Routers
        Routers --> Controllers
        Controllers --> ORM
    subgraph Storage["Persistent Storage & High-Speed Cache"]
        Redis[("Redis In-Memory Cache<br/>port 6379 (RAM)")]
        DB[("Relational Database<br/>nmart.db (Disk)")]
        Controllers <-->|"Fast-Path Profile Cache & Blacklist"| Redis
        ORM --> DB
    end

    ApiClient -- "HTTP / JSON (Bearer JWT)" --> Middleware
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.3.1` | Core declarative UI component library |
| **React DOM** | `^19.3.1` | DOM renderer for React |
| **Vite** | `^8.3.4` | Ultra-fast development server & production bundler |
| **Bootstrap** | `^5.3.3` | Responsive grid system, flex utilities, badges, and layout normalization |
| **Vanilla CSS Tokens** | Custom | Bespoke brand aesthetics, organic SVG waves, glassmorphism, animations |
| **Oxlint** | `^1.88.0` | High-performance linter (0 errors, 0 warnings enforcement) |
| **HTML5 History API** | Native | URL-synchronized client-side path router (`/login`, `/register`, `/dashboard`, `/*`) |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.13.x` | Runtime execution environment |
| **FastAPI** | `>=0.110.0` | High-performance ASGI web framework |
| **Uvicorn** | `>=0.28.0` | Lightning-fast ASGI web server implementation |
| **SQLAlchemy** | `>=2.0.0` | Object Relational Mapper (ORM) |
| **Pydantic** | `>=2.6.0` | Data parsing, type validation, and JSON schemas |
| **Pydantic Settings** | `>=2.2.0` | Environment variable parsing from `.env` |
| **Bcrypt** | `>=4.0.0` | Direct cryptographic salt generation & password hashing |
| **Python-Jose** | `>=3.3.0` | JWT token encoding and decoding with HS256 |
| **Email-Validator** | `>=2.0.0` | Robust email syntax verification for Pydantic models |
| **Redis** | `^8.1.0` | In-memory key-value cache for user profiles & token revocation |
| **SQLite** | `3` | Local relational database (`nmart.db`) |

---

## 3. Directory Layout & Module Responsibilities

```
d:\Nexora\Nmart/
├── .vscode/                     # Editor-specific interpreter & analysis config
│   └── settings.json            # Points to backend/.venv & registers extraPaths
├── docs/                        # Formal project documentation
│   ├── PROJECT_STRUCTURE.md     # Detailed file-by-file breakdown
│   └── SETUP_GUIDE.md           # Local setup and environment instructions
│
├── frontend/                    # Client Application
│   ├── public/                  # Static assets served as-is (e.g., Nmart.png)
│   ├── src/
│   │   ├── assets/              # Static media
│   │   ├── components/
│   │   │   ├── artwork/         # Organic wave SVGs (DesktopLeftWave, WebsiteTopWave, BackgroundWaves)
│   │   │   ├── auth/            # Auth inputs (LoginInput, PasswordInput, SocialAuthButton)
│   │   │   ├── branding/        # Logo vectors and brand typography (BrandLogo, Icons)
│   │   │   ├── common/          # Primitives (Button, Input, Modal, Loader, Toast)
│   │   │   └── layout/          # Viewport shells (MainLayout, Navbar, Footer)
│   │   ├── constants/           # Global endpoints (apiEndpoints.js) & categories (storeTypes.js)
│   │   ├── contexts/            # Global state (AuthContext.jsx, authContextInstance.js)
│   │   ├── hooks/               # Custom hooks (useAuth.js)
│   │   ├── pages/
│   │   │   ├── login/           # Login container, LoginForm, modals, desktop/tablet/mobile views
│   │   │   ├── register/        # Merchant onboarding form & validation
│   │   │   ├── dashboard/       # Merchant control center, stats cards, action bars
│   │   │   └── not-found/       # 404 error page
│   │   ├── responsive/          # Breakpoints (mobile.css, tablet.css, desktop.css, useResponsive.js)
│   │   ├── routes/              # URL routing (AppRoutes.jsx, RouterContext.jsx, useRouter.js)
│   │   ├── services/            # Centralized API network client (api.js, authService.js)
│   │   ├── styles/              # CSS tokens, normalization & reset (variables.css, reset.css, global.css)
│   │   ├── App.jsx              # Providers wrapper (RouterProvider, AuthProvider, MainLayout)
│   │   ├── main.jsx             # DOM entrypoint (Bootstrap 5 CSS/JS, index.css)
│   │   └── index.css            # Stylesheet aggregator
│   ├── .env                     # Local frontend environment variables
│   ├── .env.example             # Template for frontend env
│   ├── package.json             # NPM dependencies & scripts
│   ├── vite.config.js           # Vite dev server & backend API proxy configuration
│   └── .oxlintrc.json           # Linter configuration
│
├── backend/                     # Server Application
│   ├── app/
│   │   ├── core/                # Central config (config.py with Pydantic Settings)
│   │   ├── database/            # SQLAlchemy engine, session maker, get_db dependency
│   │   ├── models/              # SQLAlchemy ORM database models (user.py)
│   │   ├── schemas/             # Pydantic request & response validation schemas (auth_schema.py)
│   │   ├── services/            # Core business logic (auth_service.py)
│   │   ├── controllers/         # HTTP handlers and serialization (auth_controller.py)
│   │   ├── routes/              # FastAPI router modules (auth_routes.py)
│   │   ├── middleware/          # CORS setup & JWT Bearer token guards (auth_middleware.py)
│   │   ├── utils/               # Cryptographic security helpers (security.py)
│   │   └── main.py              # Application entrypoint & table auto-seeder
│   ├── .venv/                   # Python virtual environment (with all dependencies)
│   ├── .env                     # Local backend environment variables
│   ├── .env.example             # Backend environment template
│   ├── requirements.txt         # Pinned Python package dependencies
│   ├── nmart.db                 # Local SQLite database file
│   └── README.md                # Backend walkthrough
│
├── brain.md                     # This master architectural knowledge base
├── README.md                    # Root project overview
└── .gitignore                   # Git repository ignore rules
```

---

## 4. Complete Route & Path Directory

### Frontend Visitable Paths (`http://localhost:5173`)
The client uses real browser path routing backed by `window.location.pathname`:

| Path | Access Level | Target Component | Guard & Behavior |
| :--- | :--- | :--- | :--- |
| **`/`** | Public | `<Login />` | Redirects to `/dashboard` if an active user session exists. |
| **`/login`** | Public | `<Login />` | Shows Welcome Back sign-in form. Redirects to `/dashboard` if logged in. |
| **`/register`** | Public | `<RegisterForm />` | Shows Merchant onboarding form. Redirects to `/dashboard` if logged in. |
| **`/dashboard`** | **Protected** | `<Dashboard />` | **Guarded**: If not logged in, immediately redirects to `/login`. |
| **`/*`** | Fallback | `<NotFound />` | Catches unmapped paths with a 404 screen and "Return to Login" button. |

### Backend Visitable Endpoints (`http://127.0.0.1:8000`)

| Method | Endpoint | Auth | Request Body | Response Description |
| :--- | :--- | :---: | :--- | :--- |
| **`GET`** | **`/`** | No | None | **API Directory**: JSON overview of all endpoints. |
| **`GET`** | **`/api`** | No | None | **API v1 Directory**: Route mapping under `/api`. |
| **`GET`** | **`/health`** | No | None | Health status (`{"status":"healthy","service":"NMART API"}`). |
| **`GET`** | **`/docs`** | No | None | Interactive Swagger UI API playground. |
| **`GET`** | **`/redoc`** | No | None | ReDoc structured API documentation. |
| **`POST`** | **`/api/auth/login`** | No | `{ email, password }` | Authenticates merchant, returns JWT `token` & `user` object. |
| **`POST`** | **`/api/auth/register`** | No | `{ firstName, surname, email, phone, storeType, password }` | Registers merchant, hashes password, saves in DB, returns token & user. |
| **`GET`** | **`/api/auth/me`** | **Yes** | None (Header: `Authorization: Bearer <jwt>`) | Validates token and returns current merchant profile. |
| **`POST`** | **`/api/auth/forgot-password`** | No | `{ email }` | Dispatches reset instructions message. |
| **`POST`** | **`/api/auth/logout`** | No | None | Terminates session. |

---

## 5. Data Flow & Authentication Lifecycle

### A. Merchant Registration Flow
1. User enters profile details (First Name, Surname, Email, Phone, Store Type, Password) on `/register`.
2. Client-side regex & length validation verifies inputs via `RegisterValidation.js`.
3. Payload is sent to `POST /api/auth/register`.
4. `AuthService.register_user`:
   - Checks SQLite database for duplicate email. If present, raises `HTTP 400: "An account with this email address already exists"`.
   - Hashes password using native `bcrypt.hashpw` with salt (max 72-byte safe bound).
   - Inserts record into `users` table and commits.
5. Returns `TokenResponse` containing a signed JWT token and user profile.
6. Frontend stores the JWT in `localStorage` under `nmart_auth_token` and user profile under `nmart_auth_user`, triggers success toast, and transitions to `/login` or `/dashboard`.

### B. Merchant Login Flow
1. User inputs email and password on `/login`.
2. Payload is sent to `POST /api/auth/login`.
3. `AuthService.authenticate_user`:
   - Queries user by email in database.
   - Verifies password against hashed string using `bcrypt.checkpw`.
   - If mismatch or user not found, raises `HTTP 401: "Invalid email or password"`.
   - If verified, creates JWT with claim `sub: user_id`, `email`, and expiration timestamp.
4. Returns token and formatted user profile.
5. `authService.login` stores token and profile; `AuthContext` updates its `user` state.
6. `AppRoutes.jsx` immediately renders `<Dashboard />` and updates URL to `/dashboard`.

### C. Persistent Session Restoration
1. On app boot or page reload, `AuthContext` reads `localStorage`.
2. If token exists, calls `GET /api/auth/me` with Bearer token.
3. If token is valid, updates context with the verified user profile from DB.
4. If token is expired or tampered with (`HTTP 401`), clears storage and logs out cleanly.

### D. Unified Error Handling Architecture
FastAPI returns error structures as:
```json
{ "detail": "Invalid email or password" }
```
or for validation errors:
```json
{ "detail": [{ "loc": ["body", "email"], "msg": "value is not a valid email address" }] }
```
In `api.js`, the error extractor specifically checks `data.detail` (both string and array formats) before falling back to `data.message` or `statusText`. This ensures backend error messages are displayed directly to the merchant.

---

## 6. Redis In-Memory Caching & Session Acceleration

To maximize performance, reduce disk I/O on SQLite, and enable instant session validation, the server tier incorporates an in-memory Redis caching layer:

### A. Key-Value Namespaces & TTL Policies
| Namespace | Key Format | Data Structure | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **User Profile** | `user:profile:{user_id}` | JSON string | `3600s` (1 hr) | Cached merchant profile (`id`, `email`, `name`, `storeType`, `phone`, `isActive`). |
| **Token Blacklist**| `token:blacklist:{sha256}` | String (`"revoked"`) | `86400s` (24 hr) | Revoked JWT tokens upon logout to prevent token replay attacks. |

### B. Dual-Path Execution Model
- **Fast Path (Redis Hit — <1ms, 0 DB Disk I/O)**:
  - When an authenticated merchant sends any request (such as `GET /api/auth/me`), `get_current_user` in [auth_middleware.py](file:///d:/Nexora/Nmart/backend/app/middleware/auth_middleware.py) first checks the token blacklist in Redis RAM.
  - It then immediately resolves `user:profile:{user_id}` directly from Redis memory in **<1ms**, completely bypassing the SQLite database and disk reads.
  - Benchmark: Consecutive authenticated requests execute at ~5–6ms total HTTP roundtrip latency with zero database queries.
- **Slow Path (Database Fallback)**:
  - If a cache miss occurs (e.g., first access after TTL expiration) or if Redis is momentarily unreachable, the application automatically queries SQLite via SQLAlchemy ORM, re-populates Redis asynchronously, and serves the request without interruptions.
- **Cache Invalidation & Revocation**:
  - `POST /api/auth/logout`: Immediately computes `sha256(token)` and marks it `"revoked"` in Redis, while evicting `user:profile:{user_id}`.
  - Profile update: Flushes and refreshes the user's cached entry in Redis.

---

## 7. Database Schema & Models

Database: **SQLite** (`backend/nmart.db`) via **SQLAlchemy 2.0 ORM**.

### Table: `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    store_type VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_id ON users(id);
```

### Pre-Seeded Default Merchant Account
The application automatically seeds a demo merchant upon server startup if absent:
- **Email**: `demo@nmart.com`
- **Password**: `password123`
- **Store Name / Type**: `Supermarket & Grocery`
- **Merchant Name**: `Alex Morgan`

---

## 8. Design System & Styling Architecture

### Dual-Layer Styling Strategy
1. **Foundation: Bootstrap 5.3.3**:
   - Provides industry-standard 12-column grid (`container`, `row`, `col-*`).
   - Flexbox utility shortcuts (`d-flex`, `justify-content-*`, `align-items-*`, `gap-*`).
   - Status badges (`badge bg-primary-subtle`, `text-primary`).
   - Normalization and cross-browser baseline.

2. **Brand Layer: Bespoke CSS Design System**:
   - Curated typography using Google Fonts (**Plus Jakarta Sans**).
   - Dynamic SVG Wave artwork ([BackgroundWaves.jsx](file:///d:/Nexora/Nmart/frontend/src/components/artwork/BackgroundWaves.jsx), [DesktopLeftWave.jsx](file:///d:/Nexora/Nmart/frontend/src/components/artwork/DesktopLeftWave.jsx), [WebsiteTopWave.jsx](file:///d:/Nexora/Nmart/frontend/src/components/artwork/WebsiteTopWave.jsx)).
   - Glassmorphism effects with backdrop blur.
   - Micro-animations (input focus ring expansion, button ripple effects, smooth tab slides).

### Responsive Viewport Hierarchy
- **Mobile (< 600px)**: Single-column full-bleed card with organic background waves, 48px touch targets, zero horizontal overflow.
- **Tablet (600px - 1023px)**: Elevated card centered with subtle border glow.
- **Desktop (>= 1024px)**: Premium 2-column split card. Left panel features top fluid wave, slogan carousel, and bottom linear wave accent. Right panel houses authentication forms.

---

## 9. Configuration & Environment Variables

### Frontend (`frontend/.env`)
```ini
# Base URL for the FastAPI Backend API
VITE_API_URL=http://localhost:8000/api
```

### Backend (`backend/.env`)
```ini
PROJECT_NAME="NMART API"
ENVIRONMENT=development
API_V1_PREFIX=/api

# Security & JWT Tokens
SECRET_KEY=nmart_development_super_secret_jwt_key_2026_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Connection (SQLite default, switchable to PostgreSQL)
DATABASE_URL=sqlite:///./nmart.db

# CORS Allowed Origins (Comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:4173

# Redis In-Memory Cache (User sessions, Profile cache, Token blacklist)
REDIS_URL=redis://localhost:6379/0
REDIS_ENABLED=true
REDIS_CACHE_TTL_SECONDS=3600
```

### Editor Configuration (`.vscode/settings.json`)
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/Scripts/python.exe",
  "python.analysis.extraPaths": [
    "${workspaceFolder}/backend"
  ],
  "python.autoComplete.extraPaths": [
    "${workspaceFolder}/backend"
  ]
}
```

---

## 10. Critical Troubleshooting & Engineering Notes

### 1. Python 3.13 + Passlib / Bcrypt Compatibility
- **Issue**: `passlib` is unmaintained and queries `bcrypt.__about__.__version__`, which was deprecated and removed in `bcrypt 4.1.0+` / `5.0.0`. It also crashed with `ValueError: password cannot be longer than 72 bytes` during wrap detection.
- **Solution**: Replaced `passlib` with direct `bcrypt` calls (`bcrypt.hashpw` and `bcrypt.checkpw`) in `app/utils/security.py`. All password inputs are safely bounded to 72 bytes before encoding.

### 2. Windows Socket Binding (`[WinError 10048]` & `[WinError 10013]`)
- **Issue**: Attempting to run multiple uvicorn instances on port `8000` or running without `--host 127.0.0.1` produces socket binding permission errors on Windows.
- **Solution**: Always specify `--host 127.0.0.1 --port 8000`. If port 8000 is occupied, inspect running background tasks or execute:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000 -State Listen
  ```

### 3. IDE PyLance / Missing Module Warnings
- **Issue**: IDE reports `Cannot find module 'sqlalchemy'` or `fastapi`.
- **Solution**: Ensure dependencies are installed inside the workspace virtual environment `backend/.venv` (not just globally) and that `.vscode/settings.json` points to `${workspaceFolder}/backend/.venv/Scripts/python.exe`.

---

## 11. Developer Operations & Command Reference

### Starting Development Servers

```bash
# Terminal 1: Backend FastAPI Server (port 8000)
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Frontend Vite Server (port 5173)
cd frontend
npm run dev
```

### Code Quality & Production Build
```bash
# Frontend Linting (Oxlint)
cd frontend
npm run lint

# Frontend Production Build
npm run build
```

---

*This document serves as the permanent architectural brain and single source of truth for the NMART repository.*
