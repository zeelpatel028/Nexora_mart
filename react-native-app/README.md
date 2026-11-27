# Nexora Mart - React Native Mobile Application

> **Professional Cross-Platform Android Mobile Application for Nexora Mart Store Management System**  
> Built with **React Native 0.75**, **TypeScript**, **React Navigation**, and **Native UI Components** — **100% Native Mobile UI (Zero WebViews / No Web Wrappers)**.

---

## 📱 Overview

Nexora Mart Mobile is an independent native Android application engineered to provide retail store managers, cashiers, and inventory officers with complete handheld store management capabilities.

The app interfaces directly with the existing **Nexora Mart Python FastAPI Backend** and operates on the **Shared Database** (`nmart.db`). Any product added, stock adjusted, or sale completed on mobile is instantly synchronized with the desktop web dashboard in real-time.

---

## 🎨 Branding & Design System

The mobile application strictly incorporates the official **Nexora Mart** visual identity:

| Token | Color | Hex Code | Purpose |
|---|---|---|---|
| **Primary** | Vibrant Orange | `#FF6A1A` | Main CTAs, active highlights, key brand accents |
| **Secondary** | Warm Amber Gold | `#FFB82E` | Badges, secondary actions, alert accents |
| **Surface Dark** | Deep Indigo Navy | `#0B0B2B` | Headers, hero cards, dark surfaces |
| **Background Light** | Warm Cream White | `#FFF9F3` | Clean background for mobile screens |
| **Dark Theme** | Slate Charcoal | `#111520` | Dark mode surface background |
| **Success** | Emerald Green | `#10B981` | Paid status, positive stock movement |
| **Danger** | Crimson Red | `#EF4444` | Out-of-stock, overdue balance, delete actions |
| **Warning** | Amber Yellow | `#F59E0B` | Low stock warnings, pending status |

### Typography & Native Components
- **Font**: Native modern sans-serif with hierarchical weights (`400`, `600`, `700`, `800`) matching Plus Jakarta Sans.
- **Micro-interactions**: Ripple feedback, smooth transitions, pull-to-refresh loaders, custom native dialogs, and wave header SVG styling.

---

## 🚀 Key Modules & Screen Implementation

### 1. Authentication & Security
- **Splash Screen** (`SplashScreen.tsx`): Brand animation, token verification, and automated routing.
- **Login Screen** (`LoginScreen.tsx`): Credential validation, store auto-selection, secure token persistence via `@react-native-async-storage/async-storage`.
- **Register Screen** (`RegisterScreen.tsx`): Merchant registration and store setup.
- **Forgot Password** (`ForgotPasswordScreen.tsx`): Self-service password reset request.

### 2. Executive Dashboard
- **Dashboard Screen** (`DashboardScreen.tsx`): Real-time store performance KPI tiles (Today's Sales, Total Orders, Active Products, Low Stock Count), quick action launchpad, recent sales stream, and stock alerts.

### 3. Products Catalog Management
- **Product List** (`ProductListScreen.tsx`): Virtualized product listing with search, category chip filters, barcode preview, and stock status badges.
- **Product Detail** (`ProductDetailScreen.tsx`): Comprehensive view of SKU, price, cost margin, variant matrix, and stock status.
- **Add Product** (`AddProductScreen.tsx`): Full product creation form with category picker, price, cost, barcode, and min stock threshold.
- **Edit Product** (`EditProductScreen.tsx`): In-place updates to product details, pricing, and active status.
- **Category Management** (`CategoryListScreen.tsx`): Hierarchical category browser with product counters.

### 4. Inventory & Stock Control
- **Inventory Overview** (`InventoryScreen.tsx`): Live stock tracker with fast search and stock level indicators.
- **Stock Inward / Restock** (`StockInwardScreen.tsx`): Purchase receiving workflow with quantity, unit cost, batch number, and notes.
- **Stock Adjustment** (`StockAdjustmentScreen.tsx`): Cycle-count adjustments with discrepancy tracking and reason codes (Damaged, Expired, Recount).

### 5. Point of Sale (POS) & Billing
- **POS Screen** (`PosBillingScreen.tsx`): Rapid handheld barcode/search POS with cart drawer, quantity modifiers, tax calculation, discount input, customer selector, and multi-payment support (Cash, Card, UPI).

### 6. Sales Management
- **Sales List** (`SalesListScreen.tsx`): Historical transaction ledger with date/status filters.
- **Sale Detail** (`SaleDetailScreen.tsx`): Itemized receipt view, subtotal, tax breakdown, customer information, and fulfillment status.

### 7. Purchases & Supplier Orders
- **Purchase Orders** (`PurchaseListScreen.tsx`): PO history and vendor delivery tracking.
- **Create Purchase** (`CreatePurchaseScreen.tsx`): Line-item purchase order generator with supplier selector.

### 8. Business Partners Directory
- **Customer Directory** (`CustomerListScreen.tsx`): Customer contact cards, phone numbers, and receivable balance.
- **Supplier Directory** (`SupplierListScreen.tsx`): Vendor contact ledger with total purchase history and payable balance.

### 9. Financial Ledger & Reports
- **Reports Screen** (`ReportsScreen.tsx`): Sales velocity, gross margins, payment breakdown, and top-selling items.
- **Inventory Valuation** (`InventoryValuationScreen.tsx`): Aggregate inventory value at cost vs. retail sales potential.
- **Finance & Expenses** (`FinanceScreen.tsx`): Operational expense logging, category breakdown, and net profit tracker.

### 10. Store Profile & Preferences
- **Profile Screen** (`ProfileScreen.tsx`): Store operator information, active store details, and security controls.
- **Settings Screen** (`SettingsScreen.tsx`): Dark/Light theme toggles, currency formatters, server host selector, and session clearing.

---

## 🏗️ Architecture & Folder Structure

```
react-native-app/
├── android/                          # Native Android Gradle project (Kotlin DSL)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/               # Bundled index.android.bundle
│   │   │   ├── java/com/nexora/nmart/
│   │   │   │   ├── MainActivity.kt   # ReactActivity entrypoint
│   │   │   │   └── MainApplication.kt# ReactApplication setup
│   │   │   ├── res/                  # Mipmap app icons, styles, colors
│   │   │   └── AndroidManifest.xml   # Permissions (INTERNET, ACCESS_NETWORK_STATE)
│   │   └── build.gradle.kts          # App-level build script (Hermes & React 0.75.4)
│   ├── build.gradle.kts              # Project-level build script
│   ├── settings.gradle.kts           # Plugin & dependency repositories
│   └── gradle.properties             # Memory & Java 24 configuration
│
├── src/
│   ├── api/                          # Centralized networking layer
│   │   ├── apiClient.ts              # Axios instance with Bearer interceptors
│   │   └── endpoints.ts              # 33+ REST API route definitions
│   │
│   ├── services/                     # Domain API services
│   │   ├── authService.ts
│   │   ├── storeService.ts
│   │   ├── categoryService.ts
│   │   ├── productService.ts
│   │   ├── inventoryService.ts
│   │   ├── salesService.ts
│   │   ├── purchaseService.ts
│   │   ├── partnerService.ts
│   │   ├── financeService.ts
│   │   ├── reportService.ts
│   │   └── unitService.ts
│   │
│   ├── components/                   # Native UI primitives
│   │   ├── common/                   # Header, Button, Input, Card, Badge, Loader, EmptyState
│   │   └── WaveHeader.tsx            # Nexora Mart SVG wave branding
│   │
│   ├── context/                      # State management
│   │   ├── AuthContext.tsx           # Authentication state & store switching
│   │   └── ThemeContext.tsx          # Dynamic theme provider
│   │
│   ├── constants/                    # Design tokens & server hosts
│   │   ├── colors.ts
│   │   └── config.ts
│   │
│   ├── models/                       # TypeScript interfaces
│   │   └── types.ts
│   │
│   ├── navigation/                   # React Navigation 6 architecture
│   │   ├── types.ts                  # RootStackParamList & MainTabParamList
│   │   └── AppNavigator.tsx          # Native Stack & Bottom Tab navigators
│   │
│   ├── screens/                      # Native mobile screens (21 screens)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── partners/
│   │   ├── reports/
│   │   ├── finance/
│   │   └── profile/
│   │
│   └── utils/                        # Local storage, formatters, and validators
│       ├── storage.ts
│       ├── formatters.ts
│       └── validators.ts
│
├── App.tsx                           # Root component with Providers
├── index.js                          # React Native AppRegistry entrypoint
├── package.json                      # Dependencies
└── tsconfig.json                     # Strict TypeScript configuration
```

---

## 🛠️ Build & Installation Guide

### Prerequisites
- **Node.js**: v18+ or v20+
- **JDK**: Java 17+ or Java 24
- **Android SDK**: Android API 34 (`compileSdk = 34`, `minSdk = 24`)
- **Android Studio / Command Line Tools**

### 1. Install Node Dependencies
```bash
cd react-native-app
npm install
```

### 2. Verify TypeScript Types
```bash
npm run typecheck
# or: npx tsc --noEmit
```

### 3. Generate Offline JS Bundle
To compile the JavaScript application into a production native bundle:
```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res
```

### 4. Build Android Debug APK
```bash
cd android
.\gradlew assembleDebug
```
The compiled APK will be located at:
```
react-native-app/android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Build Android Release APK
```bash
cd android
.\gradlew assembleRelease
```
The release APK will be located at:
```
react-native-app/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔗 Backend Connection & Network Configuration

The application is pre-configured to communicate with the FastAPI backend:

| Environment | Host URL | Description |
|---|---|---|
| **Android Emulator** | `http://10.0.2.2:8000` | Loopback alias to host machine localhost |
| **Physical Android Device** | `http://<YOUR_LAN_IP>:8000` | Local network IP of workstation running backend |
| **Production Server** | `https://api.nexoramart.com` | Live production cloud deployment |

The active backend endpoint can be dynamically updated inside `src/constants/config.ts` or switched in the in-app **Settings Screen**.

---

## 👥 Default Credentials

- **Username / Email**: `demo@nmart.com`
- **Password**: `password123`
- **Role**: Store Owner / Admin

