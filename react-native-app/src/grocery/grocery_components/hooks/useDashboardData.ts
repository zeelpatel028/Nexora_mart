import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from './useFocusEffect';
import reportService from '../services/reportService';
import salesService from '../services/salesService';
import partnerService from '../services/partnerService';
import productService from '../services/productService';
import { DashboardSummary, SalesAnalytics, Sale, Product } from '../../../api/types';
import { ChartDataPoint } from '../components/charts/SalesBarChart';
import { formatCurrency } from '../utils/formatters';

export type TimeframeOption = 'Day' | 'Week' | 'Month' | 'Year';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
}

const getTimeframeDays = (tf: TimeframeOption): number => {
  switch (tf) {
    case 'Day':
      return 1;
    case 'Week':
      return 7;
    case 'Month':
      return 30;
    case 'Year':
      return 365;
    default:
      return 7;
  }
};

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<
    { id: string; name: string; qty: number; revenue: number }[]
  >([]);
  const [debitBillsCount, setDebitBillsCount] = useState<number>(0);
  const [debitBalanceTotal, setDebitBalanceTotal] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('Week');

  const loadDashboardData = useCallback(async () => {
    try {
      const days = getTimeframeDays(timeframe);
      const [sumRes, analyticsRes, salesRes, debitsRes, productsRes] = await Promise.all([
        reportService.getDashboardSummary().catch(() => null),
        reportService.getSalesAnalytics(days).catch(() => null),
        salesService.getSales({ limit: 15 }).catch(() => []),
        partnerService.getDebitCustomers().catch(() => []),
        productService.getProducts({ isActive: true, limit: 100 }).catch(() => []),
      ]);

      if (sumRes) setSummary(sumRes);
      if (analyticsRes) setSalesAnalytics(analyticsRes);

      const safeSales = Array.isArray(salesRes) ? salesRes : [];
      setRecentSales(safeSales);

      const safeDebits = Array.isArray(debitsRes) ? debitsRes : [];
      setDebitBillsCount(safeDebits.length);
      const totalDue = safeDebits.reduce(
        (acc: number, d: any) =>
          acc + Number(d.balance ?? d.pending_amount ?? d.total_due ?? 0),
        0
      );
      setDebitBalanceTotal(totalDue);

      const safeProducts = Array.isArray(productsRes) ? productsRes : [];
      const lowList = safeProducts.filter((p) => {
        const cur = Number(p.inventory_record?.current_stock ?? p.current_stock ?? 0);
        const min = Number(p.inventory_record?.minimum_stock ?? p.min_stock_level ?? 5);
        return cur <= min;
      });
      setLowStockProducts(lowList.slice(0, 5));

      const apiTop = (sumRes as any)?.top_products;
      if (Array.isArray(apiTop) && apiTop.length > 0) {
        setTopProducts(
          apiTop.slice(0, 5).map((tp: any, idx: number) => ({
            id: String(tp.id ?? tp.product_id ?? idx),
            name: tp.name || tp.product_name || 'Item',
            qty: Number(tp.qty_sold ?? tp.quantity ?? 0),
            revenue: Number(tp.revenue ?? tp.total_sales ?? 0),
          }))
        );
      } else {
        const map = new Map<string, { id: string; name: string; qty: number; revenue: number }>();
        safeSales.forEach((sale) => {
          (sale.items || []).forEach((it) => {
            const key = String(it.product_id || it.product_name || 'item');
            const prev = map.get(key) || {
              id: key,
              name: it.product_name || `Product #${key}`,
              qty: 0,
              revenue: 0,
            };
            prev.qty += Number(it.quantity || 1);
            prev.revenue += Number(
              it.total_amount ?? Number(it.unit_price || 0) * Number(it.quantity || 1)
            );
            map.set(key, prev);
          });
        });
        const sortedTop = Array.from(map.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4);
        if (sortedTop.length > 0) {
          setTopProducts(sortedTop);
        } else {
          setTopProducts(
            safeProducts.slice(0, 4).map((p) => ({
              id: String(p.id),
              name: p.product_name || p.name,
              qty: Number(p.inventory_record?.current_stock ?? p.current_stock ?? 0),
              revenue: Number(p.selling_price ?? 0),
            }))
          );
        }
      }

      const notifs: NotificationItem[] = [];
      if (lowList.length > 0) {
        notifs.push({
          id: 'low-stock',
          title: 'Low Stock Warning',
          message: `${lowList.length} product(s) are at or below minimum stock threshold.`,
          type: 'warning',
        });
      }
      if (safeDebits.length > 0) {
        notifs.push({
          id: 'khata-alert',
          title: 'Pending Khata Collection',
          message: `${safeDebits.length} debit customer(s) owe ${formatCurrency(totalDue)}.`,
          type: 'warning',
        });
      }
      if (safeSales.length > 0) {
        notifs.push({
          id: 'sale-recent',
          title: 'Latest Invoice Generated',
          message: `Bill #${safeSales[0].invoice_number || safeSales[0].id} completed for ${formatCurrency(safeSales[0].total_amount)}.`,
          type: 'success',
        });
      }
      setNotifications(notifs);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
  }, [loadDashboardData]);

  const handleSelectTimeframe = useCallback(
    async (selected: TimeframeOption) => {
      if (selected === timeframe) return;
      setTimeframe(selected);
      setAnalyticsLoading(true);
      try {
        const res = await reportService.getSalesAnalytics(getTimeframeDays(selected));
        if (res) setSalesAnalytics(res);
      } catch (err) {
        console.warn('Failed to switch analytics timeframe:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [timeframe]
  );

  const chartData: ChartDataPoint[] = useMemo(() => {
    const trends = salesAnalytics?.daily_trends || (salesAnalytics as any)?.items || [];
    if (!Array.isArray(trends) || trends.length === 0) return [];
    const sliced = trends.slice(-7);
    const maxVal = Math.max(...sliced.map((t: any) => Number(t.sales || 0)));
    return sliced.map((item: any) => {
      const labelRaw = String(item.date || '');
      const val = Number(item.sales || 0);
      return {
        label: labelRaw.length >= 10 ? labelRaw.slice(5) : labelRaw,
        value: val,
        highlight: val > 0 && val === maxVal,
      };
    });
  }, [salesAnalytics]);

  const totalChartSales = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData]
  );

  return {
    summary,
    recentSales,
    lowStockProducts,
    topProducts,
    debitBillsCount,
    debitBalanceTotal,
    notifications,
    loading,
    refreshing,
    analyticsLoading,
    timeframe,
    chartData,
    totalChartSales,
    onRefresh,
    handleSelectTimeframe,
  };
}
