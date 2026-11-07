import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { storeService, reportService } from '../../services';
import { Store, DashboardSummary, AnalyticsOverview } from '../../models/types';
import {
  ShoppingCartIcon,
  BellIcon,
  IndianRupeeIcon,
  ShoppingBagIcon,
  PackageIcon,
  UsersIcon,
  UserRoundIcon,
  BoxesIcon,
  TruckIcon,
  ChartColumnIcon,
  SettingsIcon,
  LogOutIcon,
  RefreshIcon,
  UserIcon,
} from '../../components/branding/Icons';

type DashNavProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { colors, brandColors } = useTheme();

  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('This Week');
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: string; sales: number; orders: number } | null>(null);

  const merchantName =
    user?.first_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Owner');

  const loadData = useCallback(async () => {
    try {
      const [sData, sumData, anData] = await Promise.all([
        storeService.getMyStore().catch(() => null),
        reportService.getDashboardSummary().catch(() => null),
        reportService.getAnalyticsOverview().catch(() => null),
      ]);
      if (sData) setStore(sData);
      if (sumData) setSummary(sumData);
      if (anData) setAnalytics(anData);
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

  // KPI data with authentic fallbacks from provided design
  const stats = analytics?.stats || [
    {
      id: 'sales',
      title: "Today's Sales",
      value: summary?.today_sales ? `₹ ${summary.today_sales.toLocaleString()}` : '₹ 45,850',
      trend: '↑ +12.5%',
      is_positive: true,
      color_scheme: 'orange' as const,
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: summary?.total_orders ? `${summary.total_orders}` : '248',
      trend: '↑ +8.2%',
      is_positive: true,
      color_scheme: 'red' as const,
    },
    {
      id: 'products',
      title: 'Total Products',
      value: summary?.active_products ? `${summary.active_products}` : '1,250',
      subtitle: 'Active stock',
      color_scheme: 'blue' as const,
    },
    {
      id: 'employees',
      title: 'Employees',
      value: '12',
      subtitle: 'Active staff',
      color_scheme: 'green' as const,
    },
  ];

  const salesData = analytics?.sales_overview || [
    { day: 'Mon', sales: 18500, orders: 85 },
    { day: 'Tue', sales: 22400, orders: 110 },
    { day: 'Wed', sales: 19800, orders: 78 },
    { day: 'Thu', sales: 27900, orders: 135 },
    { day: 'Fri', sales: 34100, orders: 162 },
    { day: 'Sat', sales: 38900, orders: 178 },
    { day: 'Sun', sales: 36200, orders: 164 },
  ];

  const recentActivities = analytics?.recent_activities || [
    {
      id: 'act-1',
      title: 'New sale completed',
      description: 'Order #1025 • ₹ 850',
      timestamp: '5 minutes ago',
      icon: 'cart',
    },
    {
      id: 'act-2',
      title: 'Product added',
      description: 'Rice 1kg added to inventory',
      timestamp: '20 minutes ago',
      icon: 'box',
    },
    {
      id: 'act-3',
      title: 'Employee login',
      description: 'Rahul logged in',
      timestamp: '30 minutes ago',
      icon: 'user',
    },
    {
      id: 'act-4',
      title: 'Stock updated',
      description: 'Wheat Flour stock updated (50 units)',
      timestamp: '1 hour ago',
      icon: 'refresh',
    },
  ];

  const lowStockProducts = analytics?.low_stock_products || [
    { id: 1, name: 'Rice (5kg)', stock: '8 units', status: 'Low Stock', status_color: 'danger' as const },
    { id: 2, name: 'Cooking Oil (1L)', stock: '12 units', status: 'Low Stock', status_color: 'danger' as const },
    { id: 3, name: 'Sugar (1kg)', stock: '15 units', status: 'Running Low', status_color: 'warning' as const },
    { id: 4, name: 'Toor Dal (1kg)', stock: '20 units', status: 'Running Low', status_color: 'warning' as const },
    { id: 5, name: 'Tea (250g)', stock: '28 units', status: 'Running Low', status_color: 'warning' as const },
  ];

  const maxSales = 40000;
  const maxOrders = 200;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6A1A" />

      {/* 1. TOP ORANGE HEADER */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.topHeader}>
          {/* Left: Hamburger menu */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setMenuModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.hamburger}>
              <View style={styles.hamLine} />
              <View style={styles.hamLine} />
              <View style={styles.hamLine} />
            </View>
          </TouchableOpacity>

          {/* Center/Left: Brand Logo */}
          <View style={styles.brandTitleContainer}>
            <View style={styles.cartIconBadge}>
              <ShoppingCartIcon size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.headerBrandTitle}>NEXORA MART</Text>
          </View>

          {/* Right: Notifications & Profile */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setNotificationsVisible(true)}
              activeOpacity={0.7}
            >
              <BellIcon size={20} color="#FFFFFF" />
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileAvatarPill}
              onPress={() => setMenuModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarLetter}>
                  {merchantName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* 2. SCROLLABLE SCREEN CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6A1A']}
            tintColor="#FF6A1A"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good Morning, {merchantName}!</Text>
          <View style={styles.greetingMetaRow}>
            <Text style={styles.greetingSubtitle}>
              Here's your store overview for today.
            </Text>
            <Text style={styles.greetingDate}>
              {analytics?.date_display || 'Tue, 3 Nov 2026'}
            </Text>
          </View>
        </View>

        {/* 3. 2x2 GRID OF STAT KPI CARDS */}
        <View style={styles.kpiGrid}>
          {/* Card 1: Today's Sales */}
          <View style={[styles.kpiCard, styles.kpiBorderOrange]}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: '#FF6A1A' }]}>
                <IndianRupeeIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.miniBars}>
                <View style={[styles.miniBar, { height: 6, backgroundColor: '#FED7AA' }]} />
                <View style={[styles.miniBar, { height: 10, backgroundColor: '#FED7AA' }]} />
                <View style={[styles.miniBar, { height: 15, backgroundColor: '#FFA266' }]} />
                <View style={[styles.miniBar, { height: 20, backgroundColor: '#FF6A1A' }]} />
              </View>
            </View>
            <Text style={styles.kpiLabel}>{stats[0]?.title || "Today's Sales"}</Text>
            <Text style={styles.kpiValue}>{stats[0]?.value || '₹ 45,850'}</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>{stats[0]?.trend || '↑ +12.5%'}</Text>
            </View>
          </View>

          {/* Card 2: Total Orders */}
          <View style={[styles.kpiCard, styles.kpiBorderRed]}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: '#EF4444' }]}>
                <ShoppingBagIcon size={18} color="#FFFFFF" />
              </View>
              <View style={styles.miniBars}>
                <View style={[styles.miniBar, { height: 6, backgroundColor: '#FECACA' }]} />
                <View style={[styles.miniBar, { height: 10, backgroundColor: '#FECACA' }]} />
                <View style={[styles.miniBar, { height: 15, backgroundColor: '#FCA5A5' }]} />
                <View style={[styles.miniBar, { height: 20, backgroundColor: '#EF4444' }]} />
              </View>
            </View>
            <Text style={styles.kpiLabel}>{stats[1]?.title || 'Total Orders'}</Text>
            <Text style={styles.kpiValue}>{stats[1]?.value || '248'}</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>{stats[1]?.trend || '↑ +8.2%'}</Text>
            </View>
          </View>

          {/* Card 3: Total Products */}
          <View style={[styles.kpiCard, styles.kpiBorderBlue]}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' }]}>
                <PackageIcon size={18} color="#FFFFFF" />
              </View>
              <View style={styles.miniBars}>
                <View style={[styles.miniBar, { height: 6, backgroundColor: '#BFDBFE' }]} />
                <View style={[styles.miniBar, { height: 10, backgroundColor: '#BFDBFE' }]} />
                <View style={[styles.miniBar, { height: 15, backgroundColor: '#93C5FD' }]} />
                <View style={[styles.miniBar, { height: 20, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
            <Text style={styles.kpiLabel}>{stats[2]?.title || 'Total Products'}</Text>
            <Text style={styles.kpiValue}>{stats[2]?.value || '1,250'}</Text>
            <Text style={styles.kpiSub}>{stats[2]?.subtitle || 'Active stock'}</Text>
          </View>

          {/* Card 4: Employees */}
          <View style={[styles.kpiCard, styles.kpiBorderGreen]}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: '#10B981' }]}>
                <UsersIcon size={18} color="#FFFFFF" />
              </View>
              <View style={styles.miniBars}>
                <View style={[styles.miniBar, { height: 6, backgroundColor: '#BBF7D0' }]} />
                <View style={[styles.miniBar, { height: 10, backgroundColor: '#BBF7D0' }]} />
                <View style={[styles.miniBar, { height: 15, backgroundColor: '#86EFAC' }]} />
                <View style={[styles.miniBar, { height: 20, backgroundColor: '#10B981' }]} />
              </View>
            </View>
            <Text style={styles.kpiLabel}>{stats[3]?.title || 'Employees'}</Text>
            <Text style={styles.kpiValue}>{stats[3]?.value || '12'}</Text>
            <Text style={styles.kpiSub}>{stats[3]?.subtitle || 'Active staff'}</Text>
          </View>
        </View>

        {/* 4. SALES OVERVIEW COMBO CHART */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales Overview</Text>
            <TouchableOpacity
              style={styles.timeframeBadge}
              onPress={() => setTimeframe(timeframe === 'This Week' ? 'This Month' : 'This Week')}
            >
              <Text style={styles.timeframeText}>{timeframe} ⌄</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Tooltip if day tapped */}
          {selectedDayInfo && (
            <View style={styles.chartTooltipBanner}>
              <Text style={styles.chartTooltipText}>
                {selectedDayInfo.day}: ₹{selectedDayInfo.sales.toLocaleString()} Sales • {selectedDayInfo.orders} Orders
              </Text>
            </View>
          )}

          {/* Native Responsive Combo Chart */}
          <View style={styles.chartBodyWrapper}>
            {/* Horizontal Grid lines */}
            <View style={styles.gridOverlay}>
              {[40000, 30000, 20000, 10000, 0].map((v) => (
                <View key={v} style={styles.gridRow}>
                  <Text style={styles.axisLabelLeft}>{v === 0 ? '0' : `${v / 1000}K`}</Text>
                  <View style={[styles.gridDashedLine, v === 0 && styles.gridSolidLine]} />
                  <Text style={styles.axisLabelRight}>{v === 0 ? '0' : `${Math.round((v / 40000) * 200)}`}</Text>
                </View>
              ))}
            </View>

            {/* Bars and Line Nodes for 7 Days */}
            <View style={styles.barsPlotArea}>
              {salesData.map((d) => {
                const barHeightPct = Math.min(100, Math.max(8, (d.sales / maxSales) * 100));
                const orderBottomPct = Math.min(95, Math.max(5, (d.orders / maxOrders) * 100));
                const isSelected = selectedDayInfo?.day === d.day;

                return (
                  <TouchableOpacity
                    key={d.day}
                    style={styles.dayColumn}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDayInfo(isSelected ? null : d)}
                  >
                    <View style={styles.columnInnerTrack}>
                      {/* Order Point Marker */}
                      <View style={[styles.orderPointMarker, { bottom: `${orderBottomPct}%` }]}>
                        <View style={styles.orderPointDot} />
                      </View>

                      {/* Sales Bar */}
                      <View
                        style={[
                          styles.salesBarShape,
                          { height: `${barHeightPct}%` },
                          isSelected && styles.salesBarSelected,
                        ]}
                      />
                    </View>

                    {/* Day Label */}
                    <Text style={[styles.dayLabelText, isSelected && styles.dayLabelSelected]}>
                      {d.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Chart Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6A1A' }]} />
              <Text style={styles.legendText}>Sales (₹)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendLineWrap}>
                <View style={styles.legendLine} />
                <View style={styles.legendCircle} />
                <View style={styles.legendLine} />
              </View>
              <Text style={styles.legendText}>Orders</Text>
            </View>
          </View>
        </View>

        {/* 5. QUICK ACCESS SECTION */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            {[
              { id: 'sales', label: 'Sales', renderIcon: () => <ShoppingCartIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('PosBilling') },
              { id: 'products', label: 'Products', renderIcon: () => <PackageIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('ProductList') },
              { id: 'inventory', label: 'Inventory', renderIcon: () => <BoxesIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('Inventory') },
              { id: 'employees', label: 'Employees', renderIcon: () => <UserRoundIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('CustomerList') },
              { id: 'customers', label: 'Customers', renderIcon: () => <UsersIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('CustomerList') },
              { id: 'suppliers', label: 'Suppliers', renderIcon: () => <TruckIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('SupplierList') },
              { id: 'reports', label: 'Reports', renderIcon: () => <ChartColumnIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('Reports') },
              { id: 'settings', label: 'Settings', renderIcon: () => <SettingsIcon size={22} color={brandColors.primary} />, action: () => navigation.navigate('Settings') },
            ].map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={styles.quickTile}
                onPress={tile.action}
                activeOpacity={0.7}
              >
                <View style={styles.quickIconBox}>
                  {tile.renderIcon()}
                </View>
                <Text style={styles.quickLabel}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. RECENT ACTIVITIES */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {recentActivities.map((act) => (
              <View key={act.id} style={styles.activityRow}>
                <View style={styles.actIconWrap}>
                  {act.icon === 'cart' ? (
                    <ShoppingCartIcon size={16} color={brandColors.primary} />
                  ) : act.icon === 'box' ? (
                    <PackageIcon size={16} color="#3B82F6" />
                  ) : act.icon === 'user' ? (
                    <UserIcon size={16} color="#10B981" />
                  ) : (
                    <RefreshIcon size={16} color="#F59E0B" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actDesc}>{act.description}</Text>
                </View>
                <Text style={styles.actTime}>{act.timestamp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. LOW STOCK PRODUCTS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lowStockTable}>
            {lowStockProducts.map((item) => (
              <View key={item.id} style={styles.lowStockRow}>
                <View style={styles.lowStockLeft}>
                  <Text style={styles.lowStockEmoji}>📦</Text>
                  <Text style={styles.lowStockName}>{item.name}</Text>
                </View>
                <Text style={styles.lowStockQty}>{item.stock}</Text>
                <View
                  style={[
                    styles.statusPill,
                    item.status_color === 'danger' ? styles.statusPillRed : styles.statusPillAmber,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      item.status_color === 'danger' ? styles.statusTextRed : styles.statusTextAmber,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* MODAL: Notifications */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setNotificationsVisible(false)}
        >
          <View style={styles.notificationsCard}>
            <Text style={styles.modalHeaderTitle}>Notifications (3)</Text>
            <View style={styles.notifItem}>
              <Text style={styles.notifAlertTitle}>⚠️ Low Stock Alert</Text>
              <Text style={styles.notifDesc}>Rice (5kg) is below reorder level (8 units left).</Text>
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.notifSuccessTitle}>✅ New Sale Recorded</Text>
              <Text style={styles.notifDesc}>Order #1025 for ₹ 850 completed successfully.</Text>
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.notifInfoTitle}>ℹ️ Staff Login</Text>
              <Text style={styles.notifDesc}>Rahul logged into cash register 30 minutes ago.</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setNotificationsVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL: Menu Drawer */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>
                  {merchantName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.drawerUserName}>{merchantName}</Text>
                <Text style={styles.drawerUserSub}>
                  {store?.name || "Merchant's Store"} • Owner
                </Text>
              </View>
            </View>

            <View style={styles.drawerList}>
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  navigation.navigate('PosBilling');
                }}
              >
                <ShoppingCartIcon size={20} color={brandColors.primary} />
                <Text style={styles.drawerItemText}>POS Billing Terminal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  navigation.navigate('ProductList');
                }}
              >
                <PackageIcon size={20} color={brandColors.primary} />
                <Text style={styles.drawerItemText}>Product Catalog</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  navigation.navigate('Inventory');
                }}
              >
                <BoxesIcon size={20} color={brandColors.primary} />
                <Text style={styles.drawerItemText}>Inventory & Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  navigation.navigate('Reports');
                }}
              >
                <ChartColumnIcon size={20} color={brandColors.primary} />
                <Text style={styles.drawerItemText}>Business Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  navigation.navigate('Settings');
                }}
              >
                <SettingsIcon size={20} color={brandColors.primary} />
                <Text style={styles.drawerItemText}>Settings & Server Host</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                setMenuModalVisible(false);
                await logout();
              }}
            >
              <LogOutIcon size={18} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3',
  },
  headerSafeArea: {
    backgroundColor: '#FF6A1A',
  },
  topHeader: {
    height: 58,
    backgroundColor: '#FF6A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  hamburger: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  hamLine: {
    width: 20,
    height: 2.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIconText: {
    fontSize: 14,
  },
  headerBrandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    position: 'relative',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 18,
  },
  badgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF6A1A',
  },
  profileAvatarPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111520',
    marginBottom: 4,
  },
  greetingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
  },
  greetingDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiBorderOrange: {
    borderColor: '#FFE4D4',
  },
  kpiBorderRed: {
    borderColor: '#FEE2E2',
  },
  kpiBorderBlue: {
    borderColor: '#DBEAFE',
  },
  kpiBorderGreen: {
    borderColor: '#D1FAE5',
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupeeIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  statEmoji: {
    fontSize: 16,
  },
  miniBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
    height: 18,
  },
  miniBar: {
    width: 3.5,
    borderRadius: 1.5,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111520',
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  kpiSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111520',
  },
  timeframeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chartTooltipBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
    alignSelf: 'center',
  },
  chartTooltipText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  chartBodyWrapper: {
    height: 160,
    marginVertical: 4,
    position: 'relative',
    justifyContent: 'space-between',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 22,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  axisLabelLeft: {
    width: 26,
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'right',
    marginRight: 6,
  },
  axisLabelRight: {
    width: 24,
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'left',
    marginLeft: 6,
  },
  gridDashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3EFEA',
  },
  gridSolidLine: {
    backgroundColor: '#E5DFD7',
  },
  barsPlotArea: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  columnInnerTrack: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  salesBarShape: {
    width: 14,
    backgroundColor: '#FF6A1A',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.85,
  },
  salesBarSelected: {
    backgroundColor: '#EA580C',
    opacity: 1,
    borderWidth: 1,
    borderColor: '#0B0B2B',
  },
  orderPointMarker: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderPointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  dayLabelText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  dayLabelSelected: {
    color: '#FF6A1A',
    fontWeight: '800',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8F5F2',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
  },
  legendLine: {
    width: 6,
    height: 2,
    backgroundColor: '#EA580C',
  },
  legendCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    backgroundColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  quickAccessSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111520',
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FF6A1A',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTile: {
    width: (screenWidth - 56) / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  quickIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickEmoji: {
    fontSize: 18,
  },
  quickLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111520',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    marginBottom: 16,
  },
  activitiesList: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111520',
  },
  actDesc: {
    fontSize: 11.5,
    color: '#64748B',
  },
  actTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  lowStockTable: {
    gap: 10,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lowStockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  lowStockEmoji: {
    fontSize: 16,
  },
  lowStockName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111520',
  },
  lowStockQty: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
    marginRight: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillRed: {
    backgroundColor: '#FEE2E2',
  },
  statusPillAmber: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusTextRed: {
    color: '#DC2626',
  },
  statusTextAmber: {
    color: '#D97706',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 11, 43, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notificationsCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111520',
    marginBottom: 14,
  },
  notifItem: {
    backgroundColor: '#F8F7F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  notifAlertTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 2,
  },
  notifSuccessTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  notifInfoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  notifDesc: {
    fontSize: 11.5,
    color: '#475569',
  },
  modalCloseBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF6A1A',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  drawerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111520',
  },
  drawerUserSub: {
    fontSize: 12,
    color: '#64748B',
  },
  drawerList: {
    gap: 8,
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8F7F5',
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111520',
  },
  logoutBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default DashboardScreen;
