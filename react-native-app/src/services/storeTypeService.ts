import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { StoreType } from '../models/types';

export const storeTypeService = {
  async getStoreTypes(activeOnly: boolean = true): Promise<StoreType[]> {
    return apiClient.get<StoreType[]>(Endpoints.STORE_TYPES.LIST, {
      params: { active_only: activeOnly },
    });
  },

  async getStoreType(id: number): Promise<StoreType> {
    return apiClient.get<StoreType>(Endpoints.STORE_TYPES.DETAIL(id));
  },
};

export default storeTypeService;

