/**
 * Purchases & Supplier Invoices Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Purchase, PurchaseCreatePayload } from '../models/types';

export const purchaseService = {
  async getPurchases(params?: {
    supplierId?: number;
    page?: number;
    limit?: number;
  }): Promise<Purchase[]> {
    return apiClient.get<Purchase[]>(Endpoints.PURCHASES.LIST, {
      params: {
        supplier_id: params?.supplierId,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  async getPurchaseDetail(id: number): Promise<Purchase> {
    return apiClient.get<Purchase>(Endpoints.PURCHASES.DETAIL(id));
  },

  async createPurchase(payload: PurchaseCreatePayload): Promise<Purchase> {
    return apiClient.post<Purchase>(Endpoints.PURCHASES.CREATE, payload);
  },
};

export default purchaseService;

