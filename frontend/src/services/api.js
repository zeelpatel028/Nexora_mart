/**
 * Centralized API Client
 * Provides structured request handling, token injection, unified error handling,
 * and automatic dual-connection failover between Localhost and Render Cloud.
 */
import {
  LOCAL_API_URL,
  RENDER_API_URL,
  getInitialApiUrl,
  saveApiUrl
} from '../constants';

const TOKEN_KEY = 'nmart_auth_token';

let currentApiBaseUrl = getInitialApiUrl();

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Local storage unavailable
  }
};

export function getActiveApiUrl() {
  return currentApiBaseUrl;
}

export function setActiveApiUrl(url) {
  if (url && url.trim()) {
    currentApiBaseUrl = url.trim().replace(/\/+$/, '');
    saveApiUrl(currentApiBaseUrl);
  }
}

function getAlternateUrl(currentUrl) {
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
    return RENDER_API_URL;
  }
  return LOCAL_API_URL;
}

export async function request(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const isFullUrl = endpoint.startsWith('http');
  const primaryUrl = isFullUrl ? endpoint : `${currentApiBaseUrl}${endpoint}`;

  let response;
  let data;

  try {
    response = await fetch(primaryUrl, config);
  } catch (primaryErr) {
    // If relative endpoint, attempt automatic failover to the alternate server
    if (!isFullUrl) {
      const alternateBase = getAlternateUrl(currentApiBaseUrl);
      const fallbackUrl = `${alternateBase}${endpoint}`;
      try {
        console.warn(`[NMART API] Primary (${currentApiBaseUrl}) unreachable. Automatically trying alternate (${alternateBase})...`);
        response = await fetch(fallbackUrl, config);
        // Alternate succeeded: switch active base URL for future requests (in production only)
        if (!import.meta.env.DEV) {
          currentApiBaseUrl = alternateBase;
          saveApiUrl(alternateBase);
        }
      } catch (fallbackErr) {
        const error = new Error(
          `Cannot connect to backend server. Tried both Localhost (${LOCAL_API_URL}) and Render Cloud (${RENDER_API_URL}). Please verify your backend server is online.`
        );
        error.status = 0;
        error.cause = fallbackErr;
        throw error;
      }
    } else {
      const error = new Error(`Cannot connect to server at ${primaryUrl}`);
      error.status = 0;
      error.cause = primaryErr;
      throw error;
    }
  }

  // Parse response
  const contentType = response.headers.get('content-type');
  data = contentType && contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    let message = response.statusText || 'Request failed';
    if (data) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join('; ');
      } else if (data.message) {
        message = data.message;
      } else if (typeof data === 'string' && data.trim()) {
        message = data;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  getActiveApiUrl,
  setActiveApiUrl
};
