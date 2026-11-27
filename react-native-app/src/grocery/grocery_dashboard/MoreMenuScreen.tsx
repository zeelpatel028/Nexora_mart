import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MoreScreenNavigationProp,
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useAuth } from '../grocery_components/hooks/useAuth';
import { useStore } from '../../navigation/context/StoreContext';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppIcon, { IconName } from '../grocery_components/components/icons/AppIcon';
import AppButton from '../grocery_components/components/common/AppButton';

export type MenuItemTarget =
  | { type: 'tab'; screen: keyof MainTabParamList }
  | { type: 'stack'; screen: keyof RootStackParamList; params?: any }
  | { type: 'modal'; id: 'about' }
  | { type: 'action'; id: 'logout' };

export interface MenuListItem {
  id: string;
  title: string;
  icon: IconName;
  color: string;
  tintBg: string;
  target: MenuItemTarget;
  isDanger?: boolean;
}

export const MoreMenuScreen: React.FC = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { colors, brandColors, isDark, toggleTheme } = useTheme();
  const { logout, store } = useAuth();
  const { storeType } = useStore();
  const insets = useSafeAreaInsets();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const sections: { id: string; title: string; items: MenuListItem[] }[] = [
    {
      id: 'sec_core',
      title: 'Store & Customers',
      items: [
        {
          id: 'home_dash',
          title: 'Home Dashboard',
          icon: 'home',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'tab', screen: 'DashboardTab' },
        },
        {
          id: 'customer',
          title: 'Customer',
          icon: 'customers',
          color: '#2EAD64',
          tintBg: isDark ? '#143624' : '#EAF8F0',
          target: { type: 'tab', screen: 'CustomerTab' },
        },
        {
          id: 'make_bill',
          title: 'Make Bill',
          icon: 'billing',
          color: '#8B5CF6',
          tintBg: isDark ? '#2B1F47' : '#F3EEFF',
          target: { type: 'tab', screen: 'PosTab' },
        },
        {
          id: 'view_bills',
          title: 'Bills & Invoices',
          icon: 'file',
          color: '#8B5CF6',
          tintBg: isDark ? '#2B1F47' : '#F3EEFF',
          target: { type: 'stack', screen: 'SalesList' },
        },
      ],
    },
    {
      id: 'sec_catalog',
      title: 'Products & Suppliers',
      items: [
        {
          id: 'products',
          title: 'Products',
          icon: 'products',
          color: '#2196F3',
          tintBg: isDark ? '#172C45' : '#E3F2FD',
          target: { type: 'tab', screen: 'ProductsTab' },
        },
        {
          id: 'add_product',
          title: 'Add Product',
          icon: 'plus',
          color: '#2196F3',
          tintBg: isDark ? '#172C45' : '#E3F2FD',
          target: { type: 'stack', screen: 'AddProduct' },
        },
        {
          id: 'inventory',
          title: 'Stock Inventory',
          icon: 'inventory',
          color: '#2196F3',
          tintBg: isDark ? '#172C45' : '#E3F2FD',
          target: { type: 'stack', screen: 'Inventory' },
        },
        {
          id: 'supplier_dir',
          title: 'Suppliers',
          icon: 'suppliers',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'stack', screen: 'SupplierList' },
        },
        {
          id: 'purchase_orders',
          title: 'Purchase Orders',
          icon: 'shoppingbag',
          color: '#8B5CF6',
          tintBg: isDark ? '#2B1F47' : '#F3EEFF',
          target: { type: 'stack', screen: 'PurchaseOrder' },
        },
        {
          id: 'purchase_history',
          title: 'Purchase History',
          icon: 'orders',
          color: '#00897B',
          tintBg: isDark ? '#123330' : '#E0F2F1',
          target: { type: 'stack', screen: 'PurchaseList' },
        },
        {
          id: 'create_purchase',
          title: 'Create Purchase',
          icon: 'plus',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'stack', screen: 'CreatePurchase' },
        },
      ],
    },
    {
      id: 'sec_finance',
      title: 'Finance & Reports',
      items: [
        {
          id: 'store_expenses',
          title: 'Store Expenses',
          icon: 'expenses',
          color: '#E53935',
          tintBg: isDark ? '#3B191B' : '#FFEBEE',
          target: { type: 'stack', screen: 'Finance' },
        },
        {
          id: 'sales_reports',
          title: 'Sales Reports',
          icon: 'reports',
          color: '#00897B',
          tintBg: isDark ? '#123330' : '#E0F2F1',
          target: { type: 'stack', screen: 'Reports' },
        },
        {
          id: 'inventory_val',
          title: 'Inventory Valuation',
          icon: 'pie',
          color: '#00897B',
          tintBg: isDark ? '#123330' : '#E0F2F1',
          target: { type: 'stack', screen: 'InventoryValuation' },
        },
      ],
    },
    {
      id: 'sec_store',
      title: 'Store & Settings',
      items: [
        {
          id: 'store_info',
          title: 'Store Information',
          icon: 'user',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'stack', screen: 'Profile' },
        },
        {
          id: 'account_details',
          title: 'Store Account Details',
          icon: 'store',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'stack', screen: 'AccountDetail' },
        },
        {
          id: 'app_settings',
          title: 'App Settings',
          icon: 'settings',
          color: '#64748B',
          tintBg: isDark ? '#232C3D' : '#F1F5F9',
          target: { type: 'stack', screen: 'Settings' },
        },
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          icon: 'shield',
          color: '#00897B',
          tintBg: isDark ? '#123330' : '#E0F2F1',
          target: { type: 'stack', screen: 'PrivacyPolicy' },
        },
        {
          id: 'about_tulsi',
          title: 'About Tulsi Mart',
          icon: 'file',
          color: '#F57C00',
          tintBg: isDark ? '#3D240E' : '#FFF3E0',
          target: { type: 'modal', id: 'about' },
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: 'logout',
          color: '#E53935',
          tintBg: isDark ? '#3B191B' : '#FFEBEE',
          target: { type: 'action', id: 'logout' },
          isDanger: true,
        },
      ],
    },
  ];

  const handleLogout = () => {
    if (isLoggingOut) return;
    Alert.alert('Logout', 'Are you sure you want to log out of your Tulsi Mart account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (error: any) {
            Alert.alert('Logout Failed', error?.message || 'Unable to log out right now.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handlePress = (item: MenuListItem) => {
    if (item.target.type === 'action' && item.target.id === 'logout') {
      handleLogout();
      return;
    }
    if (item.target.type === 'modal' && item.target.id === 'about') {
      setShowAbout(true);
      return;
    }
    if (item.target.type === 'tab') {
      navigation.navigate(item.target.screen);
      return;
    }
    if (item.target.type === 'stack') {
      navigation.navigate(item.target.screen as any, item.target.params);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="More"
        rightAction={
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#FFF3E0' },
            ]}
            activeOpacity={0.75}
          >
            <AppIcon
              name={isDark ? 'sun' : 'moon'}
              size={18}
              color={brandColors.primaryOrange}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 28 + insets.bottom }]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AccountDetail')}
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.storeLogoWrap, { backgroundColor: isDark ? '#3D240E' : '#FFF3E0' }]}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.storeLogoImg}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {store?.name || 'Tulsi Mart Store'}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.badgeOrangeBg }]}>
              <Text style={[styles.typeBadgeText, { color: colors.badgeOrangeText }]}>
                {storeType.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <AppIcon name="right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {sections.map((section) => (
          <View key={section.id} style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() => handlePress(item)}
                    style={[
                      styles.itemRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                    ]}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: item.tintBg }]}>
                      <AppIcon name={item.icon} size={19} color={item.color} />
                    </View>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: item.isDanger ? brandColors.error : colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <AppIcon name="right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAbout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.aboutLogoCircle, { backgroundColor: '#FFF3E0' }]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 42, height: 42 }}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.aboutTitle, { color: brandColors.primaryOrange }]}>Tulsi Mart</Text>
            <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.aboutBody, { color: colors.textPrimary }]}>
              All-in-one store management for billing, customers, products, suppliers, expenses, and sales reports.
            </Text>
            <AppButton title="Close" onPress={() => setShowAbout(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeLogoWrap: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLogoImg: { width: 32, height: 32 },
  storeName: { fontSize: 16.5, fontWeight: '800' },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  sectionWrap: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  aboutCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  aboutLogoCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutTitle: { fontSize: 22, fontWeight: '900' },
  aboutVersion: { fontSize: 12, fontWeight: '600', marginTop: 3, marginBottom: 12 },
  aboutBody: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
});

export default MoreMenuScreen;
