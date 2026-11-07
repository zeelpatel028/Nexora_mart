import api from './api';
import { API_ENDPOINTS } from '../constants';

export const storeService = {
  getStores: async () => {
    return await api.get(API_ENDPOINTS.STORES.LIST);
  },
  getMyStore: async () => {
    return await api.get(API_ENDPOINTS.STORES.MY_STORE);
  },
  createStore: async (storeData) => {
    return await api.post(API_ENDPOINTS.STORES.CREATE, storeData);
  },
  updateMyStore: async (data) => {
    return await api.put(API_ENDPOINTS.STORES.MY_STORE, data);
  },
  switchStore: async (storeId) => {
    return await api.post(API_ENDPOINTS.STORES.SWITCH(storeId));
  }
};

export default storeService;
