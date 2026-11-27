import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '../grocery_components/hooks/useFocusEffect';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useSettings } from '../../navigation/context/SettingsContext';
import customerApi from '../grocery_components/services/customerApi';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import AppButton from '../grocery_components/components/common/AppButton';
import AppInput from '../grocery_components/components/common/AppInput';
import AppIcon from '../grocery_components/components/icons/AppIcon';
import CustomerCardSkeleton from '../grocery_components/components/skeletons/CustomerCardSkeleton';
import { formatCurrency } from '../grocery_components/utils/formatters';

type KhataNavProp = NativeStackNavigationProp<RootStackParamList>;

export const KhataScreen: React.FC = () => {
  const navigation = useNavigation<KhataNavProp>();
  const route = useRoute<any>();
  const isTabScreen = route.name === 'CustomerTab';
  const { colors, brandColors, isDark } = useTheme();
  const { currency, currencySymbol } = useSettings();

  const [customers, setCustomers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<{
    total_customers: number;
    total_pending_bills: number;
    total_pending_amount: number;
  }>({
    total_customers: 0,
    total_pending_bills: 0,
    total_pending_amount: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (route.params?.openAdd) {
      setShowAddModal(true);
      (navigation as any).setParams?.({ openAdd: undefined });
    }
  }, [route.params?.openAdd, navigation]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dash, list] = await Promise.all([
        customerApi.getDashboardMetrics().catch(() => null),
        customerApi.listCustomers({ search: search.trim() || undefined, limit: 100 }).catch(() => null),
      ]);

      if (dash) {
        setMetrics({
          total_customers: dash.total_customers ?? 0,
          total_pending_bills: dash.total_pending_bills ?? 0,
          total_pending_amount: dash.total_pending_amount ?? 0,
        });
      }

      const custList = list?.customers || list || [];
      setCustomers(custList);
    } catch (err) {
      console.warn('Failed to load Khata data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter customer name.');
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
      });

      setShowAddModal(false);
      setName('');
      setPhone('');
      setAddress('');
      setCreditLimit('');
      Alert.alert('Success', 'Khata Customer added successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Failed to add customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCustomerItem = ({ item }: { item: any }) => {
    const balance = Number(item.balance ?? item.outstanding_balance ?? 0);
    const hasPending = balance > 0;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('CustomerDetail', {
            customerId: item.id,
            customerName: item.name,
          })
        }
      >
        <AppCard style={styles.customerCard}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.avatarBox,
                {
                  backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange,
                  borderColor: isDark ? brandColors.darkOrange : '#FFE0B2',
                },
              ]}
            >
              <AppIcon name="Users" size={20} color={brandColors.primaryOrange} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.name}</Text>
              {item.phone ? (
                <View style={styles.phoneRow}>
                  <AppIcon name="Phone" size={12} color={colors.textSecondary} />
                  <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{item.phone}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Pending Khata</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  hasPending ? styles.balancePending : styles.balanceZero,
                ]}
              >
                {formatCurrency(balance, currency)}
              </Text>
            </View>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
            <View style={styles.billCountTag}>
              <AppIcon name="Receipt" size={12} color={colors.textSecondary} />
              <Text style={[styles.billCountText, { color: colors.textSecondary }]}>
                {item.total_bills ?? item.bills_count ?? 0} Bills
              </Text>
            </View>
            <View style={styles.viewDetailRow}>
              <Text style={[styles.viewDetailText, { color: brandColors.primaryOrange }]}>View Ledger</Text>
              <AppIcon name="ChevronRight" size={14} color={brandColors.primaryOrange} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Customer"
        showBack={!isTabScreen}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={[styles.headerAddBtn, { backgroundColor: brandColors.primaryOrange }]}
          >
            <AppIcon name="Plus" size={18} color="#FFFFFF" />
            <Text style={styles.headerAddBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* 1. Dashboard Summary Cards */}
        <View
          style={[
            styles.summaryBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder },
          ]}
        >
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>TOTAL KHATA</Text>
            <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{metrics.total_customers}</Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>Customers</Text>
          </View>

          <View
            style={[
              styles.summaryBox,
              styles.summaryBoxMiddle,
              { borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>PENDING BILLS</Text>
            <Text style={[styles.summaryVal, { color: brandColors.primaryOrange }]}>
              {metrics.total_pending_bills}
            </Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>Unsettled</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: '#DC2626' }]}>TO RECEIVE</Text>
            <Text style={[styles.summaryVal, { color: '#DC2626' }]}>
              {formatCurrency(metrics.total_pending_amount, currency)}
            </Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>Outstanding</Text>
          </View>
        </View>

        {/* 2. Search Bar */}
        <View style={styles.searchWrap}>
          <AppInput
            placeholder="Search customer by name or phone..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<AppIcon name="Search" size={16} color={colors.textMuted} />}
          />
        </View>

        {/* 3. Customer List */}
        {loading && !refreshing ? (
          <View style={{ paddingHorizontal: 16 }}>
            <CustomerCardSkeleton />
            <CustomerCardSkeleton />
            <CustomerCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCustomerItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews={true}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[brandColors.primaryOrange]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <AppIcon name="Users" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Khata Customers Found</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Add regular customers to give credit and track ledger.
                </Text>
                <AppButton
                  title="+ Add Khata Customer"
                  onPress={() => setShowAddModal(true)}
                  style={{ marginTop: 16 }}
                />
              </View>
            }
          />
        )}
      </View>

      {/* Add Customer Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Khata Customer</Text>
            <AppInput
              label="Customer Full Name *"
              placeholder="e.g. Ramesh Bhai Shah"
              value={name}
              onChangeText={setName}
            />
            <AppInput
              label="Phone Number"
              placeholder="e.g. 9825123456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <AppInput
              label="Address / Area"
              placeholder="e.g. Sector 21, Gandhinagar"
              value={address}
              onChangeText={setAddress}
            />
            <AppInput
              label={`Credit Limit (${currencySymbol})`}
              placeholder="e.g. 10000"
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Save Customer"
                onPress={handleAddCustomer}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F57C00',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  customerCard: {
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#64748B',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  balancePending: {
    color: '#DC2626',
  },
  balanceZero: {
    color: '#16A34A',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 8,
  },
  billCountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57C00',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default KhataScreen;
