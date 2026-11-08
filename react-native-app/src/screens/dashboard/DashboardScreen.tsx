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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { storeService, reportService } from '../../services';
import storage from '../../utils/storage';
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
  StoreIcon,
  HomeIcon,
  ReceiptIcon,
  CreditCardIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';

type DashNavProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashNavProp>();
  const { user, logout } = useAuth();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();

  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'This Week' | 'This Month'>('This Week');

  // Modals
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [storeSetupPopupVisible, setStoreSetupPopupVisible] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: string; sales: number; orders: number } | null>(null);

  const merchantName = user?.first_name || 'Owner';

  // Format today's date dynamically (e.g. 07 November 2026)
  const todayFormatted = (() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `Today: ${day} ${month} ${year}`;
  })();

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

      // Check if store setup popup was dismissed or completed
      const hasDismissed = await storage.getItem('nmart_setup_popup_dismissed');
      if (!hasDismissed) {
        setStoreSetupPopupVisible(true);
      }
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

  const handleDismissSetup = async () => {
    setStoreSetupPopupVisible(false);
    await storage.setItem('nmart_setup_popup_dismissed', 'true');
  };

  const handleGoToAccountDetails = async () => {
    setStoreSetupPopupVisible(false);
    await storage.setItem('nmart_setup_popup_dismissed', 'true');
    navigation.navigate('AccountDetail');
  };

  // 4 Core Stat Boxes
  const statBoxes = [
    {
      id: 'today_sales',
      title: 'Today Sales',
      value: summary?.today_sales ? `₹ ${summary.today_sales.toLocaleString()}` : '₹ 45,850',
      badge: '↑ +14.2%',
      color: '#FF6A1A',
      icon: (c: string) => <IndianRupeeIcon size={20} color={c} strokeWidth={2.5} />,
    },
    {
      id: 'total_bills',
      title: 'Total Bills Count',
      value: summary?.total_orders ? `${summary.total_orders}` : '248',
      badge: '248 Bills',
      color: '#3B82F6',
      icon: (c: string) => <ReceiptIcon size={20} color={c} />,
    },
    {
      id: 'debit_bills',
      title: 'Debit Customer Bills Count',
      value: '34',
      badge: '34 Khata',
      color: '#F59E0B',
      icon: (c: string) => <UsersIcon size={20} color={c} />,
    },
    {
      id: 'super_total',
      title: 'Super Total Bills Count',
      value: '1,890',
      badge: 'Lifetime',
      color: '#10B981',
      icon: (c: string) => <ShoppingBagIcon size={20} color={c} />,
    },
  ];

  // Sales Trend Data for Line Plot
  const salesData = [
    { day: 'Mon', sales: 18500, orders: 85, x: 25, y: 110 },
    { day: 'Tue', sales: 24400, orders: 110, x: 75, y: 85 },
    { day: 'Wed', sales: 21800, orders: 95, x: 125, y: 98 },
    { day: 'Thu', sales: 31900, orders: 135, x: 175, y: 55 },
    { day: 'Fri', sales: 36200, orders: 162, x: 225, y: 40 },
    { day: 'Sat', sales: 42500, orders: 185, x: 275, y: 20 },
    { day: 'Sun', sales: 38900, orders: 168, x: 325, y: 32 },
  ];

  // Quick Access 2 Rows x 4 Cols Grid
  const quickAccessGrid = [
    // Row 1
    { id: 'make_bill', name: 'Make Bill', icon: (c: string) => <ShoppingCartIcon size={22} color={c} />, nav: 'PosBilling' as const },
    { id: 'view_bill', name: 'View Bill', icon: (c: string) => <ReceiptIcon size={22} color={c} />, nav: 'SalesList' as const },
    { id: 'product', name: 'Product', icon: (c: string) => <PackageIcon size={22} color={c} />, nav: 'ProductList' as const },
    { id: 'debit_customer', name: 'Debit Customer', icon: (c: string) => <UsersIcon size={22} color={c} />, nav: 'CustomerList' as const },
    // Row 2
    { id: 'supper', name: 'Supper', icon: (c: string) => <TruckIcon size={22} color={c} />, nav: 'SupplierList' as const },
    { id: 'order', name: 'Order', icon: (c: string) => <ShoppingBagIcon size={22} color={c} />, nav: 'PurchaseList' as const },
    { id: 'store_expense', name: 'Store Expense', icon: (c: string) => <IndianRupeeIcon size={22} color={c} />, nav: 'Finance' as const },
    { id: 'employee', name: 'Employee', icon: (c: string) => <UserRoundIcon size={22} color={c} />, nav: 'CustomerList' as const },
  ];

  // Top 5 Recent Activities
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Bills',
      desc: 'Invoice #INV-STR001-001025 generated • ₹ 1,450',
      time: '3 mins ago',
      color: '#FF6A1A',
      icon: <ReceiptIcon size={16} color="#FFFFFF" />,
    },
    {
      id: 'act-2',
      title: 'Add product name',
      desc: 'Basmati Rice 5kg added to catalog (PRD-STR001-000214)',
      time: '15 mins ago',
      color: '#3B82F6',
      icon: <PackageIcon size={16} color="#FFFFFF" />,
    },
    {
      id: 'act-3',
      title: 'Supper bills',
      desc: 'Supplier Bill #PUR-STR001-00042 received • ₹ 18,200',
      time: '42 mins ago',
      color: '#10B981',
      icon: <TruckIcon size={16} color="#FFFFFF" />,
    },
    {
      id: 'act-4',
      title: 'Add supper',
      desc: 'New Supplier "National Agro Supplies" registered',
      time: '1 hour ago',
      color: '#8B5CF6',
      icon: <TruckIcon size={16} color="#FFFFFF" />,
    },
    {
      id: 'act-5',
      title: 'Add debit customer',
      desc: 'Customer "Ramesh Shah" added to Debit Khata (₹ 5,000 limit)',
      time: '2 hours ago',
      color: '#F59E0B',
      icon: <UsersIcon size={16} color="#FFFFFF" />,
    },
  ];

  // Top 5 Low Stock Products
  const lowStockProducts = [
    { id: 1, name: 'Basmati Rice (5kg)', stock: '3 units', status: 'Critical', color: '#EF4444' },
    { id: 2, name: 'Refined Oil (1L)', stock: '5 units', status: 'Low Stock', color: '#EF4444' },
    { id: 3, name: 'Wheat Flour (10kg)', stock: '7 units', status: 'Running Low', color: '#F59E0B' },
    { id: 4, name: 'Organic Sugar (1kg)', stock: '9 units', status: 'Running Low', color: '#F59E0B' },
    { id: 5, name: 'Green Tea (250g)', stock: '11 units', status: 'Running Low', color: '#F59E0B' },
  ];

  // Upcoming Product Orders
  const upcomingOrders = [
    { id: 'ORD-STR001-000104', customer: 'Vijay Patel', items: '8 Items', amount: '₹ 3,450', date: 'Tomorrow, 10:00 AM', status: 'Confirmed' },
    { id: 'ORD-STR001-000105', customer: 'Deepak Sharma', items: '4 Items', amount: '₹ 1,890', date: 'Tomorrow, 02:30 PM', status: 'Preparing' },
    { id: 'ORD-STR001-000106', customer: 'Meera Verma', items: '12 Items', amount: '₹ 5,200', date: '09 Nov, 11:00 AM', status: 'Scheduled' },
  ];

  // Sidebar Menu Items (11 Items)
  const sidebarMenuItems = [
    { id: 'home', label: 'Home', icon: (c: string) => <HomeIcon size={20} color={c} />, action: () => setMenuModalVisible(false) },
    { id: 'make_bill', label: 'Make Bill', icon: (c: string) => <ShoppingCartIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('PosBilling'); } },
    { id: 'view_bill', label: 'View Bill', icon: (c: string) => <ReceiptIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('SalesList'); } },
    { id: 'product', label: 'Product', icon: (c: string) => <PackageIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('ProductList'); } },
    { id: 'debit_customer', label: 'Debit Customer', icon: (c: string) => <UsersIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('CustomerList'); } },
    { id: 'supper', label: 'Supper', icon: (c: string) => <TruckIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('SupplierList'); } },
    { id: 'order', label: 'Order', icon: (c: string) => <ShoppingBagIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('PurchaseList'); } },
    { id: 'store_expense', label: 'Store Expense', icon: (c: string) => <IndianRupeeIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('Finance'); } },
    { id: 'employee', label: 'Employee', icon: (c: string) => <UserRoundIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('CustomerList'); } },
    { id: 'sales_analicis', label: 'Sales Analicis', icon: (c: string) => <ChartColumnIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('Reports'); } },
    { id: 'account', label: 'Account', icon: (c: string) => <StoreIcon size={20} color={c} />, action: () => { setMenuModalVisible(false); navigation.navigate('AccountDetail'); } },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6A1A" />

      {/* 1. TOP HEADER WITH ORANGE BANNER */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.topHeader}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setMenuModalVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Sidebar"
          >
            <View style={styles.hamburger}>
              <View style={styles.hamLine} />
              <View style={styles.hamLine} />
              <View style={styles.hamLine} />
            </View>
          </TouchableOpacity>

          {/* Centered Brand Title */}
          <View style={styles.brandTitleContainer}>
            <View style={styles.cartIconBadge}>
              <StoreIcon size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.headerBrandTitle}>NEXORA MART</Text>
          </View>

          {/* Right Header Actions: Theme Toggle & Notifications */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? <MoonIcon size={18} color="#FFFFFF" /> : <SunIcon size={18} color="#FFFFFF" />}
            </TouchableOpacity>

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
        {/* ==========================================
            WELCOME BANNER
           ========================================== */}
        <View style={[styles.greetingSection, { backgroundColor: isDark ? '#1C1E24' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <Text style={[styles.greetingTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Welcome Back, Owner
          </Text>
          <Text style={[styles.greetingDate, { color: brandColors.primary }]}>
            {todayFormatted}
          </Text>
        </View>

        {/* ==========================================
            3. 4 STAT BOXES
           ========================================== */}
        <View style={styles.kpiGrid}>
          {statBoxes.map((box) => (
            <View
              key={box.id}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: isDark ? '#181A20' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#E5E7EB',
                  borderTopColor: box.color,
                  borderTopWidth: 3,
                },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.statIconBox, { backgroundColor: box.color }]}>
                  {box.icon('#FFFFFF')}
                </View>
                <View style={[styles.kpiBadge, { backgroundColor: `${box.color}15` }]}>
                  <Text style={[styles.kpiBadgeText, { color: box.color }]}>{box.badge}</Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{box.title}</Text>
              <Text style={[styles.kpiValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>{box.value}</Text>
            </View>
          ))}
        </View>

        {/* ==========================================
            4. SALES OVERVIEW LINE PLOT
           ========================================== */}
        <View style={[styles.chartCard, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Sales Overview
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
                Revenue & Sales Trajectory
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.timeframeBadge, { backgroundColor: isDark ? '#232732' : '#F3F4F6', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}
              onPress={() => setTimeframe(timeframe === 'This Week' ? 'This Month' : 'This Week')}
            >
              <Text style={[styles.timeframeText, { color: brandColors.primary }]}>{timeframe} ⌄</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Tooltip on Node Tap */}
          {selectedDayInfo && (
            <View style={styles.chartTooltipBanner}>
              <Text style={styles.chartTooltipText}>
                {selectedDayInfo.day}: ₹{selectedDayInfo.sales.toLocaleString()} Sales • {selectedDayInfo.orders} Orders
              </Text>
            </View>
          )}

          {/* Pure React Native Responsive Sales Chart */}
          <View style={styles.svgPlotWrapper}>
            {/* Horizontal Grid Guides */}
            <View style={styles.chartGridContainer}>
              <View style={[styles.chartGridLine, { borderColor: isDark ? '#262A34' : '#F1F5F9' }]} />
              <View style={[styles.chartGridLine, { borderColor: isDark ? '#262A34' : '#F1F5F9' }]} />
              <View style={[styles.chartGridLine, { borderColor: isDark ? '#262A34' : '#F1F5F9' }]} />
              <View style={[styles.chartBaseLine, { backgroundColor: isDark ? '#2D323E' : '#E2E8F0' }]} />
            </View>

            {/* 7-Day Visual Bars & Peak Nodes */}
            <View style={styles.chartBarsContainer}>
              {salesData.map((d) => {
                const heightPercent = Math.min(Math.max((d.sales / 45000) * 110, 24), 110);
                const isSelected = selectedDayInfo?.day === d.day;
                return (
                  <TouchableOpacity
                    key={d.day}
                    style={styles.chartColTouchable}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDayInfo(isSelected ? null : d)}
                  >
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: heightPercent,
                            backgroundColor: isSelected
                              ? '#FF6A1A'
                              : isDark
                              ? 'rgba(255, 106, 26, 0.45)'
                              : 'rgba(255, 106, 26, 0.30)',
                          },
                        ]}
                      >
                        {/* Peak Node Indicator */}
                        <View
                          style={[
                            styles.barNode,
                            isSelected && styles.barNodeSelected,
                          ]}
                        />
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.dayText,
                        { color: isDark ? '#9CA3AF' : '#64748B' },
                        isSelected && { color: brandColors.primary, fontWeight: '700' },
                      ]}
                    >
                      {d.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ==========================================
            5. QUICK ACCESS (2 ROWS X 4 COLS)
           ========================================== */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Quick Access
          </Text>

          <View style={styles.quickGrid}>
            {quickAccessGrid.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.quickTile,
                  { backgroundColor: isDark ? '#22252F' : '#F8FAFC', borderColor: isDark ? '#2D323E' : '#E2E8F0' },
                ]}
                onPress={() => navigation.navigate(tile.nav as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: isDark ? 'rgba(255, 106, 26, 0.15)' : '#FFF0E8' }]}>
                  {tile.icon(brandColors.primary)}
                </View>
                <Text style={[styles.quickLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]} numberOfLines={1}>
                  {tile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==========================================
            6. RECENT ACTIVITIES (TOP 5)
           ========================================== */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Recent Activities
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {recentActivities.map((act) => (
              <View key={act.id} style={[styles.activityRow, { borderBottomColor: isDark ? '#262A34' : '#F1F5F9' }]}>
                <View style={[styles.actIconWrap, { backgroundColor: act.color }]}>
                  {act.icon}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.actTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>{act.title}</Text>
                  <Text style={[styles.actDesc, { color: isDark ? '#9CA3AF' : '#64748B' }]}>{act.desc}</Text>
                </View>
                <Text style={[styles.actTime, { color: isDark ? '#6B7280' : '#94A3B8' }]}>{act.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ==========================================
            7. LOW STOCK PRODUCT (TOP 5)
           ========================================== */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Low Stock Products (Top 5)
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>Manage Stock →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lowStockTable}>
            {lowStockProducts.map((item) => (
              <View key={item.id} style={[styles.lowStockRow, { borderBottomColor: isDark ? '#262A34' : '#F1F5F9' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lowStockName, { color: isDark ? '#FFFFFF' : '#111827' }]}>{item.name}</Text>
                  <Text style={[styles.lowStockQty, { color: isDark ? '#9CA3AF' : '#64748B' }]}>Only {item.stock} left in store</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: `${item.color}15`, borderColor: item.color }]}>
                  <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ==========================================
            8. UPCOMING PRODUCT ORDERS
           ========================================== */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Upcoming Product Orders
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PurchaseList')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>View Orders →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ordersList}>
            {upcomingOrders.map((ord) => (
              <View key={ord.id} style={[styles.orderCard, { backgroundColor: isDark ? '#232732' : '#F8FAFC', borderColor: isDark ? '#2D323E' : '#E2E8F0' }]}>
                <View style={styles.orderTopRow}>
                  <Text style={[styles.orderId, { color: brandColors.primary }]}>{ord.id}</Text>
                  <Text style={[styles.orderAmount, { color: isDark ? '#FFFFFF' : '#111827' }]}>{ord.amount}</Text>
                </View>
                <View style={styles.orderBottomRow}>
                  <Text style={[styles.orderCust, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                    👤 {ord.customer} • {ord.items}
                  </Text>
                  <Text style={[styles.orderDate, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    ⏰ {ord.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ==========================================
          STORE SETUP MODAL POPUP
         ========================================== */}
      <Modal
        visible={storeSetupPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismissSetup}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.setupCard, { backgroundColor: isDark ? '#1C1E24' : '#FFFFFF' }]}>
            <View style={styles.setupIconBox}>
              <StoreIcon size={32} color="#FF6A1A" />
            </View>
            <Text style={[styles.setupTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Complete Your Store Setup
            </Text>
            <Text style={[styles.setupSubtitle, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
              Please add your store details, address, business tax numbers, and prefix configurations to enable multi-store invoice generation.
            </Text>

            <TouchableOpacity
              style={[styles.setupActionBtn, { backgroundColor: brandColors.primary }]}
              onPress={handleGoToAccountDetails}
              activeOpacity={0.88}
            >
              <Text style={styles.setupActionText}>Add Store Details →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.setupLaterBtn}
              onPress={handleDismissSetup}
              activeOpacity={0.7}
            >
              <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', fontWeight: '600' }}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==========================================
          STORE NAVIGATION SIDEBAR (11 ITEMS)
         ========================================== */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <View style={[styles.drawerCard, { backgroundColor: isDark ? '#1C1E24' : '#FFFFFF' }]}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={[styles.drawerAvatar, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.drawerAvatarText}>
                  {merchantName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.drawerUserName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {merchantName}
                </Text>
                <Text style={[styles.drawerUserSub, { color: brandColors.primary }]}>
                  {store?.name || 'Nexora Mart'} • Owner
                </Text>
              </View>
            </View>

            {/* Drawer Navigation List (11 Items) */}
            <ScrollView style={styles.drawerList} showsVerticalScrollIndicator={false}>
              {sidebarMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.drawerItem, { borderBottomColor: isDark ? '#262A34' : '#F1F5F9' }]}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerIconBox}>
                    {item.icon(brandColors.primary)}
                  </View>
                  <Text style={[styles.drawerItemText, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                setMenuModalVisible(false);
                await logout();
              }}
              activeOpacity={0.8}
            >
              <LogOutIcon size={18} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* NOTIFICATIONS MODAL */}
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
          <View style={[styles.notificationsCard, { backgroundColor: isDark ? '#1C1E24' : '#FFFFFF' }]}>
            <Text style={[styles.modalHeaderTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Notifications (3)
            </Text>
            <View style={styles.notifItem}>
              <Text style={styles.notifAlertTitle}>⚠️ Low Stock Alert</Text>
              <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', fontSize: 13 }}>
                Basmati Rice (5kg) is below minimum threshold (3 units left).
              </Text>
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.notifSuccessTitle}>✅ New Bill Generated</Text>
              <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', fontSize: 13 }}>
                Invoice #INV-STR001-001025 completed for ₹ 1,450.
              </Text>
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.notifInfoTitle}>📦 Upcoming Order</Text>
              <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', fontSize: 13 }}>
                Order #ORD-STR001-000104 scheduled for tomorrow morning.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: brandColors.primary }]}
              onPress={() => setNotificationsVisible(false)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Close</Text>
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
  },
  headerSafeArea: {
    backgroundColor: '#FF6A1A',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconBtn: {
    padding: 6,
  },
  hamburger: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  hamLine: {
    width: '100%',
    height: 2.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerBrandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    padding: 6,
    marginLeft: 8,
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  greetingSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  greetingDate: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 11,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kpiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  timeframeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeframeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  chartTooltipBanner: {
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  chartTooltipText: {
    color: '#FF6A1A',
    fontWeight: '700',
    fontSize: 12,
  },
  svgPlotWrapper: {
    width: '100%',
    alignItems: 'center',
    height: 160,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  chartGridContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingTop: 10,
    pointerEvents: 'none',
  },
  chartGridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  chartBaseLine: {
    height: 1,
    width: '100%',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
    paddingHorizontal: 8,
  },
  chartColTouchable: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 22,
    height: 115,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  barNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6A1A',
  },
  barNodeSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.5,
  },
  chartDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 6,
  },
  dayTextWrap: {
    padding: 4,
  },
  dayText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '23%',
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activitiesList: {
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  actDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actTime: {
    fontSize: 11,
  },
  lowStockTable: {
    marginTop: 2,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '600',
  },
  lowStockQty: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ordersList: {
    marginTop: 2,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  orderBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderCust: {
    fontSize: 12,
  },
  orderDate: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  setupCard: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  setupIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 106, 26, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  setupTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  setupActionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  setupActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  setupLaterBtn: {
    paddingVertical: 8,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerCard: {
    width: '78%',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: 12,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontWeight: '700',
  },
  drawerUserSub: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  drawerList: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  drawerIconBox: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  notificationsCard: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  notifItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  notifAlertTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 2,
  },
  notifSuccessTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  notifInfoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  modalCloseBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});

export default DashboardScreen;
