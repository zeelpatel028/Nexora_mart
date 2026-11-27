# Tulsi Mart – Project Structure

## 1. Overview
Tulsi Mart is an enterprise-grade multi-tenant retail and store management platform designed for 8 specialized retail segments:
- Grocery & Supermarkets
- Clothing & Apparel
- Pharmacy & Medical
- Mobile & Electronics
- Plastic & Household
- Handloom & Textiles
- Furniture & Home Decor
- Agro & Fertilizer

The platform comprises a **React Native Native Mobile Application** (zero WebView) and a **FastAPI Modular Microservices Backend** powered by PostgreSQL/SQLAlchemy, hosted on Render and Aiven Cloud PostgreSQL.

---

## 2. Directory Layout

```text
Nmart/
├── backend/                  # FastAPI Modular Backend
│   ├── app/
│   │   ├── api/              # API dependencies & versioned v1 routers
│   │   │   ├── dependencies.py
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       ├── billing_router.py
│   │   │       ├── orders_router.py
│   │   │       ├── customers_router.py
│   │   │       ├── suppliers_router.py
│   │   │       ├── store_prefixes_router.py
│   │   │       └── settings_router.py
│   │   ├── core/             # Security, JWT, Permissions, Exceptions
│   │   ├── database/         # Session management, base models, DB engine
│   │   ├── models/           # SQLAlchemy ORM models & table definitions
│   │   ├── repositories/     # Database repository pattern
│   │   ├── schemas/          # Pydantic v2 validation schemas
│   │   ├── services/         # Business logic layer
│   │   ├── stores/           # Store-specific models, schemas, and logic (8 stores)
│   │   │   ├── grocery/
│   │   │   ├── clothing/
│   │   │   ├── medical/
│   │   │   ├── electronics/
│   │   │   ├── plastic/
│   │   │   ├── handloom/
│   │   │   ├── furniture/
│   │   │   └── agro/
│   │   └── utils/            # Pagination, response helpers, validators
│   ├── alembic/              # Database migration scripts
│   └── tests/                # Automated unit and integration test suite
│
├── react-native-app/         # React Native Mobile App
│   ├── src/
│   │   ├── assets/           # SVG icons, images, sounds, fonts
│   │   ├── components/       # Common reusable UI, layout containers, Lucide AppIcon
│   │   ├── context/          # Auth, Theme, Store, and Settings context providers
│   │   ├── hooks/            # Custom hooks (useAuth, useTheme, useCurrency, useDebounce)
│   │   ├── navigation/       # RootNavigator, AuthNavigator, MainTabNavigator, MoreStackNavigator
│   │   ├── screens/          # Core screens (Dashboard, Products, Purchases, POS, Khata, Settings)
│   │   ├── services/         # Axios API clients, secure token storage, local storage
│   │   ├── stores/           # Store-wise modules (8 retail segments with dedicated screens)
│   │   ├── theme/            # Tulsi Mart color palette (#FF6700), typography, spacing
│   │   └── utils/            # formatCurrency, formatDate, validation, constants
│   ├── App.tsx
│   └── package.json
│
├── TulsiMart/                # Cleaned, standardized mirror of frontend structure
└── docs/                     # Complete architectural & user documentation (15 manuals)
```
