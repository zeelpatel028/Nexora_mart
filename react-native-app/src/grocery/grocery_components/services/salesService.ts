/**
 * Grocery Sales & Returns Service (backed by /grocery/billing & /grocery/returns)
 */
import apiClient from '../../../api/apiClient';
import billingApi, { normalizeInvoice } from './billingApi';
import { Sale, SaleCreatePayload, SalesReturn, ReturnCreatePayload } from '../../../api/types';

export const salesService = {
  async getSales(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    customerId?: number;
    paymentStatus?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<Sale[]> {
    const res = await billingApi.listInvoices({
      customer_id: params?.customerId,
      payment_status: params?.paymentStatus,
      search: params?.search,
      page: params?.page || 1,
      limit: params?.limit || 50,
    });
    return (res.items || []) as Sale[];
  },

  async getSaleDetail(id: number): Promise<Sale> {
    return (await billingApi.getInvoiceDetail(id)) as Sale;
  },

  async createSale(payload: SaleCreatePayload | any): Promise<Sale> {
    const res = await billingApi.makeBill({
      customer_type: payload.customer_id ? 'khata' : 'walk_in',
      customer_id: payload.customer_id,
      walk_in_name: payload.customer_name || 'Walk-in Customer',
      walk_in_phone: payload.customer_phone,
      payment_method: payload.payment_method || 'CASH',
      paid_amount: payload.paid_amount,
      discount_amount: payload.discount_amount,
      items: (payload.items || []).map((it: any) => ({
        product_id: String(it.product_id),
        product_name: it.product_name || 'Item',
        price_with_tax: Number(it.unit_price ?? it.selling_price ?? it.price_with_tax ?? 0),
        gst_rate: Number(it.gst_rate ?? 0),
        unit: it.unit || 'Piece',
        qty: Number(it.quantity ?? it.qty ?? 1),
      })),
    });
    return normalizeInvoice(res) as Sale;
  },

  async processReturn(payload: ReturnCreatePayload | any): Promise<SalesReturn> {
    return apiClient.post<SalesReturn>('/grocery/returns', {
      bill_id: payload.sale_id ?? payload.bill_id,
      reason: payload.reason || 'Customer Return',
      refund_method: payload.refund_method || 'CASH',
      notes: payload.notes,
      items: (payload.items || []).map((it: any) => ({
        product_id: String(it.product_id),
        quantity: Number(it.quantity ?? it.qty ?? 1),
        unit_price: Number(it.unit_price ?? it.refund_amount ?? 0),
      })),
    });
  },

  async getReturns(params?: { limit?: number }): Promise<{ items: SalesReturn[]; total: number }> {
    const items = await apiClient.get<SalesReturn[]>('/grocery/returns', { params });
    const list = Array.isArray(items) ? items : [];
    return { items: list, total: list.length };
  },
};

export default salesService;
