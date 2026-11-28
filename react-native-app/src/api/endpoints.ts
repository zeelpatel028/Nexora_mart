/**
 * Backend API Endpoints Registry
 * Strictly matched to existing FastAPI routers (backend/app/routes)
 */
export const Endpoints = {
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

  STORE_TYPES: {
    LIST: '/store-types',
    DETAIL: (id: number) => `/store-types/${id}`,
  },

  STORES: {
    MY_STORE: '/stores/my-store',
    CURRENT: '/stores/current',
  },

  BILLS: {
    LIST: '/bills',
    CREATE: '/bills',
    DETAIL: (id: number) => `/bills/${id}`,
  },

  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: number) => `/orders/${id}`,
  },

  ACCOUNT: {
    GET: '/account',
    UPDATE: '/account',
    SALES_ANALYTICS: '/analytics/sales',
  },

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

  BRANDS: {
    LIST: '/brands',
    CREATE: '/brands',
    DETAIL: (id: number) => `/brands/${id}`,
    UPDATE: (id: number) => `/brands/${id}`,
    DELETE: (id: number) => `/brands/${id}`,
  },

  PRODUCTS: {
    LIST: '/products/',
    FORM_CONFIG: '/products/form-config',
    CREATE: '/products/',
    DETAIL: (id: string | number) => `/products/${id}`,
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    BATCHES: (id: string | number) => `/products/${id}/batches`,
    VARIANTS: (id: string | number) => `/products/${id}/variants`,
  },

  INVENTORY: {
    LIST: '/inventory/',
    STOCK_IN: '/inventory/stock-in',
    STOCK_OUT: '/inventory/stock-out',
    ADJUST: '/inventory/adjust',
    LOW_STOCK: '/inventory/low-stock',
    EXPIRY_ALERTS: '/inventory/expiry-alerts',
    HISTORY: '/inventory/history',
  },

  SALES: {
    LIST: '/sales/',
    CREATE: '/sales/',
    DETAIL: (id: number) => `/sales/${id}`,
  },

  RETURNS: {
    LIST: '/returns/',
    CREATE: '/returns/',
    DETAIL: (id: number) => `/returns/${id}`,
  },

  PURCHASES: {
    LIST: '/purchases/',
    CREATE: '/purchases/',
    DETAIL: (id: number) => `/purchases/${id}`,
  },

  PARTNERS: {
    CUSTOMERS: '/customers',
    CUSTOMER_DETAIL: (id: number) => `/customers/${id}`,
    CUSTOMER_LEDGER: (id: number) => `/customers/${id}/ledger`,
    CUSTOMER_PAYMENT: (id: number) => `/customers/${id}/payment`,
    DEBIT_CUSTOMERS: '/debit-customers',
    DEBIT_PAYMENT: (id: number) => `/debit-customers/${id}/payment`,
    SUPPLIERS: '/suppliers',
    SUPPLIER_DETAIL: (id: number) => `/suppliers/${id}`,
  },

  FINANCE: {
    EXPENSES: '/expenses',
    EXPENSE_DETAIL: (id: number) => `/expenses/${id}`,
    PAYMENTS: '/payments',
  },

  REPORTS: {
    DASHBOARD_SUMMARY: '/reports/dashboard-summary',
    ANALYTICS_OVERVIEW: '/reports/analytics-overview',
    SALES_ANALYTICS: '/reports/sales-analytics',
    CATEGORY_PERFORMANCE: '/reports/category-performance',
    INVENTORY_VALUATION: '/reports/inventory-valuation',
  },

  UNITS: {
    LIST: '/units/',
  },

  CART: {
    GET: '/cart',
    ITEMS: '/cart/items',
    ITEM: (id: string | number) => `/cart/items/${id}`,
    CLEAR: '/cart',
  },

  WISHLIST: {
    GET: '/wishlist',
    ADD: (id: string | number) => `/wishlist/${id}`,
    REMOVE: (id: string | number) => `/wishlist/${id}`,
  },

  HEALTH: '/health',
};

export default Endpoints;
