/**
 * Store Profile & Settings Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Store, StoreUpdatePayload } from '../models/types';

export const storeService = {
  async getMyStore(): Promise<Store> {
    return apiClient.get<Store>(Endpoints.STORES.MY_STORE);
  },

  async updateMyStore(payload: StoreUpdatePayload): Promise<Store> {
    return apiClient.put<Store>(Endpoints.STORES.MY_STORE, payload);
  },
};

export default storeService;

