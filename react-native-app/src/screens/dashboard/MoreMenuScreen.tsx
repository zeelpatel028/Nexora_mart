import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import {
  GridIcon,
  TruckIcon,
  ReceiptIcon,
  UsersIcon,
  BuildingIcon,
  CreditCardIcon,
  ChartColumnIcon,
  CircleUserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
} from '../../components/branding/Icons';

type MoreNavProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconRenderer: (color: string) => React.ReactNode;
  screen?: keyof RootStackParamList;
  isDanger?: boolean;
}

export const MoreMenuScreen: React.FC = () => {
  const navigation = useNavigation<MoreNavProp>();
  const { colors, brandColors } = useTheme();
  const { logout, user } = useAuth();

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Store Operations',
      items: [
        {
          id: 'categories',
          title: 'Category Setup & Architecture',
          subtitle: 'Multi-category retail ERP configuration',
          iconRenderer: (c) => <GridIcon size={20} color={c} />,
          screen: 'CategoryManager',
        },
        {
          id: 'purchases',
          title: 'Purchases & Inward Orders',
          subtitle: 'Supplier purchase orders and stock receiving',
          iconRenderer: (c) => <TruckIcon size={20} color={c} />,
          screen: 'PurchaseList',
        },
        {
          id: 'sales',
          title: 'Sales Orders & Invoices',
          subtitle: 'Audit past customer transactions and receipts',
          iconRenderer: (c) => <ReceiptIcon size={20} color={c} />,
          screen: 'SalesList',
        },
      ],
    },
    {
      title: 'Partners & CRM',
      items: [
        {
          id: 'customers',
          title: 'Customer Directory',
          subtitle: 'Customer loyalty, addresses & credit balances',
          iconRenderer: (c) => <UsersIcon size={20} color={c} />,
          screen: 'CustomerList',
        },
        {
          id: 'suppliers',
          title: 'Supplier Directory',
          subtitle: 'Vendor contact information & payable accounts',
          iconRenderer: (c) => <BuildingIcon size={20} color={c} />,
          screen: 'SupplierList',
        },
      ],
    },
    {
      title: 'Finance & Analytics',
      items: [
        {
          id: 'finance',
          title: 'Expenses & Payments',
          subtitle: 'Record store operating expenses & audit cash flow',
          iconRenderer: (c) => <CreditCardIcon size={20} color={c} />,
          screen: 'Finance',
        },
        {
          id: 'reports',
          title: 'Reports & Valuation',
          subtitle: 'Sales analytics, category performance & margins',
          iconRenderer: (c) => <ChartColumnIcon size={20} color={c} />,
          screen: 'Reports',
        },
      ],
    },
    {
      title: 'Account & Device',
      items: [
        {
          id: 'profile',
          title: 'Merchant Profile',
          subtitle: 'Store owner credentials & business address',
          iconRenderer: (c) => <CircleUserIcon size={20} color={c} />,
          screen: 'Profile',
        },
        {
          id: 'settings',
          title: 'Settings & Connectivity',
          subtitle: 'Theme customization & FastAPI server endpoint',
          iconRenderer: (c) => <SettingsIcon size={20} color={c} />,
          screen: 'Settings',
        },
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: `Currently logged in as ${user?.email || 'Merchant'}`,
          iconRenderer: (c) => <LogOutIcon size={20} color={c} />,
          isDanger: true,
        },
      ],
    },
  ];

  const handlePress = (item: MenuItem) => {
    if (item.id === 'logout') {
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
    } else if (item.screen) {
      navigation.navigate(item.screen as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="More Operations" subtitle="All Nexora Mart business modules" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              {section.title}
            </Text>

            <Card style={styles.cardBox}>
              {section.items.map((item, iIdx) => {
                const isLast = iIdx === section.items.length - 1;
                const iconColor = item.isDanger ? brandColors.error : brandColors.primary;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !isLast && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                    ]}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: item.isDanger
                            ? brandColors.errorLight
                            : brandColors.primaryLight,
                        },
                      ]}
                    >
                      {item.iconRenderer(iconColor)}
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text
                        style={[
                          styles.itemTitle,
                          { color: item.isDanger ? brandColors.error : colors.textPrimary },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <ChevronRightIcon size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardBox: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default MoreMenuScreen;
