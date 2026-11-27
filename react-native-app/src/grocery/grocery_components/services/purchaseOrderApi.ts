import apiClient from '../../../api/apiClient';

export interface GroceryPurchaseOrderCreate {
  supplier_id: number;
  product_id: string | number;
  qty: number;
  unit?: string;
  purchase_price: number;
  expected_delivery_date?: string;
}

export interface PurchaseOrderPayload {
  supplier_id: number;
  product_id?: string | number;
  qty?: number;
  unit?: string;
  purchase_price?: number;
  items?: {
    product_id: string | number;
    product_name?: string;
    quantity: number;
    unit?: string;
    purchase_price: number;
  }[];
  expected_delivery_date?: string;
  notes?: string;
}

export interface ReceiveOrderPayload {
  received_quantity?: number;
  expiry_date?: string;
  batch_number?: string;
  notes?: string;
}

export interface PayOrderPayload {
  paid?: boolean;
  amount?: number;
  payment_method?: string;
  notes?: string;
}

function normalizeOrder(o: any) {
  if (!o) return o;
  return {
    ...o,
    order_number: o.order_code || o.order_number,
    order_code: o.order_code || o.order_number,
    order_status: o.status || o.order_status || 'placed',
    status: o.status || o.order_status || 'placed',
    quantity: Number(o.qty ?? o.quantity ?? 0),
    qty: Number(o.qty ?? o.quantity ?? 0),
    payment_status: o.payment_status || 'pending',
    total_amount: Number(o.total_amount ?? 0),
    purchase_price: Number(o.purchase_price ?? 0),
    expiry_alert_enabled: Boolean(o.expiry_alert_enabled),
  };
}

export const purchaseOrderApi = {
  listOrders: async (params?: { supplier_id?: number; status?: string; order_status?: string; search?: string; page?: number; limit?: number }) => {
    const queryParams = {
      supplier_id: params?.supplier_id,
      status: params?.status || params?.order_status,
      search: params?.search,
      page: params?.page || 1,
      limit: params?.limit || 50,
    };
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/orders', { params: queryParams });
    const items = Array.isArray((res as any)?.items) ? (res as any).items.map(normalizeOrder) : [];
    return { ...(res as any), items };
  },

  placeOrder: async (data: PurchaseOrderPayload | GroceryPurchaseOrderCreate) => {
    const firstItem = 'items' in data && Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : null;
    const payload: GroceryPurchaseOrderCreate = {
      supplier_id: data.supplier_id,
      product_id: (data as any).product_id ?? firstItem?.product_id ?? '',
      qty: Number((data as any).qty ?? firstItem?.quantity ?? 1),
      unit: (data as any).unit ?? firstItem?.unit ?? 'Piece',
      purchase_price: Number((data as any).purchase_price ?? firstItem?.purchase_price ?? 0),
      expected_delivery_date: data.expected_delivery_date || undefined,
    };
    const res = await apiClient.post('/grocery/orders', payload);
    return normalizeOrder(res);
  },

  receiveOrder: async (orderId: number, data: ReceiveOrderPayload) => {
    const res = await apiClient.post(`/grocery/orders/${orderId}/receive`, {
      received_quantity: data.received_quantity,
      expiry_date: data.expiry_date || undefined,
    });
    return normalizeOrder(res);
  },

  payOrder: async (orderId: number, data: PayOrderPayload) => {
    const res = await apiClient.post(`/grocery/orders/${orderId}/pay`, {
      paid: data.paid ?? true,
      amount: data.amount,
      payment_method: data.payment_method || 'CASH',
      notes: data.notes,
    });
    return normalizeOrder(res);
  },
};

export default purchaseOrderApi;
