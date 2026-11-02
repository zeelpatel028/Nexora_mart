import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { storeService, reportService } from '../../services';
import { Store, DashboardSummary } from '../../models/types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';

type DashNavProp = NativeStackNavigationProp<RootStackParamList>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashNavProp>();
  const { user } = useAuth();
  const { colors, brandColors, isDark } = useTheme();

  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const merchantName =
    user?.first_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Merchant');

  const loadData = useCallback(async () => {
    try {
      const [sData, sumData] = await Promise.all([
        storeService.getMyStore().catch(() => null),
        reportService.getDashboardSummary().catch(() => null),
      ]);
      if (sData) setStore(sData);
      if (sumData) setSummary(sumData);
    } catch (err) {
      console.warn('Dashboard load failed:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const storeCategoryName =
    store?.category?.name || summary?.category_name || user?.store_type || user?.storeType || 'Retail Store';
  const storeCategoryIcon = store?.category?.icon || '🏬';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Top Merchant Brand Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.storeInfo}>
          <Text style={[styles.storeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {store?.name || `${merchantName}'s Store`}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CategoryManager')}
            style={styles.categoryBadge}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13 }}>{storeCategoryIcon}</Text>
            <Text style={[styles.categoryBadgeText, { color: brandColors.primary }]}>
              {storeCategoryName} ⚙
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.posButton, { backgroundColor: brandColors.primary }]}
          onPress={() => navigation.navigate('PosBilling')}
          activeOpacity={0.8}
        >
          <Text style={styles.posButtonText}>⚡ POS</Text>
        </TouchableOpacity>
      </View>

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
        {/* Welcome Greeting */}
        <View style={styles.greetingBox}>
          <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
            Welcome back, {merchantName}! 👋
          </Text>
          <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
            Here is your live store performance & retail inventory overview.
          </Text>
        </View>

        {/* Live KPI Metric Cards */}
        <View style={styles.kpiGrid}>
          {/* Total Revenue */}
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
              <Text style={styles.kpiIcon}>💰</Text>
            </View>
            <Text style={[styles.kpiValue, { color: brandColors.primary }]}>
              {formatCurrency(summary?.total_sales)}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
              Today: {formatCurrency(summary?.today_sales)}
            </Text>
          </Card>

          {/* Total Orders */}
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Sales Orders</Text>
              <Text style={styles.kpiIcon}>🧾</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
              {summary?.total_orders ?? 0}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Customer invoices</Text>
          </Card>

          {/* Active Products */}
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Active Catalog</Text>
              <Text style={styles.kpiIcon}>📦</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
              {summary?.active_products ?? 0}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
              In {storeCategoryName}
            </Text>
          </Card>

          {/* Low Stock Items */}
          <Card
            style={styles.kpiCard}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Low Stock Items</Text>
              <Text style={styles.kpiIcon}>⚠️</Text>
            </View>
            <Text
              style={[
                styles.kpiValue,
                {
                  color: (summary?.low_stock_count ?? 0) > 0 ? brandColors.error : brandColors.success,
                },
              ]}
            >
              {summary?.low_stock_count ?? 0}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
              {(summary?.low_stock_count ?? 0) > 0 ? 'Requires reorder ➔' : 'Healthy inventory'}
            </Text>
          </Card>
        </View>

        {/* Quick Action Operations */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Operations
          </Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('PosBilling')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: brandColors.primaryLight }]}>
              <Text style={styles.actionIcon}>💳</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>POS Checkout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AddProduct', {})}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: brandColors.secondaryLight + '40' }]}>
              <Text style={styles.actionIcon}>➕</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('StockInward', {})}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: brandColors.successLight }]}>
              <Text style={styles.actionIcon}>📥</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Receive Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('CategoryManager')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Text style={styles.actionIcon}>🏬</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('CustomerList')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: brandColors.infoLight }]}>
              <Text style={styles.actionIcon}>👥</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('PurchaseList')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.actionIcon}>🚚</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Reports')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.actionIcon}>📈</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Finance')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.actionIcon}>💸</Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Expenses</Text>
          </TouchableOpacity>
        </View>

        {/* Store Health & Shared DB Notice */}
        <Card style={styles.syncCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔄</Text>
            <Text style={[styles.syncTitle, { color: colors.textPrimary }]}>
              Unified Storefront Sync
            </Text>
            <Badge label="Online" variant="success" style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={[styles.syncDesc, { color: colors.textSecondary }]}>
            All inventory, sales, and products are synchronized in real-time with your Nexora Mart web portal via shared SQLite / PostgreSQL.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  posButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  posButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  greetingBox: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  kpiCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    padding: 14,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiIcon: {
    fontSize: 16,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  actionTile: {
    width: '23%',
    marginHorizontal: '1%',
    marginBottom: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  syncCard: {
    marginTop: 8,
    padding: 16,
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  syncDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});

export default DashboardScreen;

