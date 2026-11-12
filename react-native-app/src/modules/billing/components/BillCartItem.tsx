import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BillingCartItem } from '../types';
import { formatCurrency } from '../../../utils/formatters';

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
  const { colors, brandColors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderLight }]}>
      {/* Product Details & Price Editor Link */}
      <View style={styles.infoCol}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.productSku, { color: colors.textMuted }]}>
          SKU: {item.sku || 'N/A'} • {item.unit}
        </Text>

        {/* Clickable Unit Price Pill to Edit Price & Discount */}
        <TouchableOpacity
          style={[styles.priceTag, { backgroundColor: brandColors.primaryLight }]}
          onPress={() => onEditItem(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.priceTagText, { color: brandColors.primary }]}>
            Price: {formatCurrency(item.unit_price)} ✏️
          </Text>
          {item.discount > 0 ? (
            <Text style={[styles.discountTagText, { color: brandColors.success }]}>
              (-{formatCurrency(item.discount)})
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Quantity Stepper */}
      <View style={styles.qtyBox}>
        <TouchableOpacity
          style={[styles.qtyBtn, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => onUpdateQty(item.product_id, item.quantity - 1)}
        >
          <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditItem(item)}>
          <Text style={[styles.qtyVal, { color: colors.textPrimary }]}>{item.quantity}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qtyBtn, { backgroundColor: brandColors.primaryLight }]}
          onPress={() => onUpdateQty(item.product_id, item.quantity + 1)}
        >
          <Text style={[styles.qtyBtnText, { color: brandColors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Line Total & Remove */}
      <View style={styles.totalBox}>
        <Text style={[styles.itemTotal, { color: brandColors.primary }]}>
          {formatCurrency(item.total)}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(item.product_id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 26,
    textAlign: 'center',
  },
  totalBox: {
    alignItems: 'flex-end',
    minWidth: 64,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    marginTop: 4,
  },
});

