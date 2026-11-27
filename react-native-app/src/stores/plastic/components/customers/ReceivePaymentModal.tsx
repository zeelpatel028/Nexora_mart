import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { partnerService } from '../../services';
import {
  CloseIcon,
  CheckIcon,
  IndianRupeeIcon,
  CreditCardIcon,
  CalendarIcon,
  FileTextIcon,
} from '../branding/Icons';
import { formatCurrency } from '../../utils/formatters';

interface ReceivePaymentModalProps {
  visible: boolean;
  customerId: number;
  customerName: string;
  outstandingBalance: number;
  onClose: () => void;
  onSuccess: (paymentResult: any) => void;
}

type PaymentMethodType = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  visible,
  customerId,
  customerName,
  outstandingBalance,
  onClose,
  onSuccess,
}) => {
  const { colors, brandColors, isDark } = useTheme();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setPaymentMethod('CASH');
      setNotes('');
      setErrorMsg('');
    }
  }, [visible]);

  const numAmount = parseFloat(amount) || 0;
  const remainingAfterPayment = Math.max(0, outstandingBalance - numAmount);
  const isOverpaying = numAmount > outstandingBalance && outstandingBalance > 0;

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (!amount || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than ₹0');
      return;
    }

    if (numAmount > outstandingBalance && outstandingBalance > 0) {
      Alert.alert(
        'Excess Payment Warning',
        `The amount entered (${formatCurrency(numAmount)}) is greater than the total outstanding balance (${formatCurrency(outstandingBalance)}). Do you want to proceed and settle the complete outstanding balance?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed & Settle',
            onPress: () => processPayment(),
          },
        ]
      );
      return;
    }

    processPayment();
  };

  const processPayment = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await partnerService.recordCustomerPayment(customerId, {
        amount: numAmount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Payment Recorded',
        `Received ${formatCurrency(numAmount)} from ${customerName}.\nRemaining Balance: ${formatCurrency(result.remaining_balance)}`
      );

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to record payment.';
      setErrorMsg(msg);
      Alert.alert('Payment Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods: { key: PaymentMethodType; label: string }[] = [
    { key: 'CASH', label: 'Cash' },
    { key: 'UPI', label: 'UPI' },
    { key: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { key: 'OTHER', label: 'Other' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.sheetHeader,
              { borderBottomColor: colors.borderLight },
            ]}
          >
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Receive Payment
              </Text>
              <Text style={[styles.subtitle, { color: brandColors.primary }]}>
                {customerName}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? '#262A34' : '#F3F4F6' },
              ]}
              onPress={onClose}
              accessibilityLabel="Close payment dialog"
            >
              <CloseIcon size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Outstanding Summary Banner */}
            <View
              style={[
                styles.balanceBanner,
                {
                  backgroundColor: isDark ? '#261815' : '#FFF3E0',
                  borderColor: brandColors.primary,
                },
              ]}
            >
              <View>
                <Text style={[styles.bannerLabel, { color: brandColors.darkOrange }]}>
                  Total Outstanding Balance
                </Text>
                <Text style={[styles.bannerAmount, { color: '#EF4444' }]}>
                  {formatCurrency(outstandingBalance)}
                </Text>
              </View>

              {outstandingBalance > 0 && (
                <TouchableOpacity
                  style={[styles.fullPayBtn, { backgroundColor: brandColors.primary }]}
                  onPress={() => handleQuickAmount(outstandingBalance)}
                >
                  <Text style={styles.fullPayBtnText}>Full Pay</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Payment Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Payment Amount (₹) <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View
                style={[
                  styles.amountInputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: errorMsg
                      ? '#EF4444'
                      : numAmount > 0
                      ? brandColors.primary
                      : colors.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.currencyPrefix, { color: brandColors.primary }]}>
                  ₹
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.textPrimary }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(val) => {
                    setAmount(val);
                    setErrorMsg('');
                  }}
                  autoFocus
                />
                {numAmount > 0 && (
                  <TouchableOpacity onPress={() => setAmount('')} style={{ padding: 4 }}>
                    <CloseIcon size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Quick amount chips */}
              {outstandingBalance > 0 && (
                <View style={styles.chipsRow}>
                  {[
                    Math.round(outstandingBalance),
                    Math.round(outstandingBalance / 2),
                    500,
                    1000,
                    2000,
                  ]
                    .filter((val, idx, arr) => val > 0 && arr.indexOf(val) === idx && val <= outstandingBalance)
                    .map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              numAmount === val
                                ? brandColors.primary
                                : isDark
                                ? '#262A34'
                                : '#F3F4F6',
                          },
                        ]}
                        onPress={() => handleQuickAmount(val)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                numAmount === val ? '#FFFFFF' : colors.textPrimary,
                            },
                          ]}
                        >
                          ₹{val.toLocaleString('en-IN')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Remaining Amount Live Preview */}
            <View
              style={[
                styles.calculationCard,
                {
                  backgroundColor: isDark ? '#1E2026' : '#F9FAFB',
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>
                  Total Billed Outstanding:
                </Text>
                <Text style={[styles.calcVal, { color: colors.textPrimary }]}>
                  {formatCurrency(outstandingBalance)}
                </Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>
                  Amount Being Received:
                </Text>
                <Text style={[styles.calcVal, { color: '#10B981', fontWeight: '700' }]}>
                  - {formatCurrency(numAmount)}
                </Text>
              </View>
              <View style={[styles.calcDivider, { backgroundColor: colors.borderLight }]} />
              <View style={styles.calcRow}>
                <Text style={[styles.calcLabel, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Remaining Balance:
                </Text>
                <Text
                  style={[
                    styles.calcVal,
                    {
                      color: remainingAfterPayment > 0 ? brandColors.primary : '#10B981',
                      fontWeight: '800',
                      fontSize: 16,
                    },
                  ]}
                >
                  {formatCurrency(remainingAfterPayment)}
                </Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Payment Mode
              </Text>
              <View style={styles.methodsRow}>
                {paymentMethods.map((m) => {
                  const selected = paymentMethod === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[
                        styles.methodBtn,
                        {
                          backgroundColor: selected
                            ? brandColors.primary
                            : isDark
                            ? '#22252D'
                            : '#F3F4F6',
                          borderColor: selected ? brandColors.primary : colors.borderLight,
                        },
                      ]}
                      onPress={() => setPaymentMethod(m.key)}
                    >
                      <Text
                        style={[
                          styles.methodText,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Optional Note Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Note / Transaction Reference (Optional)
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g. UPI Ref #, Cheque #, or reason"
                placeholderTextColor={colors.textPlaceholder}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: brandColors.primary,
                    opacity: numAmount <= 0 || loading ? 0.6 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={numAmount <= 0 || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckIcon size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Confirm & Receive</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerAmount: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  fullPayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  fullPayBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    height: '100%',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calculationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  calcDivider: {
    height: 1,
    marginVertical: 6,
  },
  calcLabel: {
    fontSize: 13,
  },
  calcVal: {
    fontSize: 14,
  },
  methodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  noteInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ReceivePaymentModal;
