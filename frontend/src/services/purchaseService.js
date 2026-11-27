import api from './api';
import { API_ENDPOINTS } from '../constants';

export const purchaseService = {
  getPurchases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ENDPOINTS.PURCHASES.LIST}?${query}` : API_ENDPOINTS.PURCHASES.LIST;
    return await api.get(url);
  },
  getPurchaseDetail: async (id) => {
    return await api.get(API_ENDPOINTS.PURCHASES.DETAILS(id));
  },
  createPurchase: async (purchaseData) => {
    return await api.post(API_ENDPOINTS.PURCHASES.CREATE, purchaseData);
  }
};

export default purchaseService;

