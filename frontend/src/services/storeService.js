import api from './api';
import { API_ENDPOINTS } from '../constants';

export const storeService = {
  getMyStore: async () => {
    return await api.get(API_ENDPOINTS.STORES.MY_STORE);
  },
  updateMyStore: async (data) => {
    return await api.put(API_ENDPOINTS.STORES.MY_STORE, data);
  }
};

export default storeService;

