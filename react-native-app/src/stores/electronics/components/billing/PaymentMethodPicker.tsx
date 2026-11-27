import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { PaymentMode, SelectedCustomer } from '../../utils/billingTypes';
import {
  IndianRupeeIcon,
  CreditCardIcon,
  UsersIcon,
  WalletIcon,
} from '../branding/Icons';

interface PaymentMethodPickerProps {
  selectedMethod: PaymentMode;
  onSelectMethod: (method: PaymentMode) => void;
  selectedCustomer: SelectedCustomer;
  onOpenCustomerSelector: () => void;
}

export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedMethod,
  onSelectMethod,
  selectedCustomer,
  onOpenCustomerSelector,
}) => {
  const { colors, brandColors, isDark } = useTheme();

  const methods: Array<{
    id: PaymentMode;
    label: string;
    icon: (c: string) => React.ReactNode;
    description: string;
  }> = [
    {
      id: 'CASH',
      label: 'Cash',
      icon: (c) => <IndianRupeeIcon size={18} color={c} strokeWidth={2.5} />,
      description: 'Counter Cash Payment',
    },
    {
      id: 'UPI',
      label: 'UPI / QR',
      icon: (c) => <CreditCardIcon size={18} color={c} />,
      description: 'GPay, PhonePe, Paytm',
    },
    {
      id: 'BANK_TRANSFER',
      label: 'Bank / Card',
      icon: (c) => <WalletIcon size={18} color={c} />,
      description: 'POS Card / Net Banking',
    },
    {
      id: 'DEBIT_CUSTOMER',
      label: 'Debit (Khata)',
      icon: (c) => <UsersIcon size={18} color={c} />,
      description: 'Customer Credit Ledger',
    },
  ];

  const handleSelect = (id: PaymentMode) => {
    if (id === 'DEBIT_CUSTOMER' && selectedCustomer.type === 'walk_in') {
      onSelectMethod(id);
      onOpenCustomerSelector();
      return;
    }
    onSelectMethod(id);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Payment Mode
      </Text>

      <View style={styles.grid}>
        {methods.map((m) => {
          const isSelected = selectedMethod === m.id;
          const isDebit = m.id === 'DEBIT_CUSTOMER';
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? '#2D2018'
                      : brandColors.lightOrange
                    : colors.surfaceSubtle,
                  borderColor: isSelected ? brandColors.primary : colors.border,
                },
              ]}
              onPress={() => handleSelect(m.id)}
              activeOpacity={0.7}
            >
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isSelected
                        ? brandColors.primary
                        : isDark
                        ? '#262A34'
                        : '#E5E7EB',
                    },
                  ]}
                >
                  {m.icon(isSelected ? '#FFFFFF' : colors.textPrimary)}
                </View>
                {isSelected ? (
                  <View style={[styles.activeDot, { backgroundColor: brandColors.primary }]} />
                ) : null}
              </View>

              <Text
                style={[
                  styles.methodLabel,
                  {
                    color: isSelected ? brandColors.primary : colors.textPrimary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {m.label}
              </Text>
              <Text style={[styles.methodDesc, { color: colors.textMuted }]} numberOfLines={1}>
                {m.description}
              </Text>

              {isDebit && selectedCustomer.type === 'debit_customer' ? (
                <View
                  style={[
                    styles.khataBadge,
                    {
                      backgroundColor: isDark ? '#2B1A17' : '#FEF2F2',
                      borderColor: '#EF4444',
                    },
                  ]}
                >
                  <Text style={[styles.khataBadgeText, { color: '#EF4444' }]} numberOfLines={1}>
                    Khata: {selectedCustomer.name}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  methodLabel: {
    fontSize: 13,
  },
  methodDesc: {
    fontSize: 10.5,
    marginTop: 2,
  },
  khataBadge: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  khataBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default PaymentMethodPicker;
