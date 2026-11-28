import apiClient from '../../../api/apiClient';

export interface BillItemPayload {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit?: string;
  selling_price: number;
  gst_rate?: number;
}

export interface MakeBillPayload {
  customer_id?: number;
  customer_type: 'WALK_IN' | 'KHATA';
  customer_name?: string;
  customer_phone?: string;
  items: BillItemPayload[];
  discount_amount?: number;
  paid_amount?: number;
  payment_method?: string;
  notes?: string;
}

export const billingApi = {
  makeBill: async (data: MakeBillPayload) => {
    const res = await apiClient.post('/billing/make-bill', data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  listInvoices: async (params?: { customer_id?: number; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/billing/invoices', { params });
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  getInvoiceDetail: async (invoiceId: number) => {
    const res = await apiClient.get(`/billing/invoices/${invoiceId}`);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },
};

export default billingApi;
