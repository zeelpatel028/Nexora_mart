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
import customerApi from '../../services/customerApi';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppDropdown from '../../components/common/AppDropdown';
import AppIcon from '../../components/icons/AppIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';

type CustomerDetailNavProp = NativeStackNavigationProp<RootStackParamList>;
type CustomerDetailRouteProp = RouteProp<RootStackParamList, 'CustomerDetail'>;

type BillFilter = 'ALL' | 'PAID' | 'UNPAID' | 'PARTIAL';

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI / QR', value: 'UPI' },
  { label: 'Bank Transfer (IMPS/NEFT)', value: 'BANK_TRANSFER' },
  { label: 'Cheque', value: 'CHEQUE' },
];

export const CustomerDetailScreen: React.FC = () => {
  const navigation = useNavigation<CustomerDetailNavProp>();
  const route = useRoute<CustomerDetailRouteProp>();
  const { customerId, customerName: initialName } = route.params;

  const { colors, isDark } = useTheme();
  const { currency, currencySymbol } = useSettings();

  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billFilter, setBillFilter] = useState<BillFilter>('ALL');

  // Receive Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const data = await customerApi.getCustomerDetails(customerId, billFilter);
      setDetails(data);
    } catch (err: any) {
      console.warn('Failed to load customer details:', err);
      Alert.alert('Notice', 'Unable to load customer ledger details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId, billFilter]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDetails();
  };

  const handleCall = () => {
    const phone = details?.customer?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone', 'Customer phone number not available.');
    }
  };

  const handleShareStatement = async () => {
    if (!details) return;
    const cust = details.customer;
    const summ = details.summary || {};
    const bills = details.bills || [];

    let text = `*TULSI MART - CUSTOMER STATEMENT*\n`;
    text += `Customer: ${cust.name}\n`;
    if (cust.phone) text += `Phone: ${cust.phone}\n`;
    text += `Date: ${formatDate(new Date().toISOString())}\n`;
    text += `--------------------------------\n`;
    text += `Total Bills: ${summ.total_bills ?? bills.length}\n`;
    text += `Total Billed: ${formatCurrency(summ.total_billed ?? 0, currency)}\n`;
    text += `Total Paid: ${formatCurrency(summ.total_paid ?? 0, currency)}\n`;
    text += `*OUTSTANDING BALANCE: ${formatCurrency(summ.total_pending ?? cust.balance ?? 0, currency)}*\n`;
    text += `--------------------------------\n`;
    text += `Recent Invoices:\n`;
    bills.slice(0, 10).forEach((b: any, idx: number) => {
      text += `${idx + 1}. ${b.invoice_number} (${formatDate(b.created_at || b.invoice_date || '')}): Total ${formatCurrency(b.total_amount, currency)} | Paid ${formatCurrency(b.paid_amount, currency)} | Due ${formatCurrency(b.remaining_amount, currency)} [${b.payment_status}]\n`;
    });
    text += `--------------------------------\n`;
    text += `Please settle the pending balance at your earliest convenience.\nTulsi Mart Store Management`;

    try {
      await Share.share({
        message: text,
        title: `Statement for ${cust.name}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleReceivePayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    setSubmittingPayment(true);
    try {
      await customerApi.receivePayment(customerId, {
        amount: amt,
        payment_method: payMethod,
        notes: payNotes.trim() || undefined,
      });

      setShowPaymentModal(false);
      setPayAmount('');
      setPayNotes('');
      Alert.alert('Success', `Received ${formatCurrency(amt, currency)} from customer.`);
      loadDetails();
    } catch (err: any) {
      Alert.alert('Payment Error', err.response?.data?.detail || err.message || 'Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader title={initialName || 'Customer Ledger'} showBack />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F57C00" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading customer records...</Text>
        </View>
      </View>
    );
  }

  const cust = details?.customer || { name: initialName || 'Customer', balance: 0 };
  const summ = details?.summary || {
    total_bills: 0,
    total_billed: 0,
    total_paid: 0,
    total_pending: cust.balance || 0,
  };
  const bills = details?.bills || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title={cust.name}
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShareStatement} style={styles.shareBtn}>
            <AppIcon name="Share2" size={18} color="#F57C00" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F57C00']} />
        }
      >
        {/* 1. Customer Profile Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <AppIcon name="Users" size={24} color="#F57C00" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.custName}>{cust.name}</Text>
              {cust.phone ? (
                <TouchableOpacity onPress={handleCall} style={styles.phoneClickRow}>
                  <AppIcon name="Phone" size={13} color="#F57C00" />
                  <Text style={styles.phoneClickText}>{cust.phone}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noPhoneText}>No phone provided</Text>
              )}
              {cust.address ? (
                <Text style={styles.addressText}>{cust.address}</Text>
              ) : null}
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            {cust.phone && (
              <AppButton
                title="Call"
                variant="outline"
                onPress={handleCall}
                style={{ flex: 1, marginRight: 8 }}
              />
            )}
            <AppButton
              title="Receive Payment"
              onPress={() => {
                setPayAmount(String(summ.total_pending || cust.balance || ''));
                setShowPaymentModal(true);
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
            <Text style={styles.metricLabel}>TOTAL BILLS</Text>
            <Text style={styles.metricValue}>{summ.total_bills ?? bills.length}</Text>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <Text style={styles.metricLabel}>TOTAL BILLED</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(summ.total_billed, currency)}
            </Text>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <Text style={styles.metricLabel}>TOTAL PAID</Text>
            <Text style={[styles.metricValue, { color: '#16A34A' }]}>
              {formatCurrency(summ.total_paid, currency)}
            </Text>
          </AppCard>

          <AppCard style={[styles.metricCard, { borderLeftWidth: 3, borderLeftColor: '#DC2626' }]}>
            <Text style={[styles.metricLabel, { color: '#DC2626' }]}>PENDING AMOUNT</Text>
            <Text style={[styles.metricValue, { color: '#DC2626' }]}>
              {formatCurrency(summ.total_pending ?? cust.balance ?? 0, currency)}
            </Text>
          </AppCard>
        </View>

        {/* 3. Bill Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['ALL', 'UNPAID', 'PARTIAL', 'PAID'] as BillFilter[]).map((tab) => {
            const active = billFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setBillFilter(tab)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {tab === 'ALL'
                    ? 'All Bills'
                    : tab === 'UNPAID'
                    ? 'Unpaid'
                    : tab === 'PARTIAL'
                    ? 'Partial'
                    : 'Paid'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Bills List */}
        <Text style={styles.sectionTitle}>Invoices & Bills ({bills.length})</Text>

        {bills.length === 0 ? (
          <View style={styles.emptyBox}>
            <AppIcon name="Receipt" size={36} color="#CBD5E1" />
            <Text style={styles.emptyText}>No bills found in this filter.</Text>
          </View>
        ) : (
          bills.map((bill: any) => {
            const status = bill.payment_status || 'PAID';
            return (
              <TouchableOpacity
                key={bill.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SaleDetail', { saleId: bill.id })}
              >
                <AppCard style={styles.billCard}>
                  <View style={styles.billHeader}>
                    <View>
                      <Text style={styles.billNumber}>{bill.invoice_number || `INV-${bill.id}`}</Text>
                      <Text style={styles.billDate}>
                        {formatDate(bill.created_at || bill.invoice_date || '')}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        status === 'PAID'
                          ? styles.statusPaid
                          : status === 'PARTIAL'
                          ? styles.statusPartial
                          : styles.statusUnpaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          status === 'PAID'
                            ? styles.statusTextPaid
                            : status === 'PARTIAL'
                            ? styles.statusTextPartial
                            : styles.statusTextUnpaid,
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billBody}>
                    <View style={styles.billMetaCol}>
                      <Text style={styles.metaLabel}>Bill Amount</Text>
                      <Text style={styles.metaVal}>{formatCurrency(bill.total_amount, currency)}</Text>
                    </View>
                    <View style={styles.billMetaCol}>
                      <Text style={styles.metaLabel}>Paid Amount</Text>
                      <Text style={[styles.metaVal, { color: '#16A34A' }]}>
                        {formatCurrency(bill.paid_amount, currency)}
                      </Text>
                    </View>
                    <View style={[styles.billMetaCol, { alignItems: 'flex-end' }]}>
                      <Text style={styles.metaLabel}>Pending Due</Text>
                      <Text
                        style={[
                          styles.metaVal,
                          Number(bill.remaining_amount || 0) > 0 && { color: '#DC2626' },
                        ]}
                      >
                        {formatCurrency(bill.remaining_amount || 0, currency)}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Receive Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Receive Customer Payment</Text>
            <Text style={styles.modalSub}>
              Receiving payment from {cust.name} will be credited to ledger.
            </Text>

            <View style={styles.balanceReminderBox}>
              <Text style={styles.balanceReminderLabel}>Outstanding Balance:</Text>
              <Text style={styles.balanceReminderVal}>
                {formatCurrency(summ.total_pending ?? cust.balance ?? 0, currency)}
              </Text>
            </View>

            <AppInput
              label={`Amount to Receive (${currencySymbol}) *`}
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
              label="Notes / Reference (Optional)"
              placeholder="e.g. Paid via GooglePay UPI ref 12345"
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowPaymentModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Confirm Payment"
                onPress={handleReceivePayment}
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
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  custName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
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
  noPhoneText: {
    fontSize: 12,
    color: '#94A3B8',
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
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
  billCard: {
    marginBottom: 10,
    padding: 12,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  billDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusPartial: {
    backgroundColor: '#FEF3C7',
  },
  statusUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#166534',
  },
  statusTextPartial: {
    color: '#B45309',
  },
  statusTextUnpaid: {
    color: '#991B1B',
  },
  billBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  billMetaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
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

export default CustomerDetailScreen;
