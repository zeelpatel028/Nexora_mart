/**
 * Centralized API Client
 * Provides structured request handling, token injection, and unified error handling
 */
import { API_BASE_URL } from '../constants';

const TOKEN_KEY = 'nmart_auth_token';

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

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
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

  let response;
  let data;
  try {
    response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch (networkErr) {
    const error = new Error(`Cannot connect to backend server. Please verify backend status at ${API_BASE_URL}.`);
    error.status = 0;
    error.cause = networkErr;
    throw error;
  }

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
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};
