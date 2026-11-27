/**
 * Application Global Configuration
 */
import { Platform } from 'react-native';

export const PRODUCTION_API_URL = 'https://nexora-mart-i996.onrender.com/api';
const ENV_API_BASE_URL =
  (typeof process !== 'undefined' && process.env && (process.env.API_BASE_URL || process.env.BACKEND_URL))
    ? String(process.env.API_BASE_URL || `${process.env.BACKEND_URL}/api`).trim().replace(/\/+$/, '')
    : '';
const SAFE_ENV_URL =
  ENV_API_BASE_URL && !ENV_API_BASE_URL.includes('localhost') && !ENV_API_BASE_URL.includes('127.0.0.1')
    ? ENV_API_BASE_URL
    : '';

export const LOCAL_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://localhost:8000/api',
  default: 'http://127.0.0.1:8000/api',
}) as string;

export const Config = {
  APP_NAME: 'Tulsi Mart',
  APP_VERSION: '1.0.0',
  SLOGAN: 'Cloud Retail Commerce & Merchant Platform',

  // Network API Base URL (never uses localhost on production Android)
  DEFAULT_API_URL: SAFE_ENV_URL || PRODUCTION_API_URL,
  API_BASE_URL: SAFE_ENV_URL || PRODUCTION_API_URL,
  PRODUCTION_API_URL,
  LOCAL_API_URL,

  TIMEOUT_MS: 45000,

  STORAGE_KEYS: {
    AUTH_TOKEN: 'nmart_auth_token',
    REFRESH_TOKEN: 'nmart_refresh_token',
    SESSION_EXPIRES_AT: 'nmart_session_expires_at',
    USER_DATA: 'nmart_auth_user',
    STORE_DATA: 'nmart_auth_store',
    API_URL: 'nmart_custom_api_url',
    THEME_MODE: 'nmart_theme_mode',
  },
};

export default Config;
