import apiClient from '../../../api/apiClient';

export interface CustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  credit_limit?: number;
}

export const customerApi = {
  getDashboardMetrics: async () => {
    const res = await apiClient.get('/customers/dashboard');
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  listCustomers: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/customers', { params });
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  createCustomer: async (data: CustomerPayload) => {
    const res = await apiClient.post('/customers', data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  getCustomerDetails: async (customerId: number, filterStatus: string = 'ALL') => {
    const res = await apiClient.get(`/customers/${customerId}/details`, {
      params: { filter_status: filterStatus },
    });
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  receivePayment: async (customerId: number, data: { amount: number; payment_method?: string; notes?: string }) => {
    const res = await apiClient.post(`/customers/${customerId}/receive-payment`, data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  getStatement: async (customerId: number) => {
    const res = await apiClient.get(`/customers/${customerId}/statement`);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },
};

export default customerApi;
