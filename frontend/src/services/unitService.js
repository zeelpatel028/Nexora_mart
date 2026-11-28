import api from './api';
import { API_ENDPOINTS } from '../constants';

export const unitService = {
  getUnits: async () => {
    return await api.get(API_ENDPOINTS.UNITS.LIST);
  }
};

export default unitService;

