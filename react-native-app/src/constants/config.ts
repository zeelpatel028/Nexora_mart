/**
 * Application Global Configuration
 */
import { Platform } from 'react-native';

export const Config = {
  APP_NAME: 'Nexora Mart',
  APP_VERSION: '1.0.0',
  SLOGAN: 'Cloud Retail Commerce & Merchant Platform',

  // Network API Base URL
  // On Android Emulator: 10.0.2.2 points to host machine's 127.0.0.1
  // On physical Android device: replace with host IP e.g., http://192.168.1.100:8000/api
  DEFAULT_API_URL: Platform.select({
    android: 'http://10.0.2.2:8000/api',
    ios: 'http://localhost:8000/api',
    default: 'http://127.0.0.1:8000/api',
  }),

  TIMEOUT_MS: 15000,

  STORAGE_KEYS: {
    AUTH_TOKEN: 'nmart_auth_token',
    USER_DATA: 'nmart_auth_user',
    API_URL: 'nmart_custom_api_url',
    THEME_MODE: 'nmart_theme_mode',
  },
};

export default Config;

