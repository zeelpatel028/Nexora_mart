/**
 * Backend API Endpoints Configuration
 * Supports dual-connection to both Localhost and Render Cloud backend.
 */
export const LOCAL_API_URL = 'http://localhost:8000/api';
export const RENDER_API_URL = 'https://nexora-mart-i996.onrender.com/api';

export const STORAGE_KEY_API = 'nmart_custom_api_url';

export function getInitialApiUrl() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_API);
    // In local dev, if stored URL is pointing to Render, reset to Localhost to avoid stale failover lock
    if (import.meta.env.DEV && saved && saved.includes('onrender.com')) {
      localStorage.removeItem(STORAGE_KEY_API);
      return LOCAL_API_URL;
    }
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // LocalStorage unavailable
  }

  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return import.meta.env.DEV ? LOCAL_API_URL : RENDER_API_URL;
}

export function saveApiUrl(url) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY_API, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(STORAGE_KEY_API);
    }
  } catch {
    // Ignore
  }
}

export const API_BASE_URL = getInitialApiUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  STORES: {
    LIST: '/stores',
    CREATE: '/stores',
    MY_STORE: '/stores/my-store',
    UPDATE_MY_STORE: '/stores/my-store',
    SWITCH: (id) => `/stores/switch/${id}`,
    CONFIGURATIONS: '/stores/configurations'
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id) => `/categories/${id}`,
    FIELDS: (id) => `/categories/${id}/fields`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`
  },
  BRANDS: {
    LIST: '/brands',
    CREATE: '/brands',
    DETAILS: (id) => `/brands/${id}`,
    UPDATE: (id) => `/brands/${id}`,
    DELETE: (id) => `/brands/${id}`
  },
  PRODUCTS: {
    LIST: '/products',
    FORM_CONFIG: '/products/form-config',
    DETAILS: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    BATCHES: (id) => `/products/${id}/batches`,
    VARIANTS: (id) => `/products/${id}/variants`
  },
  INVENTORY: {
    LIST: '/inventory',
    STOCK_IN: '/inventory/stock-in',
    STOCK_OUT: '/inventory/stock-out',
    ADJUST: '/inventory/adjust',
    LOW_STOCK: '/inventory/low-stock',
    EXPIRING: '/inventory/expiring-soon',
    MOVEMENTS: '/inventory/movements'
  },
  SALES: {
    LIST: '/sales',
    CREATE: '/sales',
    DETAILS: (id) => `/sales/${id}`
  },
  INVOICES: {
    LIST: '/sales',
    CREATE: '/sales',
    DETAILS: (id) => `/sales/${id}`
  },
  PURCHASES: {
    LIST: '/purchases',
    CREATE: '/purchases',
    DETAILS: (id) => `/purchases/${id}`
  },
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    DETAILS: (id) => `/customers/${id}`
  },
  DEBIT_CUSTOMERS: {
    LIST: '/debit-customers',
    RECORD_PAYMENT: (id) => `/debit-customers/${id}/payment`
  },
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    DETAILS: (id) => `/suppliers/${id}`
  },
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    DETAILS: (id) => `/employees/${id}`,
    UPDATE: (id) => `/employees/${id}`,
    DELETE: (id) => `/employees/${id}`
  },
  FINANCE: {
    EXPENSES: '/expenses',
    PAYMENTS: '/payments'
  },
  REPORTS: {
    DASHBOARD_SUMMARY: '/reports/dashboard-summary',
    ANALYTICS_OVERVIEW: '/reports/analytics-overview',
    SALES_ANALYTICS: '/reports/sales-analytics',
    CATEGORY_PERFORMANCE: '/reports/category-performance',
    INVENTORY_VALUATION: '/reports/inventory-valuation'
  },
  UNITS: {
    LIST: '/units'
  }
};

export default API_ENDPOINTS;
