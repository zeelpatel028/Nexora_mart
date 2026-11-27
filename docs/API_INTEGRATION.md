# NMART Android & Backend API Integration Guide

This document details how the **NMART Android Application** (Kotlin + Jetpack Compose) connects to the **FastAPI Backend**, reuses the exact same authentication lifecycle, database persistence (SQLite), and Redis session caching as the **React Web Frontend**.

---

## 1. Architectural Overview

```text
                           FASTAPI BACKEND
                      (http://127.0.0.1:8000)
                                 │
                     Stateless REST APIs (/api)
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
     REACT WEB FRONTEND                      ANDROID APPLICATION
    (React 19 + Vite SPA)                  (Kotlin + Jetpack Compose)
   http://localhost:5173                    Emulator: 10.0.2.2:8000
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
                  PERSISTENCE & CACHING TIER
                 • SQLite Database: nmart.db
                 • In-Memory Cache: Redis (Port 6379)
```

Both clients share:
1. **Identical REST Endpoints**: No duplicate business logic or database engines in mobile.
2. **Unified Authentication Tokens**: JWT Bearer Tokens issued by FastAPI with HS256 signature and expiration timestamps.
3. **Database Records**: Creating an account on Android allows immediate login on the website and vice-versa.
4. **Redis Performance Cache**: Token revocation on logout is respected instantly across both clients.

---

## 2. API Endpoints Reference

All routes are mounted under the `/api` prefix (defined in `backend/app/main.py`).

| HTTP Method | Route | Auth Header Required | Request Body | Response Payload | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`POST`** | `/api/auth/login` | No | `{"email": "...", "password": "..."}` | `TokenResponse` (`token`, `tokenType`, `user`) | Authenticates merchant and returns JWT. |
| **`POST`** | `/api/auth/register` | No | `{"firstName": "...", "surname": "...", "email": "...", "phone": "...", "storeType": "...", "password": "..."}` | `TokenResponse` (`token`, `tokenType`, `user`) | Creates new store account and logs in. |
| **`GET`** | `/api/auth/me` | **Yes** (`Bearer <token>`) | *None* | `UserResponse` (`id`, `name`, `email`, `storeType`, etc.) | Fetches merchant profile (Redis cached). |
| **`POST`** | `/api/auth/forgot-password` | No | `{"email": "..."}` | `{"message": "...", "success": true}` | Dispatches reset instructions. |
| **`POST`** | `/api/auth/logout` | Optional (`Bearer <token>`) | *None* | `{"message": "...", "success": true}` | Revokes JWT in Redis blacklist. |
| **`GET`** | `/health` | No | *None* | `{"status": "healthy", "redis": {...}}` | Service & Redis status ping. |

---

## 3. Network Architecture & Address Resolution

### A. Android Studio Emulator Loopback (`10.0.2.2`)
When running on the standard Android Studio Emulator:
- `127.0.0.1` or `localhost` points to the **Android virtual device itself**, *not* the computer running the FastAPI server.
- The host computer's loopback interface is mapped by the Android emulator kernel to **`10.0.2.2`**.
- Therefore, the default development base URL configured in `AppConfig.kt` is:
  ```kotlin
  const val EMULATOR_BASE_URL = "http://10.0.2.2:8000/api/"
  ```

### B. Physical Android Device Testing
To test the app on a physical Android phone connected via Wi-Fi:
1. Make sure your phone and computer are on the same Wi-Fi network.
2. Find your computer's local Wi-Fi IP address (e.g. `192.168.1.100`):
   ```powershell
   ipconfig
   ```
3. Open the Android app, navigate to **Settings**, select **Custom Local IP / Server**, and enter:
   ```text
   http://192.168.1.100:8000/api/
   ```
4. Tap **Save Custom URL**, then tap **Test FastAPI Connection (/health)** to verify real-time connectivity.

### C. Cleartext HTTP & Network Security
Android 9 (API 28) and above blocks cleartext HTTP by default. The file [network_security_config.xml](file:///d:/Nexora/Nmart/android/app/src/main/res/xml/network_security_config.xml) specifically allows HTTP for local development domains (`10.0.2.2`, `10.0.3.2`, `127.0.0.1`, `localhost`, and LAN addresses) while enforcing HTTPS for production domains (`api.nmart.com`).

---

## 4. Android Implementation Architecture

```text
android/app/src/main/java/com/nexora/nmart/
│
├── core/
│   ├── config/AppConfig.kt           # Base URLs, timeouts, active environment
│   ├── constants/ApiEndpoints.kt     # Endpoints constants
│   ├── constants/AppConstants.kt     # App names, store categories, demo credentials
│   ├── utils/ValidationUtils.kt      # Form validation schemas
│   └── extensions/Extensions.kt      # Currency & text formatting
│
├── data/
│   ├── model/
│   │   ├── AuthModels.kt             # LoginRequest, RegisterRequest, TokenResponse
│   │   ├── UserModels.kt             # UserResponse (matching FastAPI schema)
│   │   └── DashboardModels.kt        # Merchant dashboard metrics
│   ├── local/
│   │   ├── TokenManager.kt           # EncryptedSharedPreferences (Android Keystore)
│   │   └── UserSessionManager.kt     # Reactive StateFlow session cache
│   └── repository/
│       └── AuthRepository.kt         # Mediates API calls and updates local state
│
├── network/
│   ├── ApiClient.kt                  # OkHttp & Retrofit builder with dynamic base URL
│   ├── ApiService.kt                 # Retrofit REST definitions
│   ├── AuthInterceptor.kt            # JWT Bearer injection & 401 Unauthorized handler
│   └── NetworkResult.kt              # Sealed result with FastAPI error parser
│
├── di/
│   └── ServiceLocator.kt             # Clean singleton dependency injection
│
├── navigation/
│   ├── NavigationRoutes.kt           # Route destinations & navigation items
│   └── AppNavigation.kt              # NavHost with auth route guards
│
└── ui/
    ├── theme/                        # Material 3 Design System (Color, Type, Theme)
    ├── components/                   # AppButton, AppTextField, LoadingIndicator
    ├── navigation/                   # MobileNavigationBar, TabletNavigationRail, TabletNavigationDrawer, AdaptiveNavigation
    ├── auth/                         # LoginScreen, SignupScreen, AuthViewModel
    ├── dashboard/                    # DashboardScreen, DashboardViewModel
    ├── profile/                      # ProfileScreen, ProfileViewModel
    └── settings/                     # SettingsScreen (Server switcher & health test)
```

---

## 5. Security & Token Storage Best Practices

1. **Encrypted Storage**:
   - JWT tokens are saved using `EncryptedSharedPreferences` backed by the Android Keystore system with AES-256 GCM encryption.
   - Tokens are excluded from cloud backups in `backup_rules.xml` and `data_extraction_rules.xml`.
2. **Zero Sensitive Logging**:
   - `AuthInterceptor` and `HttpLoggingInterceptor` redact the `Authorization` header so tokens are never exposed in logcat.
3. **Session Revocation (HTTP 401)**:
   - When an API call returns `401 Unauthorized` (e.g. token expired or invalidated in Redis), `AuthInterceptor` immediately purges local session storage and resets UI state to the login screen.

---

## 6. How to Run and Verify the Full Stack

### Step 1: Start the Backend (FastAPI)
```powershell
cd d:\Nexora\Nmart\backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Verify at `http://127.0.0.1:8000/docs` or `http://127.0.0.1:8000/health`.

### Step 2: Start the Web Frontend (React + Vite)
```powershell
cd d:\Nexora\Nmart\frontend
npm run dev
```
Open `http://localhost:5173`. You can log in using:
- **Email**: `demo@nmart.com`
- **Password**: `password123`

### Step 3: Run the Android Application
Open `d:\Nexora\Nmart\android` in **Android Studio**:
- Select an emulator or physical test device.
- Click **Run** (`Shift + F10`).
- On the Login screen, tap **⚡ Fill Demo Merchant** to test login immediately.
- Go to **Settings** to run the live FastAPI health check or switch between emulator and LAN server IP.
