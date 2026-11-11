import api from './api';
import { API_ENDPOINTS } from '../constants';

export const billingService = {
  getSales: async ({ customerId = null, paymentStatus = null, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    if (paymentStatus) params.append('payment_status', paymentStatus);
    params.append('page', page);
    params.append('limit', limit);
    return await api.get(`${API_ENDPOINTS.SALES.LIST}?${params.toString()}`);
  },
  createSale: async (saleData) => {
    return await api.post(API_ENDPOINTS.SALES.CREATE, saleData);
  },
  getSaleDetail: async (id) => {
    return await api.get(API_ENDPOINTS.SALES.DETAILS(id));
  },
  getPurchases: async ({ supplierId = null, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplier_id', supplierId);
    params.append('page', page);
    params.append('limit', limit);
    return await api.get(`${API_ENDPOINTS.PURCHASES.LIST}?${params.toString()}`);
  },
  createPurchase: async (purchaseData) => {
    return await api.post(API_ENDPOINTS.PURCHASES.CREATE, purchaseData);
  },
  getPurchaseDetail: async (id) => {
    return await api.get(API_ENDPOINTS.PURCHASES.DETAILS(id));
  },
  getReturns: async ({ page = 1, limit = 50 } = {}) => {
    return await api.get(`${API_ENDPOINTS.RETURNS.LIST}?page=${page}&limit=${limit}`);
  },
  createReturn: async (returnData) => {
    return await api.post(API_ENDPOINTS.RETURNS.CREATE, returnData);
  },
  getReturnDetail: async (id) => {
    return await api.get(API_ENDPOINTS.RETURNS.DETAILS(id));
  }
};

export default billingService;

