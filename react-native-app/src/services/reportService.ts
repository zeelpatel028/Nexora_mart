/**
 * Business Intelligence, Profitability & Valuation Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import {
  CategoryPerformance,
  DashboardSummary,
  InventoryValuation,
  SalesAnalytics,
  AnalyticsOverview,
} from '../models/types';

export const reportService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(Endpoints.REPORTS.DASHBOARD_SUMMARY);
  },

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return apiClient.get<AnalyticsOverview>(Endpoints.REPORTS.ANALYTICS_OVERVIEW);
  },

  async getSalesAnalytics(days: number = 14): Promise<SalesAnalytics> {
    return apiClient.get<SalesAnalytics>(Endpoints.REPORTS.SALES_ANALYTICS, {
      params: { days },
    });
  },

  async getCategoryPerformance(): Promise<CategoryPerformance> {
    return apiClient.get<CategoryPerformance>(Endpoints.REPORTS.CATEGORY_PERFORMANCE);
  },

  async getInventoryValuation(): Promise<InventoryValuation> {
    return apiClient.get<InventoryValuation>(Endpoints.REPORTS.INVENTORY_VALUATION);
  },
};

export default reportService;

