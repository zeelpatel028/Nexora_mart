import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MoreScreenNavigationProp,
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useScreenSystemBar } from '../../utils/systemBar';
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

export type MenuItemTarget =
  | { type: 'tab'; screen: keyof MainTabParamList }
  | { type: 'stack'; screen: keyof RootStackParamList; params?: any }
  | { type: 'action' };

export interface MenuListItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: (color: string) => React.ReactNode;
  target: MenuItemTarget;
  isDanger?: boolean;
  accessibilityHint?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuListItem[];
}

export const MoreMenuScreen: React.FC = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { colors, brandColors, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Dynamic status bar adapting to light (brand orange banner) or dark (surface theme)
  useScreenSystemBar(isDark ? 'white' : 'orange');

  const topPadding = insets.top > 0 ? insets.top + 6 : 8;

  // Categorized Sections with strictly-typed navigation destinations
  const categorizedSections: MenuSection[] = [
    {
      id: 'sec_main_nav',
      title: 'Main Store Navigation',
      items: [
        {
          id: 'nav_home',
          title: 'Home (Dashboard)',
          subtitle: 'Store overview, live sales metrics & recent activities',
          color: '#FF6A1A',
          icon: (c) => <HomeIcon size={20} color={c} />,
          target: { type: 'tab', screen: 'DashboardTab' },
          accessibilityHint: 'Switches to the Home Dashboard tab',
        },
      ],
    },
    {
      id: 'sec_pos_operations',
      title: 'Billing & POS Operations',
      items: [
        {
          id: 'pos_make_bill',
          title: 'Make Bill',
          subtitle: 'Create fast retail invoices & barcode checkout',
          color: '#FF6A1A',
          icon: (c) => <ShoppingCartIcon size={20} color={c} />,
          target: { type: 'tab', screen: 'PosTab' },
          accessibilityHint: 'Switches to Make Bills POS terminal tab',
        },
        {
          id: 'pos_view_bill',
          title: 'View Bill & Invoices',
          subtitle: 'Audit completed customer orders & receipts',
          color: '#3B82F6',
          icon: (c) => <ReceiptIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'SalesList' },
          accessibilityHint: 'Opens completed customer orders and receipts',
        },
        {
          id: 'pos_debit_customer',
          title: 'Debit Customer (Khata)',
          subtitle: 'Customer ledger, outstanding balance & credit',
          color: '#F59E0B',
          icon: (c) => <UsersIcon size={20} color={c} />,
          target: { type: 'tab', screen: 'CustomerTab' },
          accessibilityHint: 'Switches to Customer ledger and directory tab',
        },
      ],
    },
    {
      id: 'sec_product_inventory',
      title: 'Product & Stock Management',
      items: [
        {
          id: 'nav_product',
          title: 'Product Directory',
          subtitle: 'View, edit, search and filter all products',
          color: '#10B981',
          icon: (c) => <PackageIcon size={20} color={c} />,
          target: { type: 'tab', screen: 'ProductsTab' },
          accessibilityHint: 'Switches to Products catalog tab',
        },
        {
          id: 'nav_add_product',
          title: 'Add New Product',
          subtitle: 'Register barcode, pricing, MRP & stock',
          color: '#059669',
          icon: (c) => <PlusIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'AddProduct' },
          accessibilityHint: 'Opens form to add a new product',
        },
        {
          id: 'nav_inventory',
          title: 'Inventory & Stock Manager',
          subtitle: 'Live stock quantities, reorder levels & alerts',
          color: '#0D9488',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'Inventory' },
          accessibilityHint: 'Opens inventory and stock management',
        },
        {
          id: 'nav_stock_adjustment',
          title: 'Stock Adjustment',
          subtitle: 'Audit count corrections & damaged stock',
          color: '#F59E0B',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'StockAdjustment' },
          accessibilityHint: 'Opens stock adjustment form',
        },
      ],
    },
    {
      id: 'sec_suppliers_purchases',
      title: 'Suppliers & Purchases',
      items: [
        {
          id: 'nav_supplier',
          title: 'Supplier (Vendor Directory)',
          subtitle: 'Vendor contact information & payables',
          color: '#8B5CF6',
          icon: (c) => <TruckIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'SupplierList' },
          accessibilityHint: 'Opens vendor directory and payables',
        },
        {
          id: 'nav_order',
          title: 'Order (Purchase Orders)',
          subtitle: 'Manage supplier purchases & purchase history',
          color: '#EC4899',
          icon: (c) => <ShoppingBagIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'PurchaseList' },
          accessibilityHint: 'Opens supplier purchase orders history',
        },
        {
          id: 'nav_create_purchase',
          title: 'Create Purchase Order',
          subtitle: 'Procure goods from suppliers & record bills',
          color: '#8B5CF6',
          icon: (c) => <PlusIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'CreatePurchase' },
          accessibilityHint: 'Opens form to create a new purchase order',
        },
      ],
    },
    {
      id: 'sec_finance_analytics',
      title: 'Finance & Analytics',
      items: [
        {
          id: 'nav_store_expense',
          title: 'Store Expense',
          subtitle: 'Record store daily expenses & cashbook',
          color: '#06B6D4',
          icon: (c) => <IndianRupeeIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'Finance' },
          accessibilityHint: 'Opens store daily expenses and cashbook',
        },
        {
          id: 'nav_sales_analytics',
          title: 'Sales Analytics',
          subtitle: 'Sales reports, revenue trend & profit margins',
          color: '#3B82F6',
          icon: (c) => <ChartColumnIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'Reports' },
          accessibilityHint: 'Opens sales reports and analytics',
        },
        {
          id: 'nav_valuation',
          title: 'Inventory Valuation',
          subtitle: 'Current total inventory asset valuation',
          color: '#10B981',
          icon: (c) => <BoxesIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'InventoryValuation' },
          accessibilityHint: 'Opens inventory asset valuation report',
        },
      ],
    },
    {
      id: 'sec_settings_account',
      title: 'App Settings & Store Account',
      items: [
        {
          id: 'nav_account',
          title: 'Account & Store Details',
          subtitle: 'Store profile, GSTIN, address & business info',
          color: '#FF6A1A',
          icon: (c) => <StoreIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'AccountDetail' },
          accessibilityHint: 'Opens store profile and business details',
        },
        {
          id: 'nav_settings',
          title: 'App Settings & Theme',
          subtitle: 'System dark/light theme & preferences',
          color: '#475569',
          icon: (c) => <SettingsIcon size={20} color={c} />,
          target: { type: 'stack', screen: 'Settings' },
          accessibilityHint: 'Opens application settings and preferences',
        },
        {
          id: 'nav_logout',
          title: 'Sign Out',
          subtitle: `Currently logged in as ${user?.email || 'Merchant'}`,
          color: '#EF4444',
          icon: (c) => <LogOutIcon size={20} color={c} />,
          target: { type: 'action' },
          isDanger: true,
          accessibilityHint: 'Logs out of the current session',
        },
      ],
    },
  ];

  const handleLogout = () => {
    if (isLoggingOut) return;

    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (error: any) {
            Alert.alert(
              'Sign Out Failed',
              error?.message || 'Unable to log out. Please check your network and try again.'
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleItemPress = (item: MenuListItem) => {
    if (item.target.type === 'action') {
      if (item.id === 'nav_logout') {
        handleLogout();
      }
      return;
    }

    if (item.target.type === 'tab') {
      navigation.navigate(item.target.screen);
      return;
    }

    if (item.target.type === 'stack') {
      navigation.navigate(item.target.screen as any, item.target.params);
      return;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Header Bar - Dynamically adapts to theme (Orange brand in Light, Slate Surface in Dark) */}
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
          <View style={styles.headerLeft}>
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
            <View>
              <Text
                style={[
                  styles.headerBrandTitle,
                  { color: isDark ? colors.textPrimary : '#FFFFFF' },
                ]}
              >
                NEXORA MART
              </Text>
              <Text
                style={[
                  styles.headerSubTitle,
                  { color: isDark ? colors.textSecondary : 'rgba(255, 255, 255, 0.88)' },
                ]}
              >
                All Store Operations
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceSubtle
                  : 'rgba(255, 255, 255, 0.22)',
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme Mode"
            accessibilityHint="Toggles between dark and light appearance"
          >
            {isDark ? (
              <MoonIcon size={18} color={colors.textPrimary} strokeWidth={2} />
            ) : (
              <SunIcon size={18} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Categorized Detailed Menu Lists */}
        {categorizedSections.map((section) => (
          <View key={section.id} style={styles.categorySection}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>

            <View
              style={[
                styles.cardBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {section.items.map((item, iIdx) => {
                const isLast = iIdx === section.items.length - 1;
                const iconColor = item.isDanger
                  ? brandColors.error || '#EF4444'
                  : item.color || brandColors.primary;
                const isItemLoggingOut = isLoggingOut && item.id === 'nav_logout';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !isLast && {
                        borderBottomColor: colors.borderLight,
                        borderBottomWidth: 1,
                      },
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                    disabled={isItemLoggingOut}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    accessibilityHint={item.accessibilityHint || item.subtitle}
                    accessibilityState={{ disabled: isItemLoggingOut }}
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

                    <View style={styles.itemTextContainer}>
                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color: item.isDanger
                              ? brandColors.error || '#EF4444'
                              : colors.textPrimary,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.itemSub, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {item.subtitle}
                      </Text>
                    </View>

                    {isItemLoggingOut ? (
                      <ActivityIndicator
                        size="small"
                        color={brandColors.error || '#EF4444'}
                      />
                    ) : (
                      <ChevronRightIcon
                        size={18}
                        color={colors.textMuted}
                        strokeWidth={2}
                      />
                    )}
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
    width: '100%',
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  itemTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default MoreMenuScreen;
