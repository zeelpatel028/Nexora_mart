import React, { useState, useEffect, useCallback } from 'react';
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
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { reportService } from '../../services';
import {
  DashboardSummary,
  SalesAnalytics,
  CategoryPerformance,
  InventoryValuation,
} from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

type ReportsNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<ReportsNavProp>();
  const { colors, brandColors } = useTheme();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryPerformance['categories']>([]);
  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const [sum, anal, cat, val] = await Promise.all([
        reportService.getDashboardSummary().catch(() => null),
        reportService.getSalesAnalytics(14).catch(() => null),
        reportService.getCategoryPerformance().catch(() => ({ categories: [] })),
        reportService.getInventoryValuation().catch(() => null),
      ]);
      setSummary(sum);
      setAnalytics(anal);
      setCategories(cat?.categories || []);
      setValuation(val);
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Business Intelligence" showBack onBack={() => navigation.goBack()} />
        <Loader message="Computing valuation & performance..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Reports & Analytics"
        subtitle="Business intelligence & margins"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '💎',
          onPress: () => navigation.navigate('InventoryValuation'),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[brandColors.primary]}
          />
        }
      >
        {/* KPI Summary Banner */}
        <Card style={styles.heroCard}>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Total Store Sales</Text>
          <Text style={[styles.heroVal, { color: brandColors.primary }]}>
            {formatCurrency(summary?.total_sales)}
          </Text>
          <View style={styles.heroMetaRow}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Today: {formatCurrency(summary?.today_sales)} • {summary?.total_orders || 0} Orders
            </Text>
            <Badge label="Live Metrics" variant="success" />
          </View>
        </Card>

        {/* Valuation Teaser Card */}
        {valuation && (
          <Card
            style={styles.valTeaser}
            onPress={() => navigation.navigate('InventoryValuation')}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.teaserTitle, { color: colors.textPrimary }]}>
                  Inventory Asset Valuation ➔
                </Text>
                <Text style={[styles.teaserSub, { color: colors.textSecondary }]}>
                  Total Retail Worth: {formatCurrency(valuation.total_retail_value)}
                </Text>
                <Text style={{ color: brandColors.success, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  Potential Margin: {formatCurrency(valuation.potential_margin_value)} ({valuation.margin_percentage?.toFixed(1)}%)
                </Text>
              </View>
              <Text style={{ fontSize: 32 }}>📊</Text>
            </View>
          </Card>
        )}

        {/* Daily Trends (Last 14 Days) */}
        {analytics && analytics.daily_trends && analytics.daily_trends.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Daily Sales Trends</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Recent checkout volume</Text>

            {analytics.daily_trends.slice(-7).map((d, i) => (
              <View key={i} style={[styles.trendRow, { borderBottomColor: colors.borderLight }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trendDate, { color: colors.textPrimary }]}>{d.date}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{d.orders} invoices</Text>
                </View>
                <Text style={[styles.trendAmount, { color: brandColors.primary }]}>
                  {formatCurrency(d.sales)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Category Performance Breakdown */}
        {categories.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Category Sales Volume
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Revenue by merchandise department
            </Text>

            {categories.map((c) => (
              <View key={c.category_id} style={[styles.catRow, { borderBottomColor: colors.borderLight }]}>
                <View style={styles.catIconBox}>
                  <Text style={{ fontSize: 20 }}>{c.icon || '🏬'}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.catName, { color: colors.textPrimary }]}>{c.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {c.items_sold} items sold
                  </Text>
                </View>

                <Text style={[styles.catTotal, { color: colors.textPrimary }]}>
                  {formatCurrency(c.total_sales)}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroVal: {
    fontSize: 30,
    fontWeight: '900',
    marginVertical: 4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  valTeaser: {
    padding: 16,
    marginBottom: 12,
  },
  teaserTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  teaserSub: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 10,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  trendDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catTotal: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ReportsScreen;

