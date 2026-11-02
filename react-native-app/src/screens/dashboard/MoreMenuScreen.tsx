import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';

type MoreNavProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
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
          icon: '🏬',
          screen: 'CategoryManager',
        },
        {
          id: 'purchases',
          title: 'Purchases & Inward Orders',
          subtitle: 'Supplier purchase orders and stock receiving',
          icon: '🚚',
          screen: 'PurchaseList',
        },
        {
          id: 'sales',
          title: 'Sales Orders & Invoices',
          subtitle: 'Audit past customer transactions and receipts',
          icon: '🧾',
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
          icon: '👥',
          screen: 'CustomerList',
        },
        {
          id: 'suppliers',
          title: 'Supplier Directory',
          subtitle: 'Vendor contact information & payable accounts',
          icon: '🏢',
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
          icon: '💸',
          screen: 'Finance',
        },
        {
          id: 'reports',
          title: 'Reports & Valuation',
          subtitle: 'Sales analytics, category performance & margins',
          icon: '📈',
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
          icon: '👤',
          screen: 'Profile',
        },
        {
          id: 'settings',
          title: 'Settings & Connectivity',
          subtitle: 'Theme customization & FastAPI server endpoint',
          icon: '⚙️',
          screen: 'Settings',
        },
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: `Currently logged in as ${user?.email || 'Merchant'}`,
          icon: '🚪',
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
                      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
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

                    <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>
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
    borderRadius: 20,
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

