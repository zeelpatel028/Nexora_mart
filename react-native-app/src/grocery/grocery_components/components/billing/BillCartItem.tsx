import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BillingCartItem } from '../../utils/billingTypes';
import { formatCurrency } from '../../utils/formatters';
import { CloseIcon, PlusIcon } from '../branding/Icons';

interface BillCartItemProps {
  item: BillingCartItem;
  onUpdateQty: (productId: string | number, newQty: number) => void;
  onEditItem: (item: BillingCartItem) => void;
  onRemove: (productId: string | number) => void;
}

export const BillCartItem: React.FC<BillCartItemProps> = ({
  item,
  onUpdateQty,
  onEditItem,
  onRemove,
}) => {
  const { colors, brandColors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderLight }]}>
      {/* Product Details & Price Editor */}
      <View style={styles.infoCol}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.productSku, { color: colors.textMuted }]}>
          SKU: {item.sku || 'N/A'} • {item.unit}
        </Text>

        {/* Price Tag (Clickable to edit price/discount) */}
        <TouchableOpacity
          style={[
            styles.priceTag,
            { backgroundColor: isDark ? '#2D2018' : brandColors.lightOrange },
          ]}
          onPress={() => onEditItem(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.priceTagText, { color: brandColors.primary }]}>
            ₹{item.unit_price} / unit
          </Text>
          {item.discount > 0 ? (
            <Text style={[styles.discountTagText, { color: '#10B981' }]}>
              (-{formatCurrency(item.discount)})
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Quantity Stepper (+ / -) */}
      <View
        style={[
          styles.qtyBox,
          {
            backgroundColor: isDark ? '#1C1E24' : '#F9FAFB',
            borderColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => onUpdateQty(item.product_id, item.quantity - 1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditItem(item)}>
          <Text style={[styles.qtyVal, { color: colors.textPrimary }]}>
            {item.quantity}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qtyBtn, { backgroundColor: brandColors.primary }]}
          onPress={() => onUpdateQty(item.product_id, item.quantity + 1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.qtyBtnText, { color: '#FFFFFF' }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Line Total & Remove */}
      <View style={styles.totalBox}>
        <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
          {formatCurrency(item.total)}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(item.product_id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={`Remove ${item.name} from cart`}
        >
          <CloseIcon size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
  },
  productSku: {
    fontSize: 11,
  },
  priceTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 3,
  },
  priceTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  qtyVal: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  totalBox: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  itemTotal: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  deleteBtn: {
    marginTop: 4,
    padding: 2,
  },
});

export default BillCartItem;
