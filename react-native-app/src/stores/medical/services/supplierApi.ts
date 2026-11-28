import apiClient from '../../../api/apiClient';

export interface SupplierPayload {
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
}

export const supplierApi = {
  getDashboardMetrics: async () => {
    const res = await apiClient.get('/suppliers/dashboard');
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  listSuppliers: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/suppliers', { params });
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  createSupplier: async (data: SupplierPayload) => {
    const res = await apiClient.post('/suppliers', data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  getSupplierDetails: async (supplierId: number) => {
    const res = await apiClient.get(`/suppliers/${supplierId}/details`);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  paySupplier: async (supplierId: number, data: { amount: number; payment_method?: string; notes?: string }) => {
    const res = await apiClient.post(`/suppliers/${supplierId}/pay`, data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  getStatement: async (supplierId: number) => {
    const res = await apiClient.get(`/suppliers/${supplierId}/statement`);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },
};

export default supplierApi;
