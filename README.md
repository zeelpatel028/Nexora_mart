# NMART - Cloud Retail Commerce & Merchant Platform

A scalable, responsive, modular web application and merchant management platform designed for desktop workstations, tablets, and smartphones.

---

## Technology Stack

- **Frontend (Web)**:
  - **Framework**: React 19 + Vite 8
  - **Styling**: Modular Vanilla CSS with CSS Custom Properties, Flexbox & CSS Grid, Bootstrap 5 utilities
  - **State Management**: React Context (`AuthContext`) & Custom Hooks (`useAuth`, `useResponsive`)
  - **Code Quality**: Oxlint (High-performance JS/JSX linter)
- **Mobile (Android)**:
  - **Framework**: Kotlin + Jetpack Compose + Material 3
  - **Architecture**: MVVM with Repository Pattern, StateFlow & Coroutines
  - **Networking & Serialization**: Retrofit 2 + OkHttp 4 + Gson + AuthInterceptor
  - **Security**: EncryptedSharedPreferences (AES-256 GCM backed by Android Keystore)
  - **Responsive UI**: Adaptive Navigation (Phone Bottom Bar, Tablet Navigation Rail, Large-screen Navigation Drawer)
- **Backend (REST API)**:
  - **Framework**: Python FastAPI (Python 3.13)
  - **Validation & Serialization**: Pydantic v2
  - **ORM & Database**: SQLAlchemy (SQLite for development, PostgreSQL-ready)
  - **Caching & Revocation**: Redis In-Memory Cache (Port 6379)
  - **Authentication**: JWT Bearer Tokens with native Bcrypt password hashing
- **Responsive System**:
  - Web: Modular device stylesheets (`breakpoints.css`, `mobile.css`, `tablet.css`, `desktop.css`)
  - Android: `AdaptiveNavigation` with window size class responsive layouts

---

## Project Structure

```
nmart/
├── frontend/                         # React 19 + Vite Frontend SPA
│   ├── public/                       # Static brand assets (Nmart.png)
│   ├── src/
│   │   ├── components/               # Common primitives, auth widgets, branding
│   │   ├── pages/                    # Login, Register, Dashboard, NotFound
│   │   ├── responsive/               # Device stylesheets & useResponsive hook
│   │   ├── services/                 # api.js, authService.js
│   │   ├── contexts/                 # AuthContext
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Python FastAPI REST API Backend
│   ├── app/
│   │   ├── core/                     # Central configuration & Pydantic settings
│   │   ├── database/                 # SQLAlchemy engine & session maker
│   │   ├── models/                   # Database models (User)
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   ├── services/                 # AuthService & CacheService
│   │   ├── routes/                   # auth_routes.py
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── requirements.txt
│   └── .env.example
│
├── android/                          # Native Android Mobile Application
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/nexora/nmart/
│   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   ├── MyApplication.kt
│   │   │   │   │   ├── core/         # Config, constants, utils, extensions
│   │   │   │   │   ├── data/         # Models, local token storage, repository
│   │   │   │   │   ├── network/      # Retrofit, ApiService, AuthInterceptor
│   │   │   │   │   ├── navigation/   # Routes & AppNavigation
│   │   │   │   │   ├── di/           # ServiceLocator dependency injection
│   │   │   │   │   └── ui/           # Theme, Components, Auth, Dashboard, Profile, Settings
│   │   │   │   └── res/              # Values, drawables, network security config
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts
│   ├── gradle/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── gradle.properties
│
├── docs/
│   ├── API_INTEGRATION.md            # Android & FastAPI integration guide
│   ├── PROJECT_STRUCTURE.md          # Architectural guide and file responsibilities
│   └── SETUP_GUIDE.md                # Local setup walkthrough
│
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Application URL: `http://localhost:5173`

### 2. Frontend Build & Quality Checks

```bash
# Run linter
npm run lint

# Production build
npm run build
```

### 3. Backend Development (Optional)

```bash
cd backend
python -m venv .venv
# On Windows
.venv\Scripts\Activate.ps1
# On Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Interactive API documentation: `http://localhost:8000/docs`

---

## Responsive Design

- **Mobile Viewport (`<= 599px`)**: Single-column fluid layout with organic wave artwork and touch-friendly controls.
- **Tablet Viewport (`600px - 1023px`)**: Elevated centered card layout with smooth background waves.
- **Desktop Viewport (`>= 1024px`)**: Split 2-column card featuring the brand showcase, slogan carousel, and linear wave accent.
- **Unified Logic**: All screen viewports share the exact same underlying validation and authentication system.
