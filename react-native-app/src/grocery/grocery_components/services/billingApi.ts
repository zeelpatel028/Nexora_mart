import apiClient from '../../../api/apiClient';

export interface BillItemPayload {
  product_id: string | number;
  product_name: string;
  price_with_tax?: number;
  selling_price?: number;
  gst_rate?: number;
  unit?: string;
  qty?: number;
  quantity?: number;
}

export interface MakeBillPayload {
  customer_type: 'walk_in' | 'khata' | 'WALK_IN' | 'KHATA';
  customer_id?: number | null;
  walk_in_name?: string;
  walk_in_phone?: string;
  walk_in_address?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  discount_amount?: number;
  paid_amount?: number;
  payment_method?: string;
  idempotency_key?: string;
  template_id?: string;
  notes?: string;
  items: BillItemPayload[];
}

export function normalizeInvoice(inv: any) {
  if (!inv) return inv;
  const grandTotal = Number(inv.grand_total ?? inv.total_amount ?? 0);
  const paidAmount =
    inv.paid_amount !== undefined && inv.paid_amount !== null
      ? Number(inv.paid_amount)
      : String(inv.payment_status || '').toLowerCase() === 'paid'
      ? grandTotal
      : 0;
  const remaining = Math.max(0, grandTotal - paidAmount);

  return {
    ...inv,
    invoice_code: inv.invoice_code || inv.invoice_number,
    invoice_number: inv.invoice_code || inv.invoice_number,
    customer_name: inv.customer_name || inv.walk_in_name || 'Walk-in Customer',
    customer_phone: inv.customer_phone || inv.walk_in_phone || null,
    customer_address: inv.customer_address || inv.walk_in_address || null,
    subtotal: Number(inv.subtotal ?? 0),
    total_tax: Number(inv.total_tax ?? inv.tax_amount ?? 0),
    tax_amount: Number(inv.total_tax ?? inv.tax_amount ?? 0),
    discount_amount: Number(inv.discount_amount ?? 0),
    grand_total: grandTotal,
    total_amount: grandTotal,
    paid_amount: paidAmount,
    remaining_amount: remaining,
    payment_status: String(inv.payment_status || 'unpaid').toLowerCase(),
    items: (inv.items || []).map((it: any) => ({
      ...it,
      qty: Number(it.qty ?? it.quantity ?? 0),
      quantity: Number(it.qty ?? it.quantity ?? 0),
      base_price: Number(it.base_price ?? 0),
      gst_rate: Number(it.gst_rate ?? 0),
      tax_amount: Number(it.tax_amount ?? 0),
      price_with_tax: Number(it.price_with_tax ?? it.unit_price ?? 0),
      unit_price: Number(it.price_with_tax ?? it.unit_price ?? 0),
      line_total: Number(it.line_total ?? it.total_amount ?? 0),
      total_amount: Number(it.line_total ?? it.total_amount ?? 0),
    })),
  };
}

export const billingApi = {
  makeBill: async (data: MakeBillPayload) => {
    const payload = {
      customer_type: String(data.customer_type || 'walk_in').toLowerCase(),
      customer_id: data.customer_id ?? null,
      walk_in_name: data.walk_in_name ?? data.customer_name ?? 'Walk-in Customer',
      walk_in_phone: data.walk_in_phone ?? data.customer_phone ?? undefined,
      walk_in_address: data.walk_in_address ?? data.customer_address ?? undefined,
      discount_amount: Number(data.discount_amount ?? 0),
      paid_amount: data.paid_amount !== undefined ? Number(data.paid_amount) : undefined,
      payment_method: data.payment_method || 'CASH',
      idempotency_key: data.idempotency_key || `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      template_id: data.template_id || 'modern_orange',
      items: (data.items || []).map((it) => ({
        product_id: String(it.product_id),
        product_name: it.product_name,
        price_with_tax: Number(it.price_with_tax ?? it.selling_price ?? 0),
        gst_rate: Number(it.gst_rate ?? 0),
        unit: it.unit || 'Piece',
        qty: Number(it.qty ?? it.quantity ?? 1),
      })),
    };
    const res = await apiClient.post('/grocery/billing/make-bill', payload);
    return normalizeInvoice(res);
  },

  listInvoices: async (params?: { customer_id?: number; payment_status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/billing/invoices', { params });
    const items = Array.isArray((res as any)?.items) ? (res as any).items.map(normalizeInvoice) : [];
    return { ...(res as any), items };
  },

  getInvoiceDetail: async (invoiceId: number) => {
    const res = await apiClient.get(`/grocery/billing/invoices/${invoiceId}`);
    return normalizeInvoice(res);
  },

  getInvoicePdfUrl: (invoiceId: number) => `/grocery/billing/invoices/${invoiceId}/pdf`,
};

export default billingApi;
