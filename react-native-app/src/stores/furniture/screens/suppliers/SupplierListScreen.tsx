import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '../../hooks/useFocusEffect';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../../../navigation/context/SettingsContext';
import supplierApi from '../../services/supplierApi';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppIcon from '../../components/icons/AppIcon';
import SupplierCardSkeleton from '../../components/skeletons/SupplierCardSkeleton';
import { formatCurrency } from '../../utils/formatters';

type SupplierNavProp = NativeStackNavigationProp<RootStackParamList>;

export const SupplierListScreen: React.FC = () => {
  const navigation = useNavigation<SupplierNavProp>();
  const route = useRoute<any>();
  const { colors, brandColors, isDark } = useTheme();
  const { currency, currencySymbol } = useSettings();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<{
    total_suppliers: number;
    pending_orders: number;
    pending_payments: number;
    total_purchases: number;
  }>({
    total_suppliers: 0,
    pending_orders: 0,
    pending_payments: 0,
    total_purchases: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Supplier Modal
  const [showAddModal, setShowAddModal] = useState(
    route.name === 'AddSupplier' || Boolean(route.params?.openAdd)
  );

  useEffect(() => {
    if (route.name === 'AddSupplier' || route.params?.openAdd) {
      setShowAddModal(true);
    }
  }, [route.name, route.params?.openAdd]);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dash, list] = await Promise.all([
        supplierApi.getDashboardMetrics().catch(() => null),
        supplierApi.listSuppliers({ search: search.trim() || undefined, limit: 100 }).catch(() => null),
      ]);

      if (dash) {
        setMetrics({
          total_suppliers: dash.total_suppliers ?? 0,
          pending_orders: dash.pending_orders ?? 0,
          pending_payments: dash.pending_payments ?? dash.total_payable_balance ?? 0,
          total_purchases: dash.total_purchases ?? 0,
        });
      }

      const suppList = list?.suppliers || list || [];
      setSuppliers(suppList);
    } catch (err) {
      console.warn('Failed to load supplier data:', err);
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

  const handleAddSupplier = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter contact person name.');
      return;
    }
    setSubmitting(true);
    try {
      await supplierApi.createSupplier({
        name: name.trim(),
        company_name: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        gst_number: gstNumber.trim() || undefined,
      });

      setShowAddModal(false);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstNumber('');
      Alert.alert('Success', 'Supplier registered successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || err.message || 'Failed to add supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSupplierItem = ({ item }: { item: any }) => {
    const balance = Number(item.balance ?? item.payable_balance ?? 0);
    const hasPayable = balance > 0;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          (navigation as any).navigate('SupplierDetail', {
            supplierId: item.id,
            supplierName: item.company_name || item.name,
          })
        }
      >
        <AppCard style={styles.supplierCard}>
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
              <AppIcon name="Truck" size={20} color={brandColors.primaryOrange} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.companyName, { color: colors.textPrimary }]}>{item.company_name || item.name}</Text>
              {item.company_name && item.name ? (
                <Text style={[styles.contactName, { color: colors.textSecondary }]}>Contact: {item.name}</Text>
              ) : null}
              {item.phone ? (
                <View style={styles.phoneRow}>
                  <AppIcon name="Phone" size={12} color={colors.textSecondary} />
                  <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{item.phone}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Payable Balance</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  hasPayable ? styles.balancePending : styles.balanceZero,
                ]}
              >
                {formatCurrency(balance, currency)}
              </Text>
            </View>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
            <View style={styles.ordersTag}>
              <AppIcon name="Package" size={12} color={colors.textSecondary} />
              <Text style={[styles.ordersText, { color: colors.textSecondary }]}>
                {item.total_orders ?? item.orders_count ?? 0} Orders
              </Text>
            </View>
            <View style={styles.viewDetailRow}>
              <Text style={[styles.viewDetailText, { color: brandColors.primaryOrange }]}>Supplier Ledger</Text>
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
        title="Suppliers & Vendors"
        showBack
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
        {/* 1. Dashboard Metrics Summary Bar */}
        <View
          style={[
            styles.summaryBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder },
          ]}
        >
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>SUPPLIERS</Text>
            <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{metrics.total_suppliers}</Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>Active</Text>
          </View>

          <View
            style={[
              styles.summaryBox,
              styles.summaryBoxMiddle,
              { borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>PENDING ORDERS</Text>
            <Text style={[styles.summaryVal, { color: brandColors.primaryOrange }]}>
              {metrics.pending_orders}
            </Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>Awaiting</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: '#DC2626' }]}>PAYABLE</Text>
            <Text style={[styles.summaryVal, { color: '#DC2626' }]}>
              {formatCurrency(metrics.pending_payments, currency)}
            </Text>
            <Text style={[styles.summarySub, { color: colors.textMuted }]}>To Pay</Text>
          </View>
        </View>

        {/* 2. Search Bar */}
        <View style={styles.searchWrap}>
          <AppInput
            placeholder="Search supplier by name, company, or phone..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<AppIcon name="Search" size={16} color={colors.textMuted} />}
          />
        </View>

        {/* 3. Supplier List */}
        {loading && !refreshing ? (
          <View style={{ paddingHorizontal: 16 }}>
            <SupplierCardSkeleton />
            <SupplierCardSkeleton />
            <SupplierCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={suppliers}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderSupplierItem}
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
                <AppIcon name="Truck" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Suppliers Registered</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Add vendors to create purchase orders and manage payables.
                </Text>
                <AppButton
                  title="+ Add Supplier"
                  onPress={() => setShowAddModal(true)}
                  style={{ marginTop: 16 }}
                />
              </View>
            }
          />
        )}
      </View>

      {/* Add Supplier Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Supplier</Text>
            <AppInput
              label="Contact Person Name *"
              placeholder="e.g. Bharat Kumar"
              value={name}
              onChangeText={setName}
            />
            <AppInput
              label="Company / Firm Name"
              placeholder="e.g. Shree Radhe Traders"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <AppInput
              label="Phone Number"
              placeholder="e.g. 9825123456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <AppInput
              label="Email Address"
              placeholder="e.g. contact@radhetraders.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <AppInput
              label="GST Number"
              placeholder="e.g. 24ABCDE1234F1Z5"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
            />
            <AppInput
              label="Address / City"
              placeholder="e.g. APMC Market, Unjha"
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Save Supplier"
                onPress={handleAddSupplier}
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
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
  supplierCard: {
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
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  contactName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
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
  ordersTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ordersText: {
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

export default SupplierListScreen;
