import api from './api';
import { API_ENDPOINTS } from '../constants';

export const financeService = {
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ENDPOINTS.FINANCE.EXPENSES}?${query}` : API_ENDPOINTS.FINANCE.EXPENSES;
    return await api.get(url);
  },
  createExpense: async (expenseData) => {
    return await api.post(API_ENDPOINTS.FINANCE.EXPENSES, expenseData);
  },
  getPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ENDPOINTS.FINANCE.PAYMENTS}?${query}` : API_ENDPOINTS.FINANCE.PAYMENTS;
    return await api.get(url);
  },
  createPayment: async (paymentData) => {
    return await api.post(API_ENDPOINTS.FINANCE.PAYMENTS, paymentData);
  }
};

export default financeService;

