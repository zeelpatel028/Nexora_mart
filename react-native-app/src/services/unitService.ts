/**
 * Product Measurement Units Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Unit } from '../models/types';

export const unitService = {
  async getUnits(): Promise<Unit[]> {
    return apiClient.get<Unit[]>(Endpoints.UNITS.LIST);
  },
};

export default unitService;

