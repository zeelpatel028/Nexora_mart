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
  getDebitCustomers: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await api.get(`${API_ENDPOINTS.DEBIT_CUSTOMERS.LIST}${query}`);
  },
  recordDebitPayment: async (customerId, paymentData) => {
    return await api.post(API_ENDPOINTS.DEBIT_CUSTOMERS.RECORD_PAYMENT(customerId), paymentData);
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

