/**
 * Sales, Orders & POS Billing Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Sale, SaleCreatePayload, SalesReturn, ReturnCreatePayload } from '../models/types';

export const salesService = {
  async getSales(params?: {
    customerId?: number;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<Sale[]> {
    return apiClient.get<Sale[]>(Endpoints.SALES.LIST, {
      params: {
        customer_id: params?.customerId,
        payment_status: params?.paymentStatus,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  async getSaleDetail(id: number): Promise<Sale> {
    return apiClient.get<Sale>(Endpoints.SALES.DETAIL(id));
  },

  async createSale(payload: SaleCreatePayload): Promise<Sale> {
    return apiClient.post<Sale>(Endpoints.SALES.CREATE, payload);
  },

  async processReturn(payload: ReturnCreatePayload): Promise<SalesReturn> {
    return apiClient.post<SalesReturn>(Endpoints.RETURNS.CREATE, payload);
  },

  async getReturns(params?: { page?: number; limit?: number }): Promise<{ items: SalesReturn[]; total: number }> {
    return apiClient.get<{ items: SalesReturn[]; total: number }>(Endpoints.RETURNS.LIST, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },
};

export default salesService;

