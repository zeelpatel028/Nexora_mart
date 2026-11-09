import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  PackageIcon,
  PlusIcon,
  UsersIcon,
  TruckIcon,
  ShoppingBagIcon,
  IndianRupeeIcon,
  ChartColumnIcon,
  StoreIcon,
  SettingsIcon,
  BoxesIcon,
  LogOutIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';

type MoreNavProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuListItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: (color: string) => React.ReactNode;
  screen?: keyof RootStackParamList | 'DashboardTab';
  params?: any;
  isDanger?: boolean;
}

export const MoreMenuScreen: React.FC = () => {
  const navigation = useNavigation<MoreNavProp>();
  const { colors, brandColors, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);

  // Set orange status bar every time MoreMenu comes into focus
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FF6A1A');
        StatusBar.setTranslucent(true);
      }
    }, [])
  );

  // Categorized Sections
  const categorizedSections: { title: string; items: MenuListItem[] }[] = [
    {
      title: 'Main Store Navigation',
      items: [
        {
          id: 'nav_home',
          title: 'Home (Dashboard)',
          subtitle: 'Store overview, live sales metrics & recent activities',
          color: '#FF6A1A',
          icon: (c) => <HomeIcon size={20} color={c} />,
          screen: 'DashboardTab',
        },
      ],
    },
    {
      title: 'Billing & POS Operations',
      items: [
        {
          id: 'pos_make_bill',
          title: 'Make Bill',
          subtitle: 'Create fast retail invoices & barcode checkout',
          color: '#FF6A1A',
          icon: (c) => <ShoppingCartIcon size={20} color={c} />,
          screen: 'PosBilling',
        },
        {
          id: 'pos_view_bill',
          title: 'View Bill & Invoices',
          subtitle: 'Audit completed customer orders & receipts',
          color: '#3B82F6',
          icon: (c) => <ReceiptIcon size={20} color={c} />,
          screen: 'SalesList',
        },
        {
          id: 'pos_debit_customer',
          title: 'Debit Customer (Khata)',
          subtitle: 'Customer ledger, outstanding balance & credit',
          color: '#F59E0B',
          icon: (c) => <UsersIcon size={20} color={c} />,
          screen: 'CustomerList',
        },
      ],
    },
    {
      title: 'Product & Stock Management',
      items: [
        {
          id: 'nav_product',
          title: 'Product Directory',
          subtitle: 'View, edit, search and filter all products',
          color: '#10B981',
          icon: (c) => <PackageIcon size={20} color={c} />,
          screen: 'ProductList',
        },
        {
          id: 'nav_add_product',
          title: 'Add New Product',
          subtitle: 'Register barcode, pricing, MRP & stock',
          color: '#059669',
          icon: (c) => <PlusIcon size={20} color={c} />,
          screen: 'AddProduct',
        },
        {
          id: 'nav_inventory',
          title: 'Inventory & Stock Manager',
          subtitle: 'Live stock quantities, reorder levels & alerts',
          color: '#0D9488',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          screen: 'Inventory',
        },
        {
          id: 'nav_stock_adjustment',
          title: 'Stock Adjustment',
          subtitle: 'Audit count corrections & damaged stock',
          color: '#F59E0B',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          screen: 'StockAdjustment',
        },
      ],
    },
    {
      title: 'Suppliers & Purchases',
      items: [
        {
          id: 'nav_supper',
          title: 'Supper (Supplier Directory)',
          subtitle: 'Vendor contact information & payables',
          color: '#8B5CF6',
          icon: (c) => <TruckIcon size={20} color={c} />,
          screen: 'SupplierList',
        },
        {
          id: 'nav_order',
          title: 'Order (Purchase Orders)',
          subtitle: 'Manage supplier purchases & purchase history',
          color: '#EC4899',
          icon: (c) => <ShoppingBagIcon size={20} color={c} />,
          screen: 'PurchaseList',
        },
      ],
    },
    {
      title: 'Finance & Analytics',
      items: [
        {
          id: 'nav_store_expense',
          title: 'Store Expense',
          subtitle: 'Record store daily expenses & cashbook',
          color: '#06B6D4',
          icon: (c) => <IndianRupeeIcon size={20} color={c} />,
          screen: 'Finance',
        },
        {
          id: 'nav_sales_analicis',
          title: 'Sales Analicis',
          subtitle: 'Sales reports, revenue trend & profit margins',
          color: '#3B82F6',
          icon: (c) => <ChartColumnIcon size={20} color={c} />,
          screen: 'Reports',
        },
        {
          id: 'nav_valuation',
          title: 'Inventory Valuation',
          subtitle: 'Current total inventory asset valuation',
          color: '#10B981',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          screen: 'InventoryValuation',
        },
      ],
    },
    {
      title: 'App Settings & Store Account',
      items: [
        {
          id: 'nav_account',
          title: 'Account & Store Details',
          subtitle: 'Store profile, GSTIN, address & business info',
          color: '#FF6A1A',
          icon: (c) => <StoreIcon size={20} color={c} />,
          screen: 'AccountDetail',
        },
        {
          id: 'nav_settings',
          title: 'App Settings & Theme',
          subtitle: 'System dark/light theme & preferences',
          color: '#475569',
          icon: (c) => <SettingsIcon size={20} color={c} />,
          screen: 'Settings',
        },
        {
          id: 'nav_logout',
          title: 'Sign Out',
          subtitle: `Currently logged in as ${user?.email || 'Merchant'}`,
          color: '#EF4444',
          icon: (c) => <LogOutIcon size={20} color={c} />,
          isDanger: true,
        },
      ],
    },
  ];

  const handleItemPress = (item: MenuListItem) => {
    if (item.isDanger || item.id === 'nav_logout') {
      Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]);
    } else if (item.screen || item.id === 'nav_home') {
      if (item.screen === 'DashboardTab' || item.id === 'nav_home') {
        navigation.navigate('MainTabs' as any, { screen: 'DashboardTab' });
      } else if (item.screen === 'PosBilling') {
        navigation.navigate('MainTabs' as any, { screen: 'PosTab' });
      } else if (item.screen === 'ProductList') {
        navigation.navigate('MainTabs' as any, { screen: 'ProductsTab' });
      } else if (item.screen === 'CustomerList') {
        navigation.navigate('MainTabs' as any, { screen: 'CustomerTab' });
      } else {
        navigation.navigate(item.screen as any, item.params);
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6A1A"
        translucent={Platform.OS === 'android'}
      />

      {/* Top Header Bar with Seamless Orange Status Bar Space and White Circle Brand Logo */}
      <View style={[styles.headerTopContainer, { paddingTop: topInset + 6 }]}>
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoCircle}>
              <Image
                source={require('../../assets/m-logo-3d.png')}
                style={styles.headerLogoImg}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerBrandTitle}>NEXORA MART</Text>
              <Text style={styles.headerSubTitle}>All Store Operations</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.themeToggleBtn}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme Mode"
          >
            {isDark ? (
              <MoonIcon size={18} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <SunIcon size={18} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Categorized Detailed Menu Lists */}
        {categorizedSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.categorySection}>
            <Text style={[styles.sectionHeading, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {section.title.toUpperCase()}
            </Text>

            <View
              style={[
                styles.cardBox,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#E5E7EB',
                },
              ]}
            >
              {section.items.map((item, iIdx) => {
                const isLast = iIdx === section.items.length - 1;
                const iconColor = item.isDanger ? '#EF4444' : item.color || brandColors.primary;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !isLast && {
                        borderBottomColor: isDark ? '#262A34' : '#F1F5F9',
                        borderBottomWidth: 1,
                      },
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.itemIconBox,
                        {
                          backgroundColor: item.isDanger
                            ? 'rgba(239, 68, 68, 0.12)'
                            : `${item.color}15`,
                        },
                      ]}
                    >
                      {item.icon(iconColor)}
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text
                        style={[
                          styles.itemTitle,
                          { color: item.isDanger ? '#EF4444' : isDark ? '#FFFFFF' : '#111827' },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.itemSub, { color: isDark ? '#8A909D' : '#6B7280' }]}
                        numberOfLines={1}
                      >
                        {item.subtitle}
                      </Text>
                    </View>

                    <ChevronRightIcon
                      size={18}
                      color={isDark ? '#4B5563' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerTopContainer: {
    backgroundColor: '#FF6A1A',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubTitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    fontWeight: '500',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  categorySection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginLeft: 4,
    marginBottom: 6,
  },
  cardBox: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});

export default MoreMenuScreen;
