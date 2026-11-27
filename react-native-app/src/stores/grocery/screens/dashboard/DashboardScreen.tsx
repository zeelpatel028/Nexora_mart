import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashboardScreenNavigationProp,
  RootStackParamList,
} from '../../../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../../../navigation/context/StoreContext';
import { useScreenSystemBar } from '../../utils/systemBar';
import AppIcon, { IconName } from '../../components/icons/AppIcon';
import SalesBarChart from '../../components/charts/SalesBarChart';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useDashboardData, TimeframeOption } from '../../hooks/useDashboardData';
import DashboardKpiGrid from '../../components/dashboard/DashboardKpiGrid';

const STORE_LABELS: Record<string, string> = {
  grocery: 'Grocery & Kirana',
  clothing: 'Clothing & Apparel',
  medical: 'Pharmacy & Medical',
  mobile_electronics: 'Mobile & Electronics',
  electronics: 'Electronics & Appliances',
  plastic: 'Plastic & Kitchenware',
  handloom: 'Handloom & Textiles',
  furniture: 'Furniture & Timber',
  agro: 'Agro & Fertilizers',
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, store } = useAuth();
  const { storeType } = useStore();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + 6 : 12;

  useScreenSystemBar('white');

  const [showNotifications, setShowNotifications] = useState(false);
  const {
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
  } = useDashboardData();

  const navigateRoot = useCallback(
    <RouteName extends keyof RootStackParamList>(
      screenName: RouteName,
      params?: RootStackParamList[RouteName]
    ) => {
      (navigation as any).navigate(screenName, params);
    },
    [navigation]
  );

  const navigateTab = useCallback(
    (tabName: 'DashboardTab' | 'CustomerTab' | 'PosTab' | 'ProductsTab' | 'MoreTab') => {
      (navigation as any).navigate(tabName);
    },
    [navigation]
  );

  const ownerName = useMemo(() => {
    const first = user?.first_name || (user as any)?.firstName || '';
    const last = user?.surname || '';
    const combined = [first, last].filter(Boolean).join(' ').trim();
    if (combined) return combined;
    if (user?.name?.trim()) return user.name.trim();
    return 'Owner';
  }, [user]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const storeCategoryLabel = STORE_LABELS[storeType] || store?.store_type?.name || 'Retail Store';

  // 4 Primary KPI Cards
  const kpiCards = useMemo(
    () => [
      {
        id: 'today_sales',
        title: "Today's Sales",
        value: formatCurrency(summary?.today_sales ?? 0),
        sub: `${(summary as any)?.today_orders ?? 0} bills today`,
        icon: 'expenses' as IconName,
        accent: '#F57C00',
        tintBg: isDark ? '#3D240E' : '#FFF3E0',
        onPress: () => navigateRoot('SalesList'),
      },
      {
        id: 'total_bills',
        title: 'Total Bills',
        value: `${summary?.total_orders ?? recentSales.length ?? 0}`,
        sub: 'All generated invoices',
        icon: 'billing' as IconName,
        accent: '#8B5CF6',
        tintBg: isDark ? '#2B1F47' : '#F3EEFF',
        onPress: () => navigateRoot('SalesList'),
      },
      {
        id: 'debit_customer_bills',
        title: 'Debit Customer Bills',
        value: `${debitBillsCount}`,
        sub: formatCurrency(debitBalanceTotal) + ' due',
        icon: 'customers' as IconName,
        accent: '#E53935',
        tintBg: isDark ? '#3B191B' : '#FFEBEE',
        onPress: () => navigateRoot('Khata'),
      },
      {
        id: 'super_total_bills',
        title: 'Super Total Bills',
        value: formatCurrency(summary?.total_sales ?? 0),
        sub: 'Grand store billing',
        icon: 'reports' as IconName,
        accent: '#00897B',
        tintBg: isDark ? '#123330' : '#E0F2F1',
        onPress: () => navigateRoot('Reports'),
      },
    ],
    [summary, recentSales.length, debitBillsCount, debitBalanceTotal, isDark, navigateRoot]
  );

  const quickActions = useMemo(
    () => [
      {
        id: 'create_bill',
        label: 'Create Bill',
        icon: 'billing' as IconName,
        color: '#8B5CF6',
        bg: isDark ? '#2B1F47' : '#F3EEFF',
        onPress: () => navigateTab('PosTab'),
      },
      {
        id: 'add_product',
        label: 'Add Product',
        icon: 'products' as IconName,
        color: '#2196F3',
        bg: isDark ? '#172C45' : '#E3F2FD',
        onPress: () => navigateRoot('AddProduct'),
      },
      {
        id: 'add_customer',
        label: 'Add Customer',
        icon: 'customers' as IconName,
        color: '#2EAD64',
        bg: isDark ? '#143624' : '#EAF8F0',
        onPress: () => navigateTab('CustomerTab'),
      },
      {
        id: 'add_supplier',
        label: 'Add Supplier',
        icon: 'suppliers' as IconName,
        color: '#F57C00',
        bg: isDark ? '#3D240E' : '#FFF3E0',
        onPress: () => navigateRoot('SupplierList'),
      },
      {
        id: 'add_expense',
        label: 'Add Expense',
        icon: 'expenses' as IconName,
        color: '#E53935',
        bg: isDark ? '#3B191B' : '#FFEBEE',
        onPress: () => navigateRoot('Finance'),
      },
    ],
    [isDark, navigateRoot, navigateTab]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding,
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={[styles.logoTile, { backgroundColor: isDark ? '#3D240E' : '#FFF3E0' }]}>
            <Image
              source={require('../../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.brandTextWrap}>
            <Text style={[styles.brandName, { color: brandColors.primaryOrange }]}>Tulsi Mart</Text>
            <Text style={[styles.storeSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {store?.name || 'My Store'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: isDark ? colors.surfaceSubtle : '#F4F6FA' }]}
            onPress={toggleTheme}
            activeOpacity={0.75}
            accessibilityLabel="Toggle theme"
          >
            <AppIcon
              name={isDark ? 'sun' : 'moon'}
              size={18}
              color={brandColors.primaryOrange}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: isDark ? colors.surfaceSubtle : '#FFF3E0' }]}
            onPress={() => setShowNotifications(true)}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <AppIcon name="bell" size={18} color={brandColors.primaryOrange} />
            {notifications.length > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: brandColors.error }]}>
                <Text style={styles.badgeDotText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.avatarCircle,
              { backgroundColor: brandColors.primaryOrange },
            ]}
            onPress={() => navigateRoot('AccountDetail')}
            activeOpacity={0.8}
            accessibilityLabel="Store Profile"
          >
            <AppIcon name="user" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[brandColors.primaryOrange]}
            tintColor={brandColors.primaryOrange}
          />
        }
      >
        {/* Welcome Hero Card */}
        <View
          style={[
            styles.welcomeCard,
            {
              backgroundColor: brandColors.primaryOrange,
              shadowColor: brandColors.primaryOrange,
            },
          ]}
        >
          <View style={styles.welcomeMetaRow}>
            <Text style={styles.welcomeDate}>{todayFormatted}</Text>
            <View style={styles.storeCategoryPill}>
              <AppIcon name="store" size={13} color="#FFFFFF" />
              <Text style={styles.storeCategoryText} numberOfLines={1}>
                {storeCategoryLabel}
              </Text>
            </View>
          </View>
          <Text
            style={styles.welcomeGreeting}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            Welcome Back, {ownerName}
          </Text>

          <View style={styles.welcomeBottomBar}>
            <TouchableOpacity
              style={styles.heroCtaBtn}
              onPress={() => navigateTab('PosTab')}
              activeOpacity={0.85}
            >
              <AppIcon name="plus" size={16} color={brandColors.primaryOrange} />
              <Text style={[styles.heroCtaText, { color: brandColors.primaryOrange }]}>
                New Bill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => navigateRoot('Reports')}
              activeOpacity={0.85}
            >
              <AppIcon name="reports" size={15} color="#FFFFFF" />
              <Text style={styles.heroSecondaryText}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Dashboard KPI Cards */}
        <DashboardKpiGrid cards={kpiCards} loading={loading} />

        {/* Quick Actions */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {quickActions.map((qa) => (
              <TouchableOpacity
                key={qa.id}
                onPress={qa.onPress}
                activeOpacity={0.8}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={[styles.qaIconWrap, { backgroundColor: qa.bg }]}>
                  <AppIcon name={qa.icon} size={20} color={qa.color} />
                </View>
                <Text style={[styles.qaLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  {qa.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sales Overview Chart */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Sales Overview</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {timeframe} Revenue: {formatCurrency(totalChartSales)}
              </Text>
            </View>
            {analyticsLoading && (
              <ActivityIndicator size="small" color={brandColors.primaryOrange} />
            )}
          </View>

          <View
            style={[
              styles.timeframeRow,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F4F6FA' },
            ]}
          >
            {(['Day', 'Week', 'Month', 'Year'] as TimeframeOption[]).map((tf) => {
              const active = timeframe === tf;
              return (
                <TouchableOpacity
                  key={tf}
                  onPress={() => handleSelectTimeframe(tf)}
                  style={[
                    styles.tfPill,
                    active && { backgroundColor: brandColors.primaryOrange },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tfText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {chartData.length > 0 ? (
            <SalesBarChart data={chartData} />
          ) : (
            <View style={styles.emptyChartBox}>
              <AppIcon name="reports" size={28} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No sales activity recorded for this period yet.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Bills */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Bills</Text>
            <TouchableOpacity onPress={() => navigateRoot('SalesList')}>
              <Text style={[styles.seeAllLink, { color: brandColors.primaryOrange }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSales.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent bills found. Tap "New Bill" to create one.
            </Text>
          ) : (
            recentSales.slice(0, 5).map((sale, idx) => {
              const isPaid = String(sale.payment_status || '').toUpperCase() === 'PAID';
              return (
                <TouchableOpacity
                  key={sale.id}
                  onPress={() => navigateRoot('SaleDetail', { saleId: sale.id })}
                  activeOpacity={0.75}
                  style={[
                    styles.listRow,
                    idx < Math.min(recentSales.length, 5) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.rowIcon,
                      { backgroundColor: isDark ? '#2B1F47' : '#F3EEFF' },
                    ]}
                  >
                    <AppIcon name="billing" size={17} color="#8B5CF6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {sale.customer_name || 'Walk-in Customer'}
                    </Text>
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      #{sale.invoice_number || sale.id} • {formatDate(sale.sale_date || sale.created_at)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: colors.textPrimary }]}>
                      {formatCurrency(sale.total_amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isPaid
                            ? brandColors.successLight
                            : brandColors.warningLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isPaid ? brandColors.success : brandColors.darkOrange },
                        ]}
                      >
                        {sale.payment_status || 'PAID'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Top Selling Products */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Top Selling Products
            </Text>
            <TouchableOpacity onPress={() => navigateTab('ProductsTab')}>
              <Text style={[styles.seeAllLink, { color: brandColors.primaryOrange }]}>Catalog</Text>
            </TouchableOpacity>
          </View>

          {topProducts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Top products will appear here once billing begins.
            </Text>
          ) : (
            topProducts.map((tp, idx) => (
              <View
                key={`${tp.id}-${idx}`}
                style={[
                  styles.listRow,
                  idx < topProducts.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: isDark ? '#172C45' : '#E3F2FD' },
                  ]}
                >
                  <Text style={styles.rankText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {tp.name}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                    Volume / Units: {tp.qty}
                  </Text>
                </View>
                <Text style={[styles.rowAmount, { color: '#2196F3' }]}>
                  {formatCurrency(tp.revenue)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Low Stock Products */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon name="alert" size={18} color={brandColors.warning} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Low Stock Products
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigateTab('ProductsTab')}>
              <Text style={[styles.seeAllLink, { color: brandColors.primaryOrange }]}>Restock</Text>
            </TouchableOpacity>
          </View>

          {lowStockProducts.length === 0 ? (
            <View style={styles.healthyRow}>
              <AppIcon name="check" size={16} color={brandColors.success} />
              <Text style={[styles.emptyText, { color: brandColors.success, marginTop: 0 }]}>
                All active products have healthy stock levels.
              </Text>
            </View>
          ) : (
            lowStockProducts.map((item, idx) => {
              const cur = Number(item.inventory_record?.current_stock ?? item.current_stock ?? 0);
              const isOut = cur <= 0;
              return (
                <TouchableOpacity
                  key={String(item.id)}
                  activeOpacity={0.75}
                  onPress={() => navigateRoot('ProductDetail', { productId: item.id })}
                  style={[
                    styles.listRow,
                    idx < lowStockProducts.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.rowIcon,
                      {
                        backgroundColor: isOut
                          ? brandColors.errorLight
                          : brandColors.warningLight,
                      },
                    ]}
                  >
                    <AppIcon
                      name="products"
                      size={17}
                      color={isOut ? brandColors.error : brandColors.warning}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.product_name || item.name}
                    </Text>
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                      Price: {formatCurrency(item.selling_price || 0)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.stockPill,
                      {
                        backgroundColor: isOut
                          ? brandColors.errorLight
                          : brandColors.warningLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockPillText,
                        { color: isOut ? brandColors.error : brandColors.darkOrange },
                      ]}
                    >
                      {isOut ? 'Out of Stock' : `${cur} left`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppIcon name="bell" size={20} color={brandColors.primaryOrange} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Store Alerts & Activity
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={[styles.closeCircle, { backgroundColor: colors.surfaceSubtle }]}
              >
                <AppIcon name="close" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary, paddingVertical: 20 }]}>
                No new notifications right now.
              </Text>
            ) : (
              notifications.map((n) => (
                <View
                  key={n.id}
                  style={[
                    styles.notifRow,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#F8F9FC',
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <AppIcon
                    name={n.type === 'warning' ? 'alert' : 'check'}
                    size={18}
                    color={
                      n.type === 'warning' ? brandColors.warning : brandColors.success
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{n.title}</Text>
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{n.message}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logoTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: 28, height: 28 },
  brandTextWrap: { flex: 1 },
  brandName: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  storeSub: { fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeDotText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 28 },
  welcomeCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  welcomeDate: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', flex: 1 },
  welcomeGreeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.3,
  },
  storeCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: 145,
  },
  storeCategoryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  welcomeBottomBar: { flexDirection: 'row', gap: 10, marginTop: 16 },
  heroCtaBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroCtaText: { fontSize: 13.5, fontWeight: '800' },
  heroSecondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroSecondaryText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700' },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: { fontSize: 12, fontWeight: '600' },
  kpiValue: { fontSize: 19, fontWeight: '900', marginTop: 2, letterSpacing: -0.3 },
  kpiSub: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  sectionBlock: { marginBottom: 14 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  quickActionsScroll: { gap: 10, paddingRight: 8 },
  quickActionCard: {
    width: 96,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  qaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaLabel: { fontSize: 11.5, fontWeight: '700', textAlign: 'center' },
  cardSection: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15.5, fontWeight: '800' },
  cardSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  seeAllLink: { fontSize: 13, fontWeight: '700' },
  timeframeRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tfPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
  },
  tfText: { fontSize: 12, fontWeight: '700' },
  emptyChartBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: '#2196F3', fontSize: 14, fontWeight: '900' },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowAmount: { fontSize: 14.5, fontWeight: '800' },
  statusBadge: {
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockPillText: { fontSize: 11.5, fontWeight: '800' },
  healthyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { borderRadius: 20, padding: 18, maxHeight: '75%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
});

export default DashboardScreen;
