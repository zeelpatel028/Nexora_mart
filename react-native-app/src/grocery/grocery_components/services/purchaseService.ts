/**
 * Grocery Purchases Service (backed by /grocery/orders)
 */
import purchaseOrderApi from './purchaseOrderApi';
import { Purchase, PurchaseCreatePayload } from '../../../api/types';

export const purchaseService = {
  async getPurchases(params?: {
    supplierId?: number;
    page?: number;
    limit?: number;
  }): Promise<Purchase[]> {
    const res = await purchaseOrderApi.listOrders({
      supplier_id: params?.supplierId,
      page: params?.page || 1,
      limit: params?.limit || 50,
    });
    return (res?.items || []) as Purchase[];
  },

  async getPurchaseDetail(id: number): Promise<Purchase> {
    const res = await purchaseOrderApi.listOrders({ limit: 100 });
    const match = (res?.items || []).find((o: any) => Number(o.id) === Number(id));
    return (match || { id }) as Purchase;
  },

  async createPurchase(payload: PurchaseCreatePayload | any): Promise<Purchase> {
    const items = payload.items || [];
    let lastCreated: any = null;
    for (const it of items) {
      const ord = await purchaseOrderApi.placeOrder({
        supplier_id: payload.supplier_id,
        product_id: String(it.product_id),
        qty: Number(it.quantity || 1),
        unit: it.unit || 'Piece',
        purchase_price: Number(it.unit_cost || 0),
        expected_delivery_date: payload.expected_delivery_date,
      });
      await purchaseOrderApi.receiveOrder(ord.id, {
        received_quantity: Number(it.quantity || 1),
        expiry_date: it.expiry_date,
      });
      lastCreated = ord;
    }
    return lastCreated as Purchase;
  },
};

export default purchaseService;
