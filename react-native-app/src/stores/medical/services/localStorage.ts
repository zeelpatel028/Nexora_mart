import storage from '../../../api/storage';

export const localStorage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const val = await storage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await storage.removeItem(key);
    } catch (err) {
      console.warn('LocalStorage remove error:', err);
    }
  },
};

export default localStorage;
