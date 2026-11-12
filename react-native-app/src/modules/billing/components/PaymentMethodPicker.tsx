import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { PaymentMode, SelectedCustomer } from '../types';

interface PaymentMethodPickerProps {
  selectedMethod: PaymentMode;
  onSelectMethod: (method: PaymentMode) => void;
  selectedCustomer: SelectedCustomer;
  onOpenCustomerSelector: () => void;
}

const METHODS: Array<{ id: PaymentMode; label: string; icon: string; description: string }> = [
  { id: 'CASH', label: 'Cash', icon: '💵', description: 'Counter Cash Payment' },
  { id: 'UPI', label: 'UPI / QR', icon: '📱', description: 'GPay, PhonePe, Paytm QR' },
  { id: 'BANK_TRANSFER', label: 'Bank / Card', icon: '🏦', description: 'Card POS / NEFT / IMPS' },
  { id: 'DEBIT_CUSTOMER', label: 'Debit (Khata)', icon: '📒', description: 'Customer Credit / Udhar' },
];

export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedMethod,
  onSelectMethod,
  selectedCustomer,
  onOpenCustomerSelector,
}) => {
  const { colors, brandColors } = useTheme();

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
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Mode</Text>

      <View style={styles.grid}>
        {METHODS.map((m) => {
          const isSelected = selectedMethod === m.id;
          const isDebit = m.id === 'DEBIT_CUSTOMER';
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: isSelected ? brandColors.primaryLight : colors.surfaceSubtle,
                  borderColor: isSelected ? brandColors.primary : colors.border,
                },
              ]}
              onPress={() => handleSelect(m.id)}
              activeOpacity={0.7}
            >
              <View style={styles.topRow}>
                <Text style={styles.methodIcon}>{m.icon}</Text>
                {isSelected ? (
                  <View style={[styles.activeDot, { backgroundColor: brandColors.primary }]} />
                ) : null}
              </View>

              <Text
                style={[
                  styles.methodLabel,
                  { color: isSelected ? brandColors.primary : colors.textPrimary, fontWeight: isSelected ? '800' : '600' },
                ]}
              >
                {m.label}
              </Text>
              <Text style={[styles.methodDesc, { color: colors.textMuted }]} numberOfLines={1}>
                {m.description}
              </Text>

              {isDebit && selectedCustomer.type === 'debit_customer' ? (
                <View style={[styles.khataBadge, { backgroundColor: brandColors.warningLight }]}>
                  <Text style={[styles.khataBadgeText, { color: brandColors.warning }]}>
                    Debited to {selectedCustomer.name}
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
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  methodIcon: {
    fontSize: 22,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  methodLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 11,
  },
  khataBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  khataBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

