/**
 * Grocery Dashboard Overview, Sales Analytics & Inventory Valuation (/grocery/dashboard/*)
 */
import apiClient from '../../../api/apiClient';
import {
  CategoryPerformance,
  DashboardSummary,
  InventoryValuation,
  SalesAnalytics,
  AnalyticsOverview,
} from '../../../api/types';

export const reportService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<any>('/grocery/dashboard/overview');
    return {
      today_sales: Number(res?.today_sales ?? 0),
      today_orders: Number(res?.today_bills_count ?? 0),
      total_revenue: Number(res?.total_revenue ?? 0),
      total_sales: Number(res?.total_revenue ?? 0),
      total_orders: Number(res?.total_bills_count ?? 0),
      pending_khata_amount: Number(res?.pending_khata_amount ?? 0),
      pending_khata_bills: Number(res?.pending_khata_bills ?? 0),
      low_stock_count: Number(res?.low_stock_count ?? 0),
      expiring_soon_count: Number(res?.expiring_soon_count ?? 0),
      total_expenses: Number(res?.total_expenses ?? 0),
      low_stock_products: res?.low_stock_products || [],
      expiring_batches: res?.expiring_batches || [],
      ...(res || {}),
    } as any;
  },

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await apiClient.get<any>('/grocery/dashboard/overview');
    return res as AnalyticsOverview;
  },

  async getSalesAnalytics(days: number = 14, period: string = 'daily'): Promise<SalesAnalytics> {
    const res = await apiClient.get<any>('/grocery/dashboard/reports/sales', {
      params: { days, period },
    });
    return {
      total_revenue: Number(res?.total_revenue ?? 0),
      total_tax_collected: Number(res?.total_tax_collected ?? 0),
      bills_count: Number(res?.bills_count ?? 0),
      daily_trends: Array.isArray(res?.daily_trends) ? res.daily_trends : [],
      recent_bills: Array.isArray(res?.recent_bills) ? res.recent_bills : [],
    } as any;
  },

  async getCategoryPerformance(): Promise<CategoryPerformance> {
    return { categories: [] } as any;
  },

  async getInventoryValuation(): Promise<InventoryValuation> {
    const res = await apiClient.get<any>('/grocery/dashboard/reports/valuation');
    return {
      total_items: Number(res?.total_items ?? 0),
      total_units: Number(res?.total_units ?? 0),
      total_cost_value: Number(res?.total_cost_value ?? 0),
      total_retail_value: Number(res?.total_retail_value ?? 0),
      potential_margin_value: Number(res?.potential_margin_value ?? 0),
      margin_percentage: Number(res?.margin_percentage ?? 0),
      ...(res || {}),
    } as any;
  },
};

export default reportService;
