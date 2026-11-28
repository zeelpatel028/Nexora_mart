import apiClient from '../../../api/apiClient';

export interface CustomerPayload {
  name: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
}

export const customerApi = {
  getDashboardMetrics: async () => {
    const res = await apiClient.get<any>('/grocery/customers/dashboard');
    return res;
  },

  listCustomers: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/customers', { params });
    const items = Array.isArray((res as any)?.items)
      ? (res as any).items
      : Array.isArray(res)
      ? (res as any[])
      : [];
    return { ...(res as any), items, customers: items };
  },

  createCustomer: async (data: CustomerPayload) => {
    return apiClient.post('/grocery/customers', {
      name: data.name,
      phone: data.phone || '0000000000',
      address: data.address || undefined,
    });
  },

  getCustomerDetails: async (customerId: number, filterStatus: string = 'ALL') => {
    const tab = filterStatus && filterStatus.toUpperCase() !== 'ALL' ? filterStatus.toLowerCase() : undefined;
    return apiClient.get(`/grocery/customers/${customerId}`, {
      params: tab ? { tab_filter: tab } : undefined,
    });
  },

  receivePayment: async (customerId: number, data: { amount: number; payment_method?: string; notes?: string }) => {
    return apiClient.post(`/grocery/customers/${customerId}/pay`, {
      amount: Number(data.amount),
      payment_method: data.payment_method || 'CASH',
      notes: data.notes || undefined,
    });
  },

  getStatementPdfUrl: (customerId: number) => `/grocery/customers/${customerId}/statement/pdf`,
};

export default customerApi;
