# Tulsi Mart – All-in-One Store Management Platform

Welcome to the official documentation for **Tulsi Mart**, an enterprise-grade retail and store management platform designed for 8 retail categories:
Grocery, Clothing, Medical/Pharmacy, Mobile & Electronics, Plastic, Handloom, Furniture, and Agro.

---

## Quick Navigation Index

| Document | Description |
| :--- | :--- |
| [PROJECT_STRUCTURE.md](file:///d:/Nexora/Nmart/docs/PROJECT_STRUCTURE.md) | Full folder layout for React Native app and FastAPI backend |
| [DATABASE_SCHEMA.md](file:///d:/Nexora/Nmart/docs/DATABASE_SCHEMA.md) | PostgreSQL schema, common tables, store-wise tables, and ledgers |
| [DATABASE_MIGRATION.md](file:///d:/Nexora/Nmart/docs/DATABASE_MIGRATION.md) | Alembic migration instructions and version history |
| [API_DOCUMENTATION.md](file:///d:/Nexora/Nmart/docs/API_DOCUMENTATION.md) | Complete REST API endpoint reference |
| [AUTHENTICATION.md](file:///d:/Nexora/Nmart/docs/AUTHENTICATION.md) | JWT authentication, RBAC, and security standards |
| [STORE_DATA_ISOLATION.md](file:///d:/Nexora/Nmart/docs/STORE_DATA_ISOLATION.md) | Strict multi-tenant isolation guarantees |
| [PRODUCT_MANAGEMENT.md](file:///d:/Nexora/Nmart/docs/PRODUCT_MANAGEMENT.md) | Product ID prefixing, GST rates, unit conversion, and alerts |
| [PURCHASE_ORDER_FLOW.md](file:///d:/Nexora/Nmart/docs/PURCHASE_ORDER_FLOW.md) | Purchase orders, isolated pricing, atomic receiving, and supplier ledger |
| [BILLING_FLOW.md](file:///d:/Nexora/Nmart/docs/BILLING_FLOW.md) | POS terminal, walk-in vs khata, GST math, and stock decrement |
| [KHATA_CUSTOMER_FLOW.md](file:///d:/Nexora/Nmart/docs/KHATA_CUSTOMER_FLOW.md) | Debit book, customer metrics, bill filters, and payments |
| [SUPPLIER_MANAGEMENT.md](file:///d:/Nexora/Nmart/docs/SUPPLIER_MANAGEMENT.md) | Vendor directory, payable balances, and statement sharing |
| [SETTINGS.md](file:///d:/Nexora/Nmart/docs/SETTINGS.md) | Themes, languages, currency, prefix editor, and JSON backup/restore |
| [UI_DESIGN_GUIDE.md](file:///d:/Nexora/Nmart/docs/UI_DESIGN_GUIDE.md) | Tulsi Mart color palette (#FF6700), typography, and SVG icons |
| [LOADING_SKELETON.md](file:///d:/Nexora/Nmart/docs/LOADING_SKELETON.md) | Shimmer loading skeleton components across screens |
| [BACKEND_DEPLOYMENT.md](file:///d:/Nexora/Nmart/docs/BACKEND_DEPLOYMENT.md) | Production deployment on Render and Aiven Cloud PostgreSQL |

---

## Getting Started

### 1. Run the Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Run the React Native Mobile App
```bash
cd react-native-app
npm install
npm run android
```
