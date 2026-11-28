import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { reportService, salesService } from '../../services';
import {
  DashboardSummary,
  SalesAnalytics,
  CategoryPerformance,
  InventoryValuation,
  Sale,
} from '../../../../api/types';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import Loader from '../../components/common/Loader';
import AppIcon from '../../components/icons/AppIcon';
import SalesBarChart, { ChartDataPoint } from '../../components/charts/SalesBarChart';
import { formatCurrency } from '../../utils/formatters';

type ReportsNavProp = NativeStackNavigationProp<RootStackParamList>;
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const PERIODS: { key: ReportPeriod; label: string; days: number }[] = [
  { key: 'daily', label: 'Daily', days: 1 },
  { key: 'weekly', label: 'Weekly', days: 7 },
  { key: 'monthly', label: 'Monthly', days: 30 },
  { key: 'yearly', label: 'Yearly', days: 365 },
];

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<ReportsNavProp>();
  const { colors, brandColors, isDark } = useTheme();

  const [period, setPeriod] = useState<ReportPeriod>('weekly');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryPerformance['categories']>([]);
  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const selectedDays = PERIODS.find((p) => p.key === period)?.days || 7;

  const getStartDateYMD = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - Math.max(0, days - 1));
    return d.toISOString().split('T')[0];
  };

  const loadReports = useCallback(async () => {
    try {
      const startDate = getStartDateYMD(selectedDays);
      const endDate = new Date().toISOString().split('T')[0];

      const [sum, anal, cat, val, sales] = await Promise.all([
        reportService.getDashboardSummary().catch(() => null),
        reportService.getSalesAnalytics(selectedDays).catch(() => null),
        reportService.getCategoryPerformance().catch(() => ({ categories: [] })),
        reportService.getInventoryValuation().catch(() => null),
        salesService.getSales({ startDate, endDate, limit: 150 }).catch(() => []),
      ]);
      setSummary(sum);
      setAnalytics(anal);
      setCategories(cat?.categories || []);
      setValuation(val);
      setSalesList(Array.isArray(sales) ? sales : []);
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDays]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    const trends = analytics?.daily_trends || [];
    if (trends.length === 0) return [];
    const slice = trends.slice(-7);
    const maxVal = Math.max(...slice.map((t) => Number(t.sales || 0)));
    return slice.map((d) => ({
      label: d.date.length >= 10 ? d.date.slice(5) : d.date,
      value: Number(d.sales || 0),
      highlight: Number(d.sales || 0) > 0 && Number(d.sales || 0) === maxVal,
    }));
  }, [analytics]);

  const { periodRevenue, periodBills, paymentBreakdown } = useMemo(() => {
    const trends = analytics?.daily_trends || [];
    const trendRev = trends.reduce((s, d) => s + Number(d.sales || 0), 0);
    const trendBills = trends.reduce((s, d) => s + Number(d.orders || 0), 0);

    const salesRev = salesList.reduce((s, x) => s + Number(x.total_amount || 0), 0);
    const rev = trendRev > 0 ? trendRev : period === 'daily' ? Number(summary?.today_sales || salesRev) : salesRev;
    const bills = trendBills > 0 ? trendBills : salesList.length || Number(summary?.total_orders || 0);

    const methodMap = new Map<string, { count: number; amount: number }>();
    salesList.forEach((s) => {
      const m = String(s.payment_method || 'CASH').toUpperCase();
      const prev = methodMap.get(m) || { count: 0, amount: 0 };
      prev.count += 1;
      prev.amount += Number(s.total_amount || 0);
      methodMap.set(m, prev);
    });

    return {
      periodRevenue: rev,
      periodBills: bills,
      paymentBreakdown: Array.from(methodMap.entries()).map(([method, info]) => ({
        method,
        ...info,
      })),
    };
  }, [analytics, salesList, period, summary]);

  const avgBill = periodBills > 0 ? periodRevenue / periodBills : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Sales Reports"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('InventoryValuation')}
            style={[
              styles.valBadgeBtn,
              { backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange },
            ]}
          >
            <AppIcon name="pie" size={16} color={brandColors.primaryOrange} />
            <Text
              style={[
                styles.valBadgeText,
                { color: isDark ? colors.badgeOrangeText : brandColors.primaryOrange },
              ]}
            >
              Valuation
            </Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <Loader message="Preparing sales analytics..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primaryOrange]}
            />
          }
        >
          {/* Period Filter Bar */}
          <View
            style={[
              styles.periodBar,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
            ]}
          >
            {PERIODS.map((p) => {
              const active = period === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={[
                    styles.periodPill,
                    active && { backgroundColor: brandColors.primaryOrange },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Revenue & Bills KPI Banner */}
          <View style={styles.kpiRow}>
            <AppCard style={[styles.kpiHalf, { borderColor: brandColors.primaryOrange + '35' }]}>
              <View style={[styles.kpiIcon, { backgroundColor: isDark ? '#3D240E' : '#FFF3E0' }]}>
                <AppIcon name="reports" size={18} color="#00897B" />
              </View>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
              <Text style={[styles.kpiValue, { color: brandColors.primaryOrange }]}>
                {formatCurrency(periodRevenue)}
              </Text>
              <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                Avg bill: {formatCurrency(avgBill)}
              </Text>
            </AppCard>

            <AppCard style={styles.kpiHalf}>
              <View style={[styles.kpiIcon, { backgroundColor: isDark ? '#2B1F47' : '#F3EEFF' }]}>
                <AppIcon name="billing" size={18} color="#8B5CF6" />
              </View>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Bills</Text>
              <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{periodBills}</Text>
              <Text style={[styles.kpiSub, { color: '#2EAD64' }]}>
                Store total: {formatCurrency(summary?.total_sales || 0)}
              </Text>
            </AppCard>
          </View>

          {/* Sales Trend Chart */}
          <AppCard>
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sales Chart</Text>
              <AppIcon name="trending" size={18} color={brandColors.primaryOrange} />
            </View>
            {chartData.length > 0 ? (
              <SalesBarChart data={chartData} barColor={brandColors.primaryOrange} />
            ) : (
              <Text style={[styles.emptyNote, { color: colors.textSecondary }]}>
                No chart points recorded for the selected date range.
              </Text>
            )}
          </AppCard>

          {/* Payment Method Summary */}
          <AppCard>
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Payment Method Summary
              </Text>
              <AppIcon name="wallet" size={18} color="#2EAD64" />
            </View>
            {paymentBreakdown.length === 0 ? (
              <Text style={[styles.emptyNote, { color: colors.textSecondary }]}>
                No payment method transactions in this timeframe.
              </Text>
            ) : (
              paymentBreakdown.map((pm, idx) => {
                const pct = periodRevenue > 0 ? Math.round((pm.amount / periodRevenue) * 100) : 0;
                return (
                  <View
                    key={pm.method}
                    style={[
                      styles.pmRow,
                      idx < paymentBreakdown.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pmTitle, { color: colors.textPrimary }]}>{pm.method}</Text>
                      <Text style={[styles.pmSub, { color: colors.textSecondary }]}>
                        {pm.count} bill(s) • {pct}% share
                      </Text>
                    </View>
                    <Text style={[styles.pmAmount, { color: '#00897B' }]}>
                      {formatCurrency(pm.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </AppCard>

          {/* Valuation Teaser */}
          {valuation && (
            <AppCard onPress={() => navigation.navigate('InventoryValuation')}>
              <View style={styles.valRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Inventory Valuation
                  </Text>
                  <Text style={[styles.pmSub, { color: colors.textSecondary }]}>
                    Retail Worth: {formatCurrency(valuation.total_retail_value)}
                  </Text>
                  <Text style={{ color: '#2EAD64', fontSize: 12.5, fontWeight: '700', marginTop: 3 }}>
                    Estimated Margin: {formatCurrency(valuation.potential_margin_value)} (
                    {valuation.margin_percentage?.toFixed(1)}%)
                  </Text>
                </View>
                <AppIcon name="right" size={18} color={brandColors.primaryOrange} />
              </View>
            </AppCard>
          )}

          {/* Category Performance */}
          {categories.length > 0 && (
            <AppCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 10 }]}>
                Category Revenue Breakdown
              </Text>
              {categories.map((c, idx) => (
                <View
                  key={c.category_id}
                  style={[
                    styles.pmRow,
                    idx < categories.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pmTitle, { color: colors.textPrimary }]}>{c.name}</Text>
                    <Text style={[styles.pmSub, { color: colors.textSecondary }]}>
                      {c.items_sold} units sold
                    </Text>
                  </View>
                  <Text style={[styles.pmAmount, { color: brandColors.primaryOrange }]}>
                    {formatCurrency(c.total_sales)}
                  </Text>
                </View>
              ))}
            </AppCard>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 36 },
  valBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  valBadgeText: { fontSize: 12, fontWeight: '800' },
  periodBar: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodText: { fontSize: 12.5, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  kpiHalf: { flex: 1, padding: 14 },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: { fontSize: 12, fontWeight: '600' },
  kpiValue: { fontSize: 19, fontWeight: '900', marginTop: 2 },
  kpiSub: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15.5, fontWeight: '800' },
  emptyNote: { fontSize: 13, textAlign: 'center', paddingVertical: 14 },
  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  pmTitle: { fontSize: 14, fontWeight: '700' },
  pmSub: { fontSize: 12, marginTop: 2 },
  pmAmount: { fontSize: 15, fontWeight: '800' },
  valRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

export default ReportsScreen;
