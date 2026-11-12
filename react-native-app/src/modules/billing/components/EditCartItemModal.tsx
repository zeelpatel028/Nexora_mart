import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BillingCartItem } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface EditCartItemModalProps {
  visible: boolean;
  item: BillingCartItem | null;
  onClose: () => void;
  onSave: (productId: string | number, newPrice: number, newQty: number, discount: number) => void;
}

export const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  const { colors, brandColors } = useTheme();

  const [priceInput, setPriceInput] = useState('');
  const [qtyInput, setQtyInput] = useState('1');
  const [discountInput, setDiscountInput] = useState('0');

  useEffect(() => {
    if (item) {
      setPriceInput(String(item.unit_price));
      setQtyInput(String(item.quantity));
      setDiscountInput(String(item.discount || 0));
    }
  }, [item]);

  if (!item) return null;

  const currentPrice = parseFloat(priceInput) || 0;
  const currentQty = parseFloat(qtyInput) || 0;
  const currentDiscount = parseFloat(discountInput) || 0;
  const computedTotal = Math.max(0, currentPrice * currentQty - currentDiscount);

  const handleSave = () => {
    if (currentPrice < 0) return;
    if (currentQty <= 0) return;
    onSave(item.product_id, currentPrice, currentQty, currentDiscount);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                SKU: {item.sku || 'N/A'} • Unit: {item.unit}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.body}>
            {/* Unit Price Override */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Unit Price (₹)</Text>
                {item.original_price !== currentPrice ? (
                  <TouchableOpacity onPress={() => setPriceInput(String(item.original_price))}>
                    <Text style={[styles.resetLink, { color: brandColors.primary }]}>
                      Reset to ₹{item.original_price}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary },
                ]}
                keyboardType="numeric"
                value={priceInput}
                onChangeText={setPriceInput}
                placeholder="0.00"
                placeholderTextColor={colors.textPlaceholder}
              />
            </View>

            {/* Quantity */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity ({item.unit})</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.surfaceSubtle }]}
                  onPress={() => setQtyInput(String(Math.max(1, currentQty - 1)))}
                >
                  <Text style={[styles.stepText, { color: colors.textPrimary }]}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.qtyInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  keyboardType="numeric"
                  value={qtyInput}
                  onChangeText={setQtyInput}
                />

                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: brandColors.primaryLight }]}
                  onPress={() => setQtyInput(String(currentQty + 1))}
                >
                  <Text style={[styles.stepText, { color: brandColors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Discount */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Item Discount (₹)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary },
                ]}
                keyboardType="numeric"
                value={discountInput}
                onChangeText={setDiscountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textPlaceholder}
              />
            </View>

            {/* Total Preview */}
            <View style={[styles.totalPreview, { backgroundColor: brandColors.primaryLight }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Item Total</Text>
              <Text style={[styles.totalVal, { color: brandColors.primary }]}>
                {formatCurrency(computedTotal)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: brandColors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  resetLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 22,
    fontWeight: '700',
  },
  qtyInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  totalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

