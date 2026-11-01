import api from './api';
import { API_ENDPOINTS } from '../constants';

export const reportService = {
  getDashboardSummary: async () => {
    return await api.get(API_ENDPOINTS.REPORTS.DASHBOARD_SUMMARY);
  },
  getSalesAnalytics: async (days = 14) => {
    return await api.get(`${API_ENDPOINTS.REPORTS.SALES_ANALYTICS}?days=${days}`);
  },
  getCategoryPerformance: async () => {
    return await api.get(API_ENDPOINTS.REPORTS.CATEGORY_PERFORMANCE);
  },
  getInventoryValuation: async () => {
    return await api.get(API_ENDPOINTS.REPORTS.INVENTORY_VALUATION);
  }
};

export default reportService;

