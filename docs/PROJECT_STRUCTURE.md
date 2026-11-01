# NMART Project Structure & Architecture Guide

This document provides a complete architectural breakdown of the NMART project, outlining directory responsibilities, modular conventions, and data flows.

---

## High-Level Repository Layout

```
project-root/
│
├── frontend/                     # React 19 + Vite Frontend SPA
│   ├── public/                   # Static assets served directly (e.g., Nmart.png)
│   ├── src/
│   │   ├── assets/               # Bundled static media assets
│   │   ├── components/           # Component library organized by domain
│   │   │   ├── common/           # Reusable generic UI components (Button, Input, Modal, Loader, Toast)
│   │   │   ├── auth/             # Authentication-specific form inputs & widgets (LoginInput, PasswordInput, etc.)
│   │   │   ├── branding/         # Brand logo, typography, and SVG icons
│   │   │   ├── artwork/          # Wave SVGs and hero gradient artworks
│   │   │   └── layout/           # Viewport containers, Navbars, Footers, and Shell layouts
│   │   │
│   │   ├── pages/                # Dedicated page directories
│   │   │   ├── login/            # Login page (Login.jsx, LoginForm.jsx, LoginValidation.js, Login.css)
│   │   │   ├── register/         # Merchant registration page (Register.jsx, RegisterForm.jsx, RegisterValidation.js)
│   │   │   ├── dashboard/        # Merchant management dashboard (Dashboard.jsx, Dashboard.css)
│   │   │   └── not-found/        # 404 Error page (NotFound.jsx, NotFound.css)
│   │   │
│   │   ├── responsive/           # Modular multi-device responsive stylesheets & viewport hooks
│   │   │   ├── breakpoints.css   # Breakpoint tokens and fluid container bounds
│   │   │   ├── mobile.css        # Mobile smartphone overrides (<= 599px)
│   │   │   ├── tablet.css        # Tablet overrides (600px - 1023px)
│   │   │   ├── desktop.css       # Desktop/laptop overrides (>= 1024px)
│   │   │   ├── useResponsive.js  # React hook providing responsive boolean flags
│   │   │   └── ResponsiveView.jsx# Declarative device-specific view renderer
│   │   │
│   │   ├── contexts/             # Global React Contexts (AuthContext, AuthProvider)
│   │   ├── hooks/                # Custom React hooks (useAuth)
│   │   ├── services/             # API client & auth service layers
│   │   ├── routes/               # Declarative client-side routing (AppRoutes.jsx)
│   │   ├── constants/            # Global constants (store types, API endpoints)
│   │   ├── utils/                # Pure utility functions & validation helpers
│   │   ├── styles/               # Modular global styles (variables.css, reset.css, global.css)
│   │   ├── App.jsx               # Application root component wrapped in providers
│   │   ├── App.css               # Shell viewport styles
│   │   └── main.jsx              # DOM entrypoint
│   │
│   ├── package.json              # Frontend dependencies and npm scripts
│   ├── vite.config.js            # Vite configuration
│   └── .oxlintrc.json            # High-performance linter configuration
│
├── backend/                      # Python FastAPI REST Backend
│   ├── app/
│   │   ├── core/                 # Central configuration and environment settings
│   │   ├── database/             # SQLAlchemy engine, session maker, and DB dependencies
│   │   ├── models/               # SQLAlchemy ORM models (User)
│   │   ├── schemas/              # Pydantic request/response validation schemas
│   │   ├── services/             # Business logic service layer (AuthService)
│   │   ├── controllers/          # HTTP controllers (AuthController)
│   │   ├── routes/               # API route definitions (auth_routes)
│   │   ├── middleware/           # CORS & JWT authentication guards
│   │   ├── utils/                # Security helpers (bcrypt, JWT tokens)
│   │   └── main.py               # FastAPI application entrypoint
│   │
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── README.md                 # Backend documentation
│
├── docs/                         # Project documentation
│   ├── PROJECT_STRUCTURE.md      # Detailed folder and module guide
│   └── SETUP_GUIDE.md            # Comprehensive local setup walkthrough
│
├── .gitignore                    # Global repository git ignore
└── README.md                     # Root project overview
```

---

## Detailed Directory Responsibilities

### Frontend (`frontend/src/`)

| Folder | Responsibility | Key Files |
| :--- | :--- | :--- |
| **`components/common/`** | Foundation UI primitives used across multiple pages. | `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Loader.jsx`, `Toast.jsx` |
| **`components/auth/`** | Form-specific auth inputs with icons, clear buttons, visibility toggles, and social buttons. | `LoginInput.jsx`, `PasswordInput.jsx`, `SocialAuthButton.jsx`, `RememberMe.jsx` |
| **`components/branding/`** | Brand assets, vector icons, and responsive logo displays. | `BrandLogo.jsx`, `Icons.jsx` |
| **`components/artwork/`** | Organic background SVG waves, linear accents, and fluid gradients. | `BackgroundWaves.jsx`, `DesktopLeftWave.jsx`, `WebsiteTopWave.jsx` |
| **`components/layout/`** | Layout wrappers, top navbar, footer, and page viewport shells. | `MainLayout.jsx`, `Navbar.jsx`, `Footer.jsx` |
| **`pages/login/`** | Dedicated Login module with UI, styles, validation, and modals. | `Login.jsx`, `LoginForm.jsx`, `LoginValidation.js`, `ForgotPasswordModal.jsx`, `Login.css` |
| **`pages/register/`** | Dedicated Registration module for merchant store accounts. | `Register.jsx`, `RegisterForm.jsx`, `RegisterValidation.js`, `Register.css` |
| **`pages/dashboard/`** | Post-authentication merchant portal with sales overview and inventory tools. | `Dashboard.jsx`, `Dashboard.css` |
| **`pages/not-found/`** | Graceful 404 error page. | `NotFound.jsx`, `NotFound.css` |
| **`responsive/`** | Device-specific stylesheets, media query breakpoints, and reactive responsive hook. | `breakpoints.css`, `mobile.css`, `tablet.css`, `desktop.css`, `useResponsive.js` |
| **`services/`** | Network API requests and persistent auth state operations. | `api.js`, `authService.js` |
| **`contexts/`** | React Context providers for global application state. | `AuthContext.jsx`, `authContextInstance.js` |
| **`hooks/`** | Custom hooks providing clean APIs for components. | `useAuth.js` |
| **`constants/`** | Immutable configuration values (store categories, endpoints). | `storeTypes.js`, `apiEndpoints.js` |
| **`utils/`** | Pure helper functions for formatting, validation, and sanitization. | `validation.js` |
| **`styles/`** | Foundational CSS architecture (tokens, resets, keyframes). | `variables.css`, `reset.css`, `global.css` |

---

### Backend (`backend/app/`)

| Folder | Responsibility |
| :--- | :--- |
| **`core/`** | Parses `.env` configuration using Pydantic Settings. |
| **`database/`** | Initializes database connections and provides session dependencies (`get_db`). |
| **`models/`** | Defines database tables and schema via SQLAlchemy ORM. |
| **`schemas/`** | Validates incoming payloads and formats JSON response bodies using Pydantic. |
| **`services/`** | Encapsulates business logic, data persistence, and credential verification. |
| **`controllers/`** | Coordinates HTTP status codes, error handling, and serialization. |
| **`routes/`** | Declares API endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`). |
| **`middleware/`** | Configures CORS origins and validates JWT Authorization bearer tokens. |
| **`utils/`** | Cryptographic functions including bcrypt password hashing and JWT encoding. |

---

## Responsive Architecture Breakdown

The project employs a structured responsive system combining CSS media queries with a reactive React hook:

1. **Breakpoints**:
   - **Small Mobile**: `320px - 374px`
   - **Standard Mobile**: `375px - 599px`
   - **Tablet**: `600px - 1023px`
   - **Desktop / Laptop**: `1024px - 1439px`
   - **Large Desktop**: `1440px and above`

2. **Adaptive Presentation**:
   - **Desktop Layout (`>= 1024px`)**: Premium 2-column split card. Left column features the top wave, brand showcase, slogan carousel, and bottom linear wave accent. Right column hosts the sign-in form.
   - **Tablet Layout (`600px - 1023px`)**: Elevated centered card with organic background waves, optimized for touch on iPad and medium screens.
   - **Mobile Layout (`<= 599px`)**: Full-bleed fluid smartphone card with background waves, touch-friendly 48px targets, and no horizontal scrolling.
   - **Shared Authentication**: All screen sizes utilize the exact same underlying form validation, authentication service, and token persistence.
