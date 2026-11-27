import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Customer } from '../../../../api/types';
import { useTheme } from '../../hooks/useTheme';
import { PhoneIcon, ChevronRightIcon, CalendarIcon } from '../branding/Icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CustomerCardProps {
  customer: Customer;
  onPress: () => void;
  onReceivePayment?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
  onReceivePayment,
}) => {
  const { colors, brandColors, isDark } = useTheme();

  // Khata balance interpretation:
  // In Tulsi Mart / KhataBook: balance > 0 means customer owes money (You'll Get / To Receive)
  const outstanding = Math.max(0, Number(customer.total_outstanding ?? customer.balance ?? 0));
  const totalPaid = Number(customer.total_paid ?? 0);
  const txCount = customer.transaction_count ?? customer.total_bills ?? 0;

  const initials = (customer.name || 'C')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Customer ${customer.name}, Outstanding balance ${formatCurrency(outstanding)}`}
    >
      <View style={styles.topRow}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: isDark ? '#2D2018' : brandColors.lightOrange,
              borderColor: brandColors.primary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: brandColors.primary }]}>
            {initials || 'C'}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoCol}>
          <Text
            style={[styles.customerName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {customer.name}
          </Text>
          {customer.phone ? (
            <View style={styles.phoneRow}>
              <PhoneIcon size={13} color={colors.textSecondary} />
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
                {customer.phone}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Khata Balance Column */}
        <View style={styles.balanceCol}>
          {outstanding > 0 ? (
            <>
              <Text style={[styles.balanceLabel, { color: '#EF4444' }]}>
                YOU'LL GET
              </Text>
              <Text style={[styles.balanceAmount, { color: '#EF4444' }]}>
                {formatCurrency(outstanding)}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.balanceLabel, { color: '#10B981' }]}>
                SETTLED
              </Text>
              <Text style={[styles.balanceAmount, { color: '#10B981' }]}>
                ₹0.00
              </Text>
            </>
          )}
          <ChevronRightIcon size={14} color={colors.textMuted} style={styles.chevron} />
        </View>
      </View>

      {/* Footer bar with metadata */}
      <View
        style={[
          styles.footerRow,
          {
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.metaItem}>
          <CalendarIcon size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {customer.last_transaction_date
              ? `Last Tx: ${formatDate(customer.last_transaction_date)}`
              : 'No recent tx'}
          </Text>
        </View>

        <View style={styles.metaRight}>
          {txCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: isDark ? '#262A34' : '#F3F4F6' },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {txCount} {txCount === 1 ? 'bill' : 'bills'}
              </Text>
            </View>
          )}

          {outstanding > 0 && onReceivePayment && (
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: brandColors.primary }]}
              onPress={onReceivePayment}
              activeOpacity={0.8}
            >
              <Text style={styles.payBtnText}>Receive</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '500',
  },
  balanceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  chevron: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  payBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});

export default CustomerCard;
