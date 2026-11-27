import api from './api';
import { API_ENDPOINTS } from '../constants';

export const inventoryService = {
  getInventory: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await api.get(`${API_ENDPOINTS.INVENTORY.LIST}${query}`);
  },
  stockIn: async (data) => {
    return await api.post(API_ENDPOINTS.INVENTORY.STOCK_IN, data);
  },
  stockOut: async (data) => {
    return await api.post(API_ENDPOINTS.INVENTORY.STOCK_OUT, data);
  },
  adjustStock: async (data) => {
    return await api.post(API_ENDPOINTS.INVENTORY.ADJUST, data);
  },
  getLowStockAlerts: async () => {
    return await api.get(API_ENDPOINTS.INVENTORY.LOW_STOCK);
  },
  getExpiringSoon: async (days = 30) => {
    return await api.get(`${API_ENDPOINTS.INVENTORY.EXPIRING}?days=${days}`);
  },
  getMovements: async (productId = null, limit = 50) => {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    params.append('limit', limit);
    return await api.get(`${API_ENDPOINTS.INVENTORY.MOVEMENTS}?${params.toString()}`);
  }
};

export default inventoryService;

