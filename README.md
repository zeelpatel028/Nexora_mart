# Nexora Mart - Store Management System & Mobile Ecosystem

> **Enterprise Multi-Platform Store Management & Retail POS Ecosystem**  
> Comprising Web SPA (React 19 + Vite), Cloud REST Backend (Python FastAPI + SQLite/Redis), Native Android App (Kotlin Compose), and a **Full-Featured Native React Native Android Application** (TypeScript + React Navigation — Zero WebViews).

---

## 📁 Required Project Structure

```
Nexora-Mart/
│
├── frontend/                         # Existing React 19 + Vite Web Application
│   ├── src/                          # Pages, Components, Responsive CSS, API services
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Existing Python FastAPI REST API Backend
│   ├── app/                          # Core, Models, Schemas, Routes, Services
│   ├── requirements.txt
│   ├── .env.example
│   └── nmart.db                      # Primary SQLite Database
│
├── android/                          # Existing Android Application (Kotlin Jetpack Compose)
│   ├── app/                          # Main Activity, Compose UI, Network, DI
│   └── build.gradle.kts
│
├── react-native-app/                 # NEW Native React Native Android Application
│   ├── android/                      # Native Android project (Kotlin DSL & Gradle 8.9)
│   ├── src/                          # TypeScript Native Source (Zero WebViews)
│   │   ├── api/                      # Centralized Axios client & 33 REST endpoints
│   │   ├── services/                 # 11 Domain API services (Auth, Products, Sales, etc.)
│   │   ├── components/               # Native UI design system (Buttons, Cards, Badges)
│   │   ├── screens/                  # 21 Native screens (POS, Catalog, Inventory, etc.)
│   │   ├── navigation/               # Bottom Tab & Native Stack Navigators
│   │   ├── context/                  # AuthContext & ThemeContext
│   │   ├── constants/                # Colors, Theme tokens, Server host configurations
│   │   └── utils/                    # Storage, Formatters, Validators
│   ├── App.tsx
│   ├── index.js
│   ├── package.json
│   └── tsconfig.json
│
├── backup-code/                      # Complete Verifiable Source Code Backups
│   ├── frontend-backup/              # Complete 124-file snapshot of React Frontend
│   ├── backend-backup/               # Complete 79-file snapshot of FastAPI Backend
│   ├── android-backup/               # Complete 87-file snapshot of Existing Android App
│   └── project-structure.txt         # Comprehensive 290-file inventory snapshot
│
├── API_INTEGRATION_REPORT.md         # Exhaustive 33-Endpoint API Integration Audit
└── README.md                         # Master Project Documentation
```

---

## 🌟 Technology Stack & Architecture

| Layer | Technologies | Responsibilities |
|---|---|---|
| **Web Frontend** | React 19, Vite 8, Modular CSS, Bootstrap 5 | Store administration, web POS, inventory management, reports |
| **Mobile App (New)** | React Native 0.75, TypeScript, React Navigation 6, Vector Icons | Handheld mobile POS, barcode scanning, stock takes, manager alerts (**Zero WebViews**) |
| **Mobile App (Existing)** | Kotlin, Jetpack Compose, Retrofit 2, EncryptedSharedPreferences | Native Kotlin Android reference implementation |
| **Backend REST API** | Python 3.13, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, Redis | Secure REST endpoints, JWT authentication, business logic |
| **Shared Database** | SQLite (`nmart.db`) with foreign key constraints | Single source of truth shared concurrently across web and mobile |

---

## 🎨 Brand Identity & Design Tokens

Both Web and React Native mobile clients strictly adhere to the unified Nexora Mart brand design language:

| Design Token | Color Name | Hex Code | Usage |
|---|---|---|---|
| `--color-primary` | Vibrant Orange | `#FF6A1A` | Primary CTAs, active highlights, checkout buttons |
| `--color-secondary` | Warm Amber Gold | `#FFB82E` | Secondary badges, warning highlights, accent borders |
| `--color-dark` | Deep Indigo Navy | `#0B0B2B` | Headers, wave hero sections, dark cards |
| `--color-light` | Warm Cream White | `#FFF9F3` | Surface background for light theme |
| `--color-surface-dark`| Slate Charcoal | `#111520` | Surface background for dark theme |
| `--color-success` | Emerald Green | `#10B981` | Completed orders, in-stock badges, revenue |
| `--color-danger` | Crimson Red | `#EF4444` | Out-of-stock badges, overdue accounts, delete |

---

## 📱 React Native Mobile Application Modules

The React Native application (`react-native-app/`) provides 21 dedicated native mobile screens built completely without WebViews or HTML wrappers:

1. **Authentication**: `SplashScreen`, `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`.
2. **Dashboard**: `DashboardScreen` (KPI summary cards, quick actions, recent sales ledger, stock alert triggers).
3. **Product Catalog**: `ProductListScreen` (search, category filter chips, barcode display), `ProductDetailScreen` (variants, cost margin, stock status), `AddProductScreen`, `EditProductScreen`.
4. **Categories**: `CategoryListScreen` (visual category grid with item counts).
5. **Inventory & Stock**: `InventoryScreen` (stock balances & status), `StockInwardScreen` (receiving & batch cost tracking), `StockAdjustmentScreen` (cycle count adjustments & reason tracking).
6. **Point of Sale (POS)**: `PosBillingScreen` (rapid product search, barcode entry, cart drawer, tax/discount computation, multiple payment methods, receipt confirmation).
7. **Sales Orders**: `SalesListScreen` (date/status filters), `SaleDetailScreen` (itemized lines, customer info, payment status).
8. **Purchases**: `PurchaseListScreen` (purchase order ledger), `CreatePurchaseScreen` (supplier PO creator).
9. **Partners Directory**: `CustomerListScreen` (customer balances, phone, email), `SupplierListScreen` (vendor directory & payables).
10. **Reports & Valuation**: `ReportsScreen` (sales volume, gross profit, payment mix), `InventoryValuationScreen` (total inventory value at cost vs retail).
11. **Finance & Expenses**: `FinanceScreen` (expense tracking, category breakdown, cash flow summary).
12. **Store Profile & Settings**: `ProfileScreen` (merchant profile, store switcher), `SettingsScreen` (theme toggle, server host picker, cache clearance).

---

## 🔒 Complete Project Backups (`backup-code/`)

Prior to creating any new application code, complete, unadulterated backups of all existing projects were generated and verified:

- **Frontend Backup** (`backup-code/frontend-backup/`): 124 files preserving all components, services, and assets.
- **Backend Backup** (`backup-code/backend-backup/`): 79 files preserving all Python controllers, models, schemas, and configurations.
- **Android Backup** (`backup-code/android-backup/`): 87 files preserving all Kotlin files, XML layouts, Gradle scripts, and manifests.
- **Project Structure Log** (`backup-code/project-structure.txt`): File-by-file record confirming 290 total files backed up.

---

## 🔌 API Integration & Shared Database

The React Native application interfaces directly with the existing FastAPI backend via `src/api/apiClient.ts` and `src/api/endpoints.ts`.

Refer to [`API_INTEGRATION_REPORT.md`](file:///D:/Nexora/Nmart/API_INTEGRATION_REPORT.md) for full documentation of all 33 endpoints across 11 modules:
- `/api/auth`: Login, Register, Refresh, Profile
- `/api/stores`: Multi-store management and settings
- `/api/categories`: Category management
- `/api/products`: Catalog, SKUs, and variant pricing
- `/api/inventory`: Real-time stock levels, inward movements, adjustments
- `/api/sales`: POS orders, receipts, invoice generation
- `/api/purchases`: Vendor POs and receiving
- `/api/customers`: Customer directory and balances
- `/api/suppliers`: Vendor management and payables
- `/api/expenses`: Operational overhead and categorization
- `/api/reports`: Sales summaries, top-selling items, inventory valuation

### Shared Database Real-Time Sync
Because both the React web frontend and React Native mobile app communicate with the same FastAPI server (`backend/`) and shared SQLite database (`backend/app/nmart.db` and root `nmart.db`), any action taken on mobile (such as adding a product or recording a sale) is instantly visible on the web dashboard.

---

## 🚀 Quick Start Guide

### 1. Running the FastAPI Backend
```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`.  
Swagger documentation available at `http://127.0.0.1:8000/docs`.

### 2. Running the React Web Frontend
```bash
cd frontend
npm install
npm run dev
```
Web application will be accessible at `http://localhost:5173`.

### 3. Running & Building the React Native Mobile App
```bash
cd react-native-app

# 1. Install dependencies
npm install

# 2. Verify TypeScript typing
npx tsc --noEmit

# 3. Create offline JavaScript bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# 4. Build Debug APK
cd android
.\gradlew assembleDebug

# 5. Build Release APK
.\gradlew assembleRelease
```
Compiled APKs are output to:
- Debug: `react-native-app/android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `react-native-app/android/app/build/outputs/apk/release/app-release.apk`

---

## 🔑 Default Credentials

- **Email**: `demo@nmart.com`
- **Password**: `password123`
- **Role**: Store Owner / Administrator
