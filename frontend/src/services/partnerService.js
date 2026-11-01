import api from './api';
import { API_ENDPOINTS } from '../constants';

export const partnerService = {
  getCustomers: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await api.get(`${API_ENDPOINTS.CUSTOMERS.LIST}${query}`);
  },
  createCustomer: async (customerData) => {
    return await api.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
  },
  getCustomerDetail: async (id) => {
    return await api.get(API_ENDPOINTS.CUSTOMERS.DETAILS(id));
  },
  getSuppliers: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await api.get(`${API_ENDPOINTS.SUPPLIERS.LIST}${query}`);
  },
  createSupplier: async (supplierData) => {
    return await api.post(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);
  },
  getSupplierDetail: async (id) => {
    return await api.get(API_ENDPOINTS.SUPPLIERS.DETAILS(id));
  }
};

export default partnerService;

