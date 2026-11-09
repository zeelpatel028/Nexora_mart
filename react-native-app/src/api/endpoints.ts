/**
 * Backend API Endpoints Registry
 * Strictly matched to existing FastAPI routers (backend/app/routes)
 */
export const Endpoints = {
  // Authentication & Session
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    LOGOUT: '/auth/logout',
  },

  // Store Types (Multi-Store System)
  STORE_TYPES: {
    LIST: '/store-types',
    DETAIL: (id: number) => `/store-types/${id}`,
  },

  // Merchant Store Profile
  STORES: {
    MY_STORE: '/stores/my-store',
    CURRENT: '/stores/current',
  },

  // Bills (POS & Invoices)
  BILLS: {
    LIST: '/bills',
    CREATE: '/bills',
    DETAIL: (id: number) => `/bills/${id}`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: number) => `/orders/${id}`,
  },

  // Account & Analytics
  ACCOUNT: {
    GET: '/account',
    UPDATE: '/account',
    SALES_ANALYTICS: '/analytics/sales',
  },

  // Store Categories & Dynamic Fields
  CATEGORIES: {
    LIST: '/categories/',
    CREATE: '/categories/',
    DETAIL: (id: number) => `/categories/${id}`,
    FIELDS: (id: number) => `/categories/${id}/fields`,
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
    ADD_FIELD: (id: number) => `/categories/${id}/fields`,
    UPDATE_FIELD: (fieldId: number) => `/categories/fields/${fieldId}`,
    DELETE_FIELD: (fieldId: number) => `/categories/fields/${fieldId}`,
  },

  // Products & Variants
  PRODUCTS: {
    LIST: '/products/',
    CREATE: '/products/',
    DETAIL: (id: number) => `/products/${id}`,
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
  },

  // Inventory & Stock Movements
  INVENTORY: {
    LIST: '/inventory/',
    STOCK_IN: '/inventory/stock-in',
    STOCK_OUT: '/inventory/stock-out',
    ADJUST: '/inventory/adjust',
    LOW_STOCK: '/inventory/low-stock',
    EXPIRY_ALERTS: '/inventory/expiry-alerts',
    HISTORY: '/inventory/history',
  },

  // Sales Orders & POS Checkout
  SALES: {
    LIST: '/sales/',
    CREATE: '/sales/',
    DETAIL: (id: number) => `/sales/${id}`,
  },

  // Purchases & Supplier Invoices
  PURCHASES: {
    LIST: '/purchases/',
    CREATE: '/purchases/',
    DETAIL: (id: number) => `/purchases/${id}`,
  },

  // CRM Partners (Customers & Suppliers)
  PARTNERS: {
    CUSTOMERS: '/customers',
    CUSTOMER_DETAIL: (id: number) => `/customers/${id}`,
    SUPPLIERS: '/suppliers',
    SUPPLIER_DETAIL: (id: number) => `/suppliers/${id}`,
  },

  // Finance, Expenses & Payment Audit
  FINANCE: {
    EXPENSES: '/expenses',
    EXPENSE_DETAIL: (id: number) => `/expenses/${id}`,
    PAYMENTS: '/payments',
  },

  // Business Intelligence & Profitability Reports
  REPORTS: {
    DASHBOARD_SUMMARY: '/reports/dashboard-summary',
    ANALYTICS_OVERVIEW: '/reports/analytics-overview',
    SALES_ANALYTICS: '/reports/sales-analytics',
    CATEGORY_PERFORMANCE: '/reports/category-performance',
    INVENTORY_VALUATION: '/reports/inventory-valuation',
  },

  // Measurement Units
  UNITS: {
    LIST: '/units/',
  },

  // Server Health Check
  HEALTH: '/health',
};

export default Endpoints;

