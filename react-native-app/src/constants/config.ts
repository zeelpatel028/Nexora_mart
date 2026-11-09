/**
 * Application Global Configuration
 */
import { Platform } from 'react-native';

export const PRODUCTION_API_URL = 'https://nexora-mart-i996.onrender.com/api';
export const LOCAL_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://localhost:8000/api',
  default: 'http://127.0.0.1:8000/api',
}) as string;

export const Config = {
  APP_NAME: 'Nexora Mart',
  APP_VERSION: '1.0.0',
  SLOGAN: 'Cloud Retail Commerce & Merchant Platform',

  // Network API Base URL
  // Default to production cloud Render server with fallback to local development
  DEFAULT_API_URL: PRODUCTION_API_URL,
  PRODUCTION_API_URL,
  LOCAL_API_URL,

  TIMEOUT_MS: 20000,

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
