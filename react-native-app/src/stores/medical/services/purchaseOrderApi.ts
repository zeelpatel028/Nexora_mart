import apiClient from '../../../api/apiClient';

export interface PurchaseOrderItemPayload {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit?: string;
  purchase_price: number;
  gst_rate?: number;
}

export interface PurchaseOrderPayload {
  supplier_id: number;
  items: PurchaseOrderItemPayload[];
  expected_delivery_date?: string;
  notes?: string;
}

export interface ReceiveOrderPayload {
  received_quantity: number;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
}

export interface PayOrderPayload {
  amount: number;
  payment_method?: string;
  notes?: string;
}

export const purchaseOrderApi = {
  listOrders: async (params?: { supplier_id?: number; order_status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/orders', { params });
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  placeOrder: async (data: PurchaseOrderPayload) => {
    const res = await apiClient.post('/orders', data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  receiveOrder: async (orderId: number, data: ReceiveOrderPayload) => {
    const res = await apiClient.post(`/orders/${orderId}/receive`, data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  payOrder: async (orderId: number, data: PayOrderPayload) => {
    const res = await apiClient.post(`/orders/${orderId}/pay`, data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },
};

export default purchaseOrderApi;
