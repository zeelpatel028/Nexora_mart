/**
 * Persistent Storage Utilities with In-Memory Cache and Safe Native Fallback
 */
import { Config } from '../constants/config';
import { User } from '../models/types';

// In-memory cache for ultra-fast and fail-safe access
let memoryCache: Record<string, string> = {};
let asyncStorageInstance: any = undefined;

function getNativeStorage(): any {
  if (asyncStorageInstance !== undefined) {
    return asyncStorageInstance;
  }
  try {
    // Dynamically require to prevent top-level module crash when native module isn't loaded
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-async-storage/async-storage');
    asyncStorageInstance = mod.default || mod;
  } catch (err) {
    console.warn('Native AsyncStorage not available, using in-memory fallback:', err);
    asyncStorageInstance = null;
  }
  return asyncStorageInstance;
}

export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryCache[key] = value;
      const native = getNativeStorage();
      if (native && typeof native.setItem === 'function') {
        await native.setItem(key, value);
      }
    } catch (err) {
      console.warn('Storage setItem warning:', err);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (memoryCache[key] !== undefined) {
        return memoryCache[key];
      }
      const native = getNativeStorage();
      if (native && typeof native.getItem === 'function') {
        const val = await native.getItem(key);
        if (val !== null && val !== undefined) {
          memoryCache[key] = val;
          return val;
        }
      }
      return memoryCache[key] || null;
    } catch (err) {
      console.warn('Storage getItem warning:', err);
      return memoryCache[key] || null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      delete memoryCache[key];
      const native = getNativeStorage();
      if (native && typeof native.removeItem === 'function') {
        await native.removeItem(key);
      }
    } catch (err) {
      console.warn('Storage removeItem warning:', err);
    }
  },

  async clear(): Promise<void> {
    try {
      memoryCache = {};
      const native = getNativeStorage();
      if (native && typeof native.clear === 'function') {
        await native.clear();
      }
    } catch (err) {
      console.warn('Storage clear warning:', err);
    }
  },

  // Auth-specific helpers
  async getAuthToken(): Promise<string | null> {
    return this.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
  },

  async setAuthToken(token: string): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async removeAuthToken(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async removeRefreshToken(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getSessionExpiresAt(): Promise<number | null> {
    const raw = await this.getItem(Config.STORAGE_KEYS.SESSION_EXPIRES_AT);
    return raw ? parseInt(raw, 10) : null;
  },

  async setSessionExpiresAt(timestamp: number): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.SESSION_EXPIRES_AT, timestamp.toString());
  },

  async getStore(): Promise<any | null> {
    const raw = await this.getItem(Config.STORAGE_KEYS.STORE_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setStore(store: any): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.STORE_DATA, JSON.stringify(store));
  },

  async removeStore(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.STORE_DATA);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeAuthToken(),
      this.removeRefreshToken(),
      this.removeUser(),
      this.removeStore(),
      this.removeItem(Config.STORAGE_KEYS.SESSION_EXPIRES_AT),
    ]);
  },

  async getUser(): Promise<User | null> {
    const raw = await this.getItem(Config.STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.USER_DATA);
  },

  async getCustomApiUrl(): Promise<string | null> {
    return this.getItem(Config.STORAGE_KEYS.API_URL);
  },

  async setCustomApiUrl(url: string): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.API_URL, url);
  },
};

export default storage;
