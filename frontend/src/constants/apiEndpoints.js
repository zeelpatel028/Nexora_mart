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
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  STORES: {
    MY_STORE: '/stores/my-store'
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id) => `/categories/${id}`,
    FIELDS: (id) => `/categories/${id}/fields`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`
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
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    DETAILS: (id) => `/suppliers/${id}`
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
