import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../../../navigation/context/SettingsContext';
import supplierApi from '../../services/supplierApi';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppDropdown from '../../components/common/AppDropdown';
import AppIcon from '../../components/icons/AppIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PAYMENT_METHODS = [
  { label: 'Bank Transfer (IMPS/NEFT/RTGS)', value: 'BANK_TRANSFER' },
  { label: 'UPI / QR', value: 'UPI' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Cheque', value: 'CHEQUE' },
];

export const SupplierDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const supplierId = route.params?.supplierId;
  const initialName = route.params?.supplierName;

  const { colors, brandColors, isDark } = useTheme();
  const { currency, currencySymbol } = useSettings();

  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  // Pay Supplier Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!supplierId) return;
    try {
      const data = await supplierApi.getSupplierDetails(supplierId);
      setDetails(data);
    } catch (err: any) {
      console.warn('Failed to load supplier details:', err);
      Alert.alert('Notice', 'Unable to fetch supplier records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDetails();
  };

  const handleCall = () => {
    const phone = details?.supplier?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone', 'Supplier phone number not available.');
    }
  };

  const handleShareStatement = async () => {
    if (!details) return;
    const supp = details.supplier;
    const summ = details.summary || {};
    const orders = details.orders || [];

    let text = `*TULSI MART - SUPPLIER ACCOUNT STATEMENT*\n`;
    text += `Supplier: ${supp.company_name || supp.name}\n`;
    if (supp.phone) text += `Phone: ${supp.phone}\n`;
    if (supp.gst_number) text += `GSTIN: ${supp.gst_number}\n`;
    text += `Date: ${formatDate(new Date().toISOString())}\n`;
    text += `--------------------------------\n`;
    text += `Total Orders: ${summ.total_orders ?? orders.length}\n`;
    text += `Total Purchases: ${formatCurrency(summ.total_purchases ?? 0, currency)}\n`;
    text += `Total Paid: ${formatCurrency(summ.total_paid ?? 0, currency)}\n`;
    text += `*OUTSTANDING PAYABLE: ${formatCurrency(summ.payable_balance ?? supp.balance ?? 0, currency)}*\n`;
    text += `--------------------------------\n`;
    text += `Recent Purchase Orders:\n`;
    orders.slice(0, 10).forEach((ord: any, idx: number) => {
      text += `${idx + 1}. ${ord.order_number} (${formatDate(ord.created_at || '')}): Total ${formatCurrency(ord.total_amount, currency)} | Status: ${ord.order_status}\n`;
    });
    text += `\nTulsi Mart Store Management`;

    try {
      await Share.share({
        message: text,
        title: `Statement for ${supp.company_name || supp.name}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handlePaySupplier = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    setSubmittingPayment(true);
    try {
      await supplierApi.paySupplier(supplierId, {
        amount: amt,
        payment_method: payMethod,
        notes: payNotes.trim() || undefined,
      });

      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      Alert.alert('Success', `Recorded payment of ${formatCurrency(amt, currency)} to supplier.`);
      loadDetails();
    } catch (err: any) {
      Alert.alert('Payment Error', err.response?.data?.detail || err.message || 'Failed to record supplier payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader title={initialName || 'Supplier Details'} showBack />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={brandColors.primaryOrange} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading supplier ledger...</Text>
        </View>
      </View>
    );
  }

  const supp = details?.supplier || { name: initialName || 'Supplier', balance: 0 };
  const summ = details?.summary || {
    total_orders: 0,
    total_purchases: 0,
    total_paid: 0,
    payable_balance: supp.balance || 0,
  };
  const orders = details?.orders || [];
  const payments = details?.payments || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={supp.company_name || supp.name}
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShareStatement} style={styles.shareBtn}>
            <AppIcon name="Share2" size={18} color={brandColors.primaryOrange} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brandColors.primaryOrange]} />
        }
      >
        {/* 1. Supplier Profile Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange,
                  borderColor: isDark ? brandColors.darkOrange : '#FFE0B2',
                },
              ]}
            >
              <AppIcon name="Truck" size={24} color={brandColors.primaryOrange} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.suppName, { color: colors.textPrimary }]}>{supp.company_name || supp.name}</Text>
              {supp.company_name && supp.name ? (
                <Text style={[styles.suppContact, { color: colors.textSecondary }]}>Contact Person: {supp.name}</Text>
              ) : null}
              {supp.phone ? (
                <TouchableOpacity onPress={handleCall} style={styles.phoneClickRow}>
                  <AppIcon name="Phone" size={13} color={brandColors.primaryOrange} />
                  <Text style={[styles.phoneClickText, { color: brandColors.primaryOrange }]}>{supp.phone}</Text>
                </TouchableOpacity>
              ) : null}
              {supp.gst_number ? (
                <Text style={[styles.gstText, { color: colors.textSecondary }]}>GSTIN: {supp.gst_number}</Text>
              ) : null}
              {supp.address ? (
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{supp.address}</Text>
              ) : null}
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={[styles.quickActionsRow, { borderTopColor: colors.borderLight }]}>
            {supp.phone && (
              <AppButton
                title="Call"
                variant="outline"
                onPress={handleCall}
                style={{ flex: 1, marginRight: 8 }}
              />
            )}
            <AppButton
              title="Pay Supplier"
              onPress={() => {
                setPayAmount(String(summ.payable_balance || supp.balance || ''));
                setShowPayModal(true);
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Statement"
              variant="outline"
              onPress={handleShareStatement}
              style={{ flex: 1 }}
            />
          </View>
        </AppCard>

        {/* 2. Summary Metrics */}
        <View style={styles.metricsGrid}>
          <AppCard style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL ORDERS</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{summ.total_orders ?? orders.length}</Text>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL PURCHASES</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {formatCurrency(summ.total_purchases, currency)}
            </Text>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL PAID</Text>
            <Text style={[styles.metricValue, { color: '#16A34A' }]}>
              {formatCurrency(summ.total_paid, currency)}
            </Text>
          </AppCard>

          <AppCard style={[styles.metricCard, { borderLeftWidth: 3, borderLeftColor: '#DC2626' }]}>
            <Text style={[styles.metricLabel, { color: '#DC2626' }]}>PAYABLE BALANCE</Text>
            <Text style={[styles.metricValue, { color: '#DC2626' }]}>
              {formatCurrency(summ.payable_balance ?? supp.balance ?? 0, currency)}
            </Text>
          </AppCard>
        </View>

        {/* 3. Section Tabs: Orders vs Payments */}
        <View style={[styles.filterTabs, { backgroundColor: colors.surfaceSubtle }]}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'orders' && [styles.filterTabActive, { backgroundColor: colors.surface }]]}
            onPress={() => setActiveTab('orders')}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: colors.textSecondary },
                activeTab === 'orders' && [styles.filterTabTextActive, { color: brandColors.primaryOrange }],
              ]}
            >
              Purchase Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'payments' && [styles.filterTabActive, { backgroundColor: colors.surface }]]}
            onPress={() => setActiveTab('payments')}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: colors.textSecondary },
                activeTab === 'payments' && [styles.filterTabTextActive, { color: brandColors.primaryOrange }],
              ]}
            >
              Payment History ({payments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Tab Content */}
        {activeTab === 'orders' ? (
          orders.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <AppIcon name="Package" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No purchase orders for this supplier.</Text>
            </View>
          ) : (
            orders.map((ord: any) => (
              <AppCard key={ord.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={[styles.itemNumber, { color: colors.textPrimary }]}>{ord.order_number || `ORD-${ord.id}`}</Text>
                    <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{formatDate(ord.created_at || '')}</Text>
                  </View>
                  <View style={[styles.badge, ord.order_status === 'RECEIVED' ? styles.badgeGreen : styles.badgeAmber]}>
                    <Text style={[styles.badgeText, ord.order_status === 'RECEIVED' ? styles.badgeTextGreen : styles.badgeTextAmber]}>
                      {ord.order_status}
                    </Text>
                  </View>
                </View>
                <View style={[styles.itemFooter, { borderTopColor: colors.borderLight }]}>
                  <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                    Total: {formatCurrency(ord.total_amount, currency)}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Payment: {ord.payment_status || 'PENDING'}
                  </Text>
                </View>
              </AppCard>
            ))
          )
        ) : (
          payments.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <AppIcon name="CreditCard" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No payment records found.</Text>
            </View>
          ) : (
            payments.map((pmt: any) => (
              <AppCard key={pmt.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={[styles.itemNumber, { color: colors.textPrimary }]}>Paid: {formatCurrency(pmt.amount, currency)}</Text>
                    <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{formatDate(pmt.created_at || pmt.payment_date || '')}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                      {pmt.payment_method || 'BANK'}
                    </Text>
                  </View>
                </View>
                {pmt.notes ? (
                  <Text style={[styles.pmtNotes, { color: colors.textSecondary }]}>Ref: {pmt.notes}</Text>
                ) : null}
              </AppCard>
            ))
          )
        )}
      </ScrollView>

      {/* Pay Supplier Modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Record Supplier Payment</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Paying {supp.company_name || supp.name} will be debited from payable balance.
            </Text>

            <View style={styles.balanceReminderBox}>
              <Text style={styles.balanceReminderLabel}>Payable Balance:</Text>
              <Text style={styles.balanceReminderVal}>
                {formatCurrency(summ.payable_balance ?? supp.balance ?? 0, currency)}
              </Text>
            </View>

            <AppInput
              label={`Amount to Pay (${currencySymbol}) *`}
              placeholder="0.00"
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="decimal-pad"
            />

            <AppDropdown
              label="Payment Method"
              options={PAYMENT_METHODS}
              selectedValue={payMethod}
              onSelect={setPayMethod}
            />

            <AppInput
              label="Notes / Transaction Ref (Optional)"
              placeholder="e.g. UTR 412356789 via HDFC Bank"
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowPayModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Confirm Payment"
                onPress={handlePaySupplier}
                loading={submittingPayment}
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  shareBtn: {
    padding: 6,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suppName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },
  suppContact: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  phoneClickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  phoneClickText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F57C00',
  },
  gstText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#F57C00',
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  itemCard: {
    marginBottom: 10,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextGreen: {
    color: '#166534',
  },
  badgeTextAmber: {
    color: '#B45309',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
    paddingTop: 8,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 12,
    color: '#64748B',
  },
  pmtNotes: {
    fontSize: 12,
    color: '#64748B',
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
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  balanceReminderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  balanceReminderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
  balanceReminderVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default SupplierDetailScreen;
