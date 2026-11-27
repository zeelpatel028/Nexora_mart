import apiClient from '../../../api/apiClient';

export interface SupplierPayload {
  store_name?: string;
  seller_name?: string;
  name?: string;
  company_name?: string;
  phone: string;
  email?: string;
  address?: string;
  gst_number?: string;
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  bank_account_number?: string;
  ifsc?: string;
  bank_ifsc?: string;
  upi_id?: string;
}

function normalizeSupplier(s: any) {
  if (!s) return s;
  return {
    ...s,
    store_name: s.store_name || s.company_name || s.seller_name || s.name || '',
    company_name: s.store_name || s.company_name || '',
    seller_name: s.seller_name || s.name || s.store_name || '',
    name: s.seller_name || s.name || s.store_name || '',
    balance: Number(s.pending_payment_amount ?? s.pending_balance ?? s.balance ?? 0),
    payable_balance: Number(s.pending_payment_amount ?? s.pending_balance ?? s.payable_balance ?? 0),
    total_orders: Number(s.total_orders_count ?? s.total_orders ?? 0),
    orders_count: Number(s.total_orders_count ?? s.total_orders ?? 0),
    total_purchases: Number(s.total_purchase_amount ?? s.total_purchases ?? 0),
  };
}

export const supplierApi = {
  getDashboardMetrics: async () => {
    const res = await apiClient.get<any>('/grocery/suppliers/dashboard');
    return {
      ...res,
      total_suppliers: res?.total_suppliers ?? 0,
      pending_orders: res?.total_pending_orders ?? res?.pending_orders ?? 0,
      pending_payments: res?.total_pending_payments ?? res?.pending_payments ?? 0,
      total_purchases: res?.total_purchase_amount ?? res?.total_purchases ?? 0,
    };
  },

  listSuppliers: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/suppliers', { params });
    const raw = Array.isArray((res as any)?.items)
      ? (res as any).items
      : Array.isArray(res)
      ? (res as any[])
      : [];
    const items = raw.map(normalizeSupplier);
    return items;
  },

  listSuppliersPaged: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/suppliers', { params });
    const items = Array.isArray((res as any)?.items) ? (res as any).items.map(normalizeSupplier) : [];
    return { ...(res as any), items, suppliers: items };
  },

  createSupplier: async (data: SupplierPayload) => {
    const payload = {
      store_name: (data.store_name || data.company_name || data.seller_name || data.name || '').trim(),
      seller_name: (data.seller_name || data.name || data.store_name || '').trim(),
      phone: (data.phone || '').trim(),
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
      gst_number: data.gst_number?.trim() || undefined,
      bank_name: data.bank_name?.trim() || undefined,
      account_holder: data.account_holder?.trim() || undefined,
      account_number: (data.account_number || data.bank_account_number)?.trim() || undefined,
      ifsc: (data.ifsc || data.bank_ifsc)?.trim() || undefined,
      upi_id: data.upi_id?.trim() || undefined,
    };
    const res = await apiClient.post('/grocery/suppliers', payload);
    return normalizeSupplier(res);
  },

  getSupplierDetails: async (supplierId: number) => {
    const res = await apiClient.get<any>(`/grocery/suppliers/${supplierId}`);
    return {
      ...res,
      supplier: normalizeSupplier(res?.supplier),
    };
  },

  paySupplier: async (supplierId: number, data: { amount: number; payment_method?: string; notes?: string }) => {
    const detail = await apiClient.get<any>(`/grocery/suppliers/${supplierId}`);
    const orders = Array.isArray(detail?.orders) ? detail.orders : [];
    const pendingOrder = orders.find((o: any) => String(o.payment_status || '').toLowerCase() !== 'paid');
    if (pendingOrder) {
      return apiClient.post(`/grocery/orders/${pendingOrder.id}/pay`, {
        paid: true,
        amount: Number(data.amount),
        payment_method: data.payment_method || 'CASH',
        notes: data.notes || undefined,
      });
    }
    return apiClient.post('/grocery/payments', {
      reference_type: 'supplier',
      reference_id: supplierId,
      amount: Number(data.amount),
      payment_method: data.payment_method || 'CASH',
      notes: data.notes || 'Supplier payment',
    });
  },

  getStatementPdfUrl: (supplierId: number) => `/grocery/suppliers/${supplierId}/statement/pdf`,
};

export default supplierApi;
