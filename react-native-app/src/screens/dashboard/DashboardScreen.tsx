import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashboardScreenNavigationProp,
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import {
  storeService,
  reportService,
  salesService,
  purchaseService,
  inventoryService,
  partnerService,
} from '../../services';
import storage from '../../utils/storage';
import {
  Store,
  DashboardSummary,
  SalesAnalytics,
  Customer,
  Sale,
  Purchase,
  InventoryItem,
} from '../../models/types';
import {
  ShoppingCartIcon,
  BellIcon,
  IndianRupeeIcon,
  ShoppingBagIcon,
  PackageIcon,
  UsersIcon,
  TruckIcon,
  ChartColumnIcon,
  LogOutIcon,
  StoreIcon,
  HomeIcon,
  ReceiptIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  BoxesIcon,
} from '../../components/branding/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  timestamp: number;
  color: string;
  icon: React.ReactNode;
}

interface LowStockDisplayItem {
  id: number;
  name: string;
  stock: string;
  status: string;
  color: string;
}

interface OrderDisplayItem {
  id: string;
  customer: string;
  items: string;
  amount: string;
  date: string;
  status: string;
}

interface NotificationDisplayItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + 6 : 8;

  // Dynamic status bar adapting to light (brand orange banner) or dark (surface theme)
  useScreenSystemBar(isDark ? 'white' : 'orange');

  // Navigation Helper for Root Stack Screens
  const navigateRoot = useCallback(
    <RouteName extends keyof RootStackParamList>(
      screenName: RouteName,
      params?: RootStackParamList[RouteName]
    ) => {
      (navigation as any).navigate(screenName, params);
    },
    [navigation]
  );

  // Core Data States
  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [debitCustomerCount, setDebitCustomerCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockDisplayItem[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<OrderDisplayItem[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationDisplayItem[]>([]);

  // UI & Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'This Week' | 'This Month'>('This Week');
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: string; sales: number; orders: number } | null>(null);

  // Modals & Overlays
  const [menuModalVisible, setMenuModalVisible] = useState<boolean>(false);
  const [notificationsVisible, setNotificationsVisible] = useState<boolean>(false);
  const [storeSetupPopupVisible, setStoreSetupPopupVisible] = useState<boolean>(false);

  // Drawer Animation Setup
  const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 310);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFetchingRef = useRef<boolean>(false);

  // Open & Close Sidebar Drawer
  const openSidebar = useCallback(() => {
    setMenuModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const closeSidebar = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMenuModalVisible(false);
        if (callback) callback();
      });
    },
    [slideAnim, fadeAnim, DRAWER_WIDTH]
  );

  // Close overlays when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setMenuModalVisible(false);
      setNotificationsVisible(false);
      setStoreSetupPopupVisible(false);
    });
    return unsubscribe;
  }, [navigation]);

  const merchantName = user?.first_name || 'Owner';

  // Format today's date dynamically (e.g. 12 November 2026)
  const todayFormatted = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `Today: ${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  // Format relative timestamp helper
  const formatTimeAgo = (dateStr?: string | null): string => {
    if (!dateStr) return 'Recently';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Main Data Loader connecting to real backend APIs
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isRefresh) setLoading(true);
    setApiError(null);

    try {
      const daysCount = timeframe === 'This Week' ? 7 : 30;

      const [
        storeRes,
        summaryRes,
        analyticsRes,
        customersRes,
        salesRes,
        purchasesRes,
        lowStockRes,
      ] = await Promise.all([
        storeService.getMyStore().catch(() => null),
        reportService.getDashboardSummary().catch(() => null),
        reportService.getSalesAnalytics(daysCount).catch(() => null),
        partnerService.getCustomers().catch(() => [] as Customer[]),
        salesService.getSales({ limit: 5 }).catch(() => [] as Sale[]),
        purchaseService.getPurchases({ limit: 5 }).catch(() => [] as Purchase[]),
        inventoryService.getLowStockAlerts().catch(() => [] as InventoryItem[]),
      ]);

      if (storeRes) setStore(storeRes);
      if (summaryRes) setSummary(summaryRes);
      if (analyticsRes) setSalesAnalytics(analyticsRes);

      // Debit Customer count (Customers with outstanding credit balance)
      const debitCount = (customersRes || []).filter(
        (c) => Number(c.balance || 0) > 0
      ).length;
      setDebitCustomerCount(debitCount);

      // Real Recent Activities from Sales and Purchases
      const activities: ActivityItem[] = [];
      (salesRes || []).forEach((s) => {
        const timestamp = s.sale_date ? new Date(s.sale_date).getTime() : 0;
        activities.push({
          id: `sale-${s.id}`,
          title: `Invoice #${s.invoice_number || s.id}`,
          desc: `${formatCurrency(s.total_amount, '₹ ')} • ${(s.payment_method || 'CASH').toUpperCase()}`,
          time: formatTimeAgo(s.sale_date),
          timestamp,
          color: '#FF6A1A',
          icon: <ReceiptIcon size={16} color="#FFFFFF" />,
        });
      });

      (purchasesRes || []).forEach((p) => {
        const timestamp = p.created_at ? new Date(p.created_at).getTime() : 0;
        activities.push({
          id: `pur-${p.id}`,
          title: `PO #${p.invoice_number || p.id}`,
          desc: `${formatCurrency(p.total_amount, '₹ ')} • ${p.supplier_name || 'Supplier'}`,
          time: formatTimeAgo(p.created_at),
          timestamp,
          color: '#8B5CF6',
          icon: <TruckIcon size={16} color="#FFFFFF" />,
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 5));

      // Real Low Stock Products
      const mappedLowStock: LowStockDisplayItem[] = (lowStockRes || []).slice(0, 5).map((item) => {
        const curStock = Number(item.quantity ?? 0);
        const isCritical = curStock <= (item.min_stock_level ?? 2);
        return {
          id: Number(item.id || 0),
          name: item.product_name || 'Product',
          stock: `${curStock} ${item.unit || 'units'}`,
          status: isCritical ? 'Critical' : 'Low Stock',
          color: isCritical ? '#EF4444' : '#F59E0B',
        };
      });
      setLowStockProducts(mappedLowStock);

      // Real Upcoming / Recent Purchase Orders
      const mappedOrders: OrderDisplayItem[] = (purchasesRes || []).slice(0, 3).map((pur) => ({
        id: pur.invoice_number || `PO-${pur.id}`,
        customer: pur.supplier_name || 'Supplier Order',
        items: `${pur.items?.length || 1} Items`,
        amount: formatCurrency(pur.total_amount, '₹ '),
        date: formatDate(pur.created_at),
        status: pur.payment_status || 'Completed',
      }));
      setUpcomingOrders(mappedOrders);

      // Real Notifications from Low Stock & Pending Items
      const notifs: NotificationDisplayItem[] = [];
      mappedLowStock.forEach((ls) => {
        notifs.push({
          id: `notif-ls-${ls.id}`,
          title: '⚠️ Low Stock Alert',
          message: `${ls.name} has only ${ls.stock} left in store.`,
          type: 'warning',
        });
      });
      if (salesRes && salesRes.length > 0) {
        const latestSale = salesRes[0];
        notifs.push({
          id: `notif-sale-${latestSale.id}`,
          title: '✅ Recent Bill Completed',
          message: `Invoice #${latestSale.invoice_number || latestSale.id} completed for ${formatCurrency(latestSale.total_amount, '₹ ')}.`,
          type: 'success',
        });
      }
      if (purchasesRes && purchasesRes.length > 0) {
        const latestPur = purchasesRes[0];
        notifs.push({
          id: `notif-pur-${latestPur.id}`,
          title: '📦 Supplier Purchase Recorded',
          message: `Order #${latestPur.invoice_number || latestPur.id} from ${latestPur.supplier_name || 'Supplier'} recorded.`,
          type: 'info',
        });
      }
      setNotificationsList(notifs);

      // Check Store Setup Status (Separately stored per user/store)
      const currentStore = storeRes || store;
      const isSetupComplete = Boolean(
        currentStore?.address && currentStore?.phone && currentStore?.name
      );

      if (!isSetupComplete) {
        const setupDismissKey = `nmart_setup_popup_dismissed_store_${currentStore?.id || '0'}_user_${user?.id || '0'}`;
        const hasDismissed = await storage.getItem(setupDismissKey);
        if (!hasDismissed) {
          setStoreSetupPopupVisible(true);
        }
      } else {
        setStoreSetupPopupVisible(false);
      }
    } catch (err: any) {
      console.warn('Dashboard load error:', err);
      setApiError('Unable to load latest dashboard metrics. Pull down to retry.');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, store, user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle switching between This Week (7 days) and This Month (30 days)
  const handleTimeframeChange = async () => {
    const nextTimeframe = timeframe === 'This Week' ? 'This Month' : 'This Week';
    setTimeframe(nextTimeframe);
    setSelectedDayInfo(null);
    setAnalyticsLoading(true);

    try {
      const days = nextTimeframe === 'This Week' ? 7 : 30;
      const res = await reportService.getSalesAnalytics(days);
      if (res) setSalesAnalytics(res);
    } catch (err) {
      console.warn('Analytics timeframe switch failed:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData(true);
  }, [loadDashboardData]);

  const handleDismissSetup = async () => {
    setStoreSetupPopupVisible(false);
    const setupDismissKey = `nmart_setup_popup_dismissed_store_${store?.id || '0'}_user_${user?.id || '0'}`;
    await storage.setItem(setupDismissKey, 'true');
  };

  const handleGoToAccountDetails = async () => {
    setStoreSetupPopupVisible(false);
    const setupDismissKey = `nmart_setup_popup_dismissed_store_${store?.id || '0'}_user_${user?.id || '0'}`;
    await storage.setItem(setupDismissKey, 'true');
    navigateRoot('AccountDetail');
  };

  // 4 Core Stat Boxes with real live values
  const statBoxes = useMemo(
    () => [
      {
        id: 'today_sales',
        title: 'Today Sales',
        value: formatCurrency(summary?.today_sales ?? 0, '₹ '),
        badge: (summary?.today_sales ?? 0) > 0 ? 'Live Sales' : 'Today',
        color: '#FF6A1A',
        icon: (c: string) => <IndianRupeeIcon size={20} color={c} strokeWidth={2.5} />,
      },
      {
        id: 'total_bills',
        title: 'Total Bills Count',
        value: `${summary?.total_orders ?? 0}`,
        badge: `${summary?.total_orders ?? 0} Bills`,
        color: '#3B82F6',
        icon: (c: string) => <ReceiptIcon size={20} color={c} />,
      },
      {
        id: 'debit_bills',
        title: 'Debit Customer Bills Count',
        value: `${debitCustomerCount}`,
        badge: `${debitCustomerCount} Khata`,
        color: '#F59E0B',
        icon: (c: string) => <UsersIcon size={20} color={c} />,
      },
      {
        id: 'total_sales',
        title: 'Total Store Sales',
        value: formatCurrency(summary?.total_sales ?? 0, '₹ '),
        badge: summary?.active_products ? `${summary.active_products} Products` : 'All Time',
        color: '#10B981',
        icon: (c: string) => <ShoppingBagIcon size={20} color={c} />,
      },
    ],
    [summary, debitCustomerCount]
  );

  // Sales Trend Data points dynamically calculated from real sales analytics
  const chartPoints = useMemo(() => {
    const trends = salesAnalytics?.daily_trends || (salesAnalytics as any)?.items;
    if (!trends || trends.length === 0) {
      return [];
    }
    return trends.map((item: any) => ({
      date: item.date,
      sales: Number(item.sales || 0),
      orders: Number(item.orders || 0),
    }));
  }, [salesAnalytics]);

  const maxChartSales = useMemo(() => {
    if (chartPoints.length === 0) return 100;
    const maxVal = Math.max(...chartPoints.map((p) => p.sales));
    return maxVal > 0 ? maxVal : 100;
  }, [chartPoints]);

  // Quick Access 2 Rows x 4 Columns Navigation Grid
  const quickAccessGrid = useMemo(
    () => [
      {
        id: 'make_bill',
        name: 'Make Bill',
        icon: (c: string) => <ShoppingCartIcon size={22} color={c} />,
        action: () => navigation.navigate('PosTab'),
      },
      {
        id: 'view_bill',
        name: 'View Bill',
        icon: (c: string) => <ReceiptIcon size={22} color={c} />,
        action: () => navigateRoot('SalesList'),
      },
      {
        id: 'add_product',
        name: 'Add Product',
        icon: (c: string) => <PlusIcon size={22} color={c} />,
        action: () => navigateRoot('AddProduct', {}),
      },
      {
        id: 'product',
        name: 'Product',
        icon: (c: string) => <PackageIcon size={22} color={c} />,
        action: () => navigation.navigate('ProductsTab'),
      },
      {
        id: 'inventory',
        name: 'Inventory',
        icon: (c: string) => <BoxesIcon size={22} color={c} />,
        action: () => navigateRoot('Inventory'),
      },
      {
        id: 'debit_customer',
        name: 'Customer',
        icon: (c: string) => <UsersIcon size={22} color={c} />,
        action: () => navigation.navigate('CustomerTab'),
      },
      {
        id: 'supplier',
        name: 'Supplier',
        icon: (c: string) => <TruckIcon size={22} color={c} />,
        action: () => navigateRoot('SupplierList'),
      },
      {
        id: 'store_expense',
        name: 'Expense',
        icon: (c: string) => <IndianRupeeIcon size={22} color={c} />,
        action: () => navigateRoot('Finance'),
      },
    ],
    [navigation, navigateRoot]
  );

  // Sidebar Menu Items with animated close and verified routing
  const sidebarMenuItems = useMemo(
    () => [
      {
        id: 'home',
        label: 'Home',
        icon: (c: string) => <HomeIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigation.navigate('DashboardTab')),
      },
      {
        id: 'make_bill',
        label: 'Make Bill (POS)',
        icon: (c: string) => <ShoppingCartIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigation.navigate('PosTab')),
      },
      {
        id: 'view_bill',
        label: 'View Bill & Invoices',
        icon: (c: string) => <ReceiptIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('SalesList')),
      },
      {
        id: 'product',
        label: 'Product List',
        icon: (c: string) => <PackageIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigation.navigate('ProductsTab')),
      },
      {
        id: 'add_product',
        label: 'Add Product',
        icon: (c: string) => <PlusIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('AddProduct', {})),
      },
      {
        id: 'inventory',
        label: 'Inventory Stock',
        icon: (c: string) => <BoxesIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('Inventory')),
      },
      {
        id: 'debit_customer',
        label: 'Customer Khata',
        icon: (c: string) => <UsersIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigation.navigate('CustomerTab')),
      },
      {
        id: 'supplier',
        label: 'Supplier Directory',
        icon: (c: string) => <TruckIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('SupplierList')),
      },
      {
        id: 'order',
        label: 'Purchase Orders',
        icon: (c: string) => <ShoppingBagIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('PurchaseList')),
      },
      {
        id: 'store_expense',
        label: 'Store Expense',
        icon: (c: string) => <IndianRupeeIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('Finance')),
      },
      {
        id: 'sales_analytics',
        label: 'Sales Analytics & Reports',
        icon: (c: string) => <ChartColumnIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('Reports')),
      },
      {
        id: 'account',
        label: 'Account & Store Details',
        icon: (c: string) => <StoreIcon size={20} color={c} />,
        action: () => closeSidebar(() => navigateRoot('AccountDetail')),
      },
    ],
    [closeSidebar, navigation, navigateRoot]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. TOP HEADER - Dynamically adapts to theme */}
      <View
        style={[
          styles.headerTopContainer,
          {
            paddingTop: topPadding,
            backgroundColor: isDark ? colors.surface : brandColors.primary,
            borderBottomWidth: isDark ? 1 : 0,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.topHeader}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={openSidebar}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open Navigation Sidebar"
          >
            <View style={styles.hamburger}>
              <View
                style={[
                  styles.hamLine,
                  { backgroundColor: isDark ? colors.textPrimary : '#FFFFFF' },
                ]}
              />
              <View
                style={[
                  styles.hamLine,
                  { backgroundColor: isDark ? colors.textPrimary : '#FFFFFF' },
                ]}
              />
              <View
                style={[
                  styles.hamLine,
                  { backgroundColor: isDark ? colors.textPrimary : '#FFFFFF' },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Centered Brand Title with White Circle Logo */}
          <View style={styles.brandTitleContainer}>
            <View
              style={[
                styles.headerLogoCircle,
                { backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF' },
              ]}
            >
              <Image
                source={require('../../assets/m-logo-3d.png')}
                style={styles.headerLogoImg}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.headerBrandTitle,
                { color: isDark ? colors.textPrimary : '#FFFFFF' },
              ]}
            >
              TULSI MART
            </Text>
          </View>

          {/* Right Header Actions: Theme Toggle & Notifications */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={toggleTheme}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Toggle Theme Mode"
            >
              {isDark ? (
                <MoonIcon size={18} color={colors.textPrimary} />
              ) : (
                <SunIcon size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setNotificationsVisible(true)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Notifications (${notificationsList.length})`}
            >
              <BellIcon size={20} color={isDark ? colors.textPrimary : '#FFFFFF'} />
              {notificationsList.length > 0 && (
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeText}>
                    {notificationsList.length > 9 ? '9+' : notificationsList.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. SCROLLABLE SCREEN CONTENT */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[brandColors.primary]}
            tintColor={brandColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner if API Call Encountered an Issue */}
        {apiError && (
          <TouchableOpacity
            style={[styles.errorBanner, { backgroundColor: brandColors.errorLight || '#FEF2F2' }]}
            onPress={() => loadDashboardData(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.errorBannerText, { color: brandColors.error || '#DC2626' }]}>
              {apiError}
            </Text>
          </TouchableOpacity>
        )}

        {/* ==========================================
            WELCOME BANNER
           ========================================== */}
        <View
          style={[
            styles.greetingSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
            Welcome Back, {merchantName}
          </Text>
          <Text style={[styles.greetingDate, { color: brandColors.primary }]}>
            {todayFormatted}
          </Text>
        </View>

        {/* ==========================================
            3. 4 STAT BOXES (REAL DATA ONLY)
           ========================================== */}
        <View style={styles.kpiGrid}>
          {statBoxes.map((box) => (
            <View
              key={box.id}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
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
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{box.title}</Text>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={box.color}
                  style={{ alignSelf: 'flex-start', marginVertical: 4 }}
                />
              ) : (
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{box.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* ==========================================
            4. SALES OVERVIEW LINE PLOT (DYNAMIC TIMEFRAME)
           ========================================== */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Sales Overview
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {salesAnalytics
                  ? `${formatCurrency(salesAnalytics.total_sales ?? (salesAnalytics as any).total_revenue ?? 0, '₹ ')} Revenue • ${salesAnalytics.total_orders ?? 0} Orders`
                  : 'Revenue & Sales Trajectory'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.timeframeBadge,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F3F4F6',
                  borderColor: colors.border,
                },
              ]}
              onPress={handleTimeframeChange}
              disabled={analyticsLoading}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Selected timeframe: ${timeframe}. Tap to switch.`}
            >
              {analyticsLoading ? (
                <ActivityIndicator size="small" color={brandColors.primary} />
              ) : (
                <Text style={[styles.timeframeText, { color: brandColors.primary }]}>
                  {timeframe} ⌄
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Interactive Tooltip on Node Tap */}
          {selectedDayInfo && (
            <View style={styles.chartTooltipBanner}>
              <Text style={styles.chartTooltipText}>
                {selectedDayInfo.day}: {formatCurrency(selectedDayInfo.sales, '₹ ')} Sales • {selectedDayInfo.orders} Orders
              </Text>
            </View>
          )}

          {/* Pure React Native Responsive Sales Chart */}
          <View style={styles.svgPlotWrapper}>
            {/* Horizontal Grid Guides */}
            <View style={styles.chartGridContainer}>
              <View style={[styles.chartGridLine, { borderColor: colors.borderLight }]} />
              <View style={[styles.chartGridLine, { borderColor: colors.borderLight }]} />
              <View style={[styles.chartGridLine, { borderColor: colors.borderLight }]} />
              <View style={[styles.chartBaseLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Dynamic Visual Bars & Nodes */}
            {chartPoints.length === 0 ? (
              <View style={styles.chartEmptyWrap}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No sales recorded for {timeframe.toLowerCase()}. Invoices generated will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal={timeframe === 'This Month'}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.chartBarsContainer,
                  timeframe === 'This Month' && { paddingHorizontal: 12 },
                ]}
              >
                {chartPoints.map((d, idx) => {
                  const heightPercent =
                    maxChartSales > 0 && d.sales > 0
                      ? Math.min(Math.max((d.sales / maxChartSales) * 110, 18), 110)
                      : 6;
                  const isSelected = selectedDayInfo?.day === d.date;

                  return (
                    <TouchableOpacity
                      key={`${d.date}-${idx}`}
                      style={[
                        styles.chartColTouchable,
                        timeframe === 'This Month' && { width: 36, marginHorizontal: 2 },
                      ]}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelectedDayInfo(
                          isSelected ? null : { day: d.date, sales: d.sales, orders: d.orders }
                        )
                      }
                    >
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: heightPercent,
                              backgroundColor: isSelected
                                ? brandColors.primary
                                : d.sales > 0
                                ? isDark
                                  ? 'rgba(255, 106, 26, 0.45)'
                                  : 'rgba(255, 106, 26, 0.30)'
                                : colors.borderLight,
                            },
                          ]}
                        >
                          {d.sales > 0 && (
                            <View
                              style={[
                                styles.barNode,
                                isSelected && styles.barNodeSelected,
                              ]}
                            />
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.dayText,
                          { color: colors.textSecondary },
                          isSelected && { color: brandColors.primary, fontWeight: '700' },
                        ]}
                        numberOfLines={1}
                      >
                        {d.date.length > 3 && timeframe === 'This Month'
                          ? d.date.split(' ')[1] || d.date
                          : d.date}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>

        {/* ==========================================
            5. QUICK ACCESS (2 ROWS X 4 COLS)
           ========================================== */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Access
          </Text>

          <View style={styles.quickGrid}>
            {quickAccessGrid.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.quickTile,
                  {
                    backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
                onPress={tile.action}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={tile.name}
              >
                <View
                  style={[
                    styles.quickIconWrap,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 106, 26, 0.15)'
                        : '#FFF0E8',
                    },
                  ]}
                >
                  {tile.icon(brandColors.primary)}
                </View>
                <Text
                  style={[styles.quickLabel, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {tile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==========================================
            6. RECENT ACTIVITIES (REAL DATA ONLY)
           ========================================== */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recent Activities
            </Text>
            <TouchableOpacity onPress={() => navigateRoot('Reports')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {recentActivities.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No recent activity recorded yet. Invoices and orders will appear here as you create them.
              </Text>
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {recentActivities.map((act) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityRow,
                    { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View style={[styles.actIconWrap, { backgroundColor: act.color }]}>
                    {act.icon}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.actTitle, { color: colors.textPrimary }]}>
                      {act.title}
                    </Text>
                    <Text style={[styles.actDesc, { color: colors.textSecondary }]}>
                      {act.desc}
                    </Text>
                  </View>
                  <Text style={[styles.actTime, { color: colors.textMuted }]}>
                    {act.time}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ==========================================
            7. LOW STOCK PRODUCT (REAL DATA ONLY)
           ========================================== */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Low Stock Products
            </Text>
            <TouchableOpacity onPress={() => navigateRoot('Inventory')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>
                Manage Stock →
              </Text>
            </TouchableOpacity>
          </View>

          {lowStockProducts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyStateSuccessText, { color: brandColors.success || '#10B981' }]}>
                ✅ All products are well-stocked. No low stock alerts currently.
              </Text>
            </View>
          ) : (
            <View style={styles.lowStockTable}>
              {lowStockProducts.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.lowStockRow,
                    { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lowStockName, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.lowStockQty, { color: colors.textSecondary }]}>
                      Only {item.stock} left in store
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: `${item.color}15`,
                        borderColor: item.color,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: item.color }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ==========================================
            8. UPCOMING PRODUCT ORDERS (REAL DATA ONLY)
           ========================================== */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Upcoming & Recent Purchases
            </Text>
            <TouchableOpacity onPress={() => navigateRoot('PurchaseList')}>
              <Text style={{ color: brandColors.primary, fontSize: 13, fontWeight: '600' }}>
                View Orders →
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingOrders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No purchase orders recorded yet. Supplier orders will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {upcomingOrders.map((ord) => (
                <View
                  key={ord.id}
                  style={[
                    styles.orderCard,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.orderTopRow}>
                    <Text style={[styles.orderId, { color: brandColors.primary }]}>
                      {ord.id}
                    </Text>
                    <Text style={[styles.orderAmount, { color: colors.textPrimary }]}>
                      {ord.amount}
                    </Text>
                  </View>
                  <View style={styles.orderBottomRow}>
                    <Text style={[styles.orderCust, { color: colors.textSecondary }]}>
                      👤 {ord.customer} • {ord.items}
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                      ⏰ {ord.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ==========================================
          STORE SETUP MODAL (TRUE NATIVE MODAL)
         ========================================== */}
      <Modal
        visible={storeSetupPopupVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismissSetup}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.setupCard, { backgroundColor: colors.surface }]}>
            <View style={styles.setupIconBox}>
              <StoreIcon size={32} color={brandColors.primary} />
            </View>
            <Text style={[styles.setupTitle, { color: colors.textPrimary }]}>
              Complete Your Store Setup
            </Text>
            <Text style={[styles.setupSubtitle, { color: colors.textSecondary }]}>
              Please add your store address, contact details, and tax information to unlock multi-store invoice generation.
            </Text>

            <TouchableOpacity
              style={[styles.setupActionBtn, { backgroundColor: brandColors.primary }]}
              onPress={handleGoToAccountDetails}
              activeOpacity={0.88}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add Store Details"
            >
              <Text style={styles.setupActionText}>Add Store Details →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.setupLaterBtn}
              onPress={handleDismissSetup}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Maybe Later"
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==========================================
          STORE NAVIGATION SIDEBAR (TRUE NATIVE MODAL)
         ========================================== */}
      <Modal
        visible={menuModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => closeSidebar()}
      >
        <View style={styles.drawerModalContainer}>
          <TouchableWithoutFeedback onPress={() => closeSidebar()}>
            <Animated.View
              style={[
                styles.drawerBackdrop,
                {
                  opacity: fadeAnim,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.drawerCard,
              {
                width: DRAWER_WIDTH,
                backgroundColor: colors.surface,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Drawer Header */}
            <View
              style={[
                styles.drawerHeader,
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={[styles.drawerAvatar, { backgroundColor: '#FFF5F0', overflow: 'hidden' }]}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.drawerUserName, { color: colors.textPrimary }]}>
                  {merchantName}
                </Text>
                <Text style={[styles.drawerUserSub, { color: brandColors.primary }]}>
                  {store?.name || 'Tulsi Mart'} (TM Mart) • Owner
                </Text>
              </View>
            </View>

            {/* Drawer Navigation List */}
            <ScrollView style={styles.drawerList} showsVerticalScrollIndicator={false}>
              {sidebarMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.drawerItem,
                    { borderBottomColor: colors.borderLight },
                  ]}
                  onPress={item.action}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={styles.drawerIconBox}>
                    {item.icon(brandColors.primary)}
                  </View>
                  <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                closeSidebar(async () => {
                  await logout();
                });
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign Out of Store"
            >
              <LogOutIcon size={18} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ==========================================
          NOTIFICATIONS MODAL (TRUE NATIVE MODAL)
         ========================================== */}
      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setNotificationsVisible(false)}
        >
          <View style={[styles.notificationsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
              Notifications ({notificationsList.length})
            </Text>

            {notificationsList.length === 0 ? (
              <Text style={[styles.emptyStateText, { color: colors.textSecondary, marginVertical: 16 }]}>
                No new notifications. Your store is running smoothly.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {notificationsList.map((notif) => (
                  <View
                    key={notif.id}
                    style={[
                      styles.notifItem,
                      { borderBottomColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.notifItemTitle,
                        notif.type === 'warning' && { color: '#F59E0B' },
                        notif.type === 'success' && { color: '#10B981' },
                        notif.type === 'info' && { color: '#3B82F6' },
                      ]}
                    >
                      {notif.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {notif.message}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: brandColors.primary }]}
              onPress={() => setNotificationsVisible(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close Notifications"
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
  headerTopContainer: {
    width: '100%',
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
    borderRadius: 2,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerLogoImg: {
    width: 25,
    height: 20,
  },
  headerBrandTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
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
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
    minWidth: 92,
    alignItems: 'center',
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
  chartEmptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  dayText: {
    fontSize: 11,
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
  emptyWrap: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyStateSuccessText: {
    fontSize: 13,
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
  drawerModalContainer: {
    flex: 1,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawerCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
    paddingHorizontal: 18,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  },
  notifItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
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
