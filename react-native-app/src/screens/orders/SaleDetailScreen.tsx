import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { salesService } from '../../services';
import { Sale } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type SaleDetailRouteProp = RouteProp<RootStackParamList, 'SaleDetail'>;

interface ReturnItemState {
  selected: boolean;
  return_qty: number;
  max_qty: number;
  price: number;
  name: string;
}

export const SaleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SaleDetailRouteProp>();
  const { saleId } = route.params;
  const { colors, brandColors, isDark } = useTheme();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  // Return Processing Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItems, setReturnItems] = useState<Record<string, ReturnItemState>>({});
  const [returnReason, setReturnReason] = useState('Customer Return');
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const openReturnModal = () => {
    if (!sale || !sale.items || sale.items.length === 0) {
      Alert.alert('Notice', 'No line items available to return.');
      return;
    }
    const initial: Record<string, ReturnItemState> = {};
    sale.items.forEach((it) => {
      const key = String(it.product_id);
      initial[key] = {
        selected: true,
        return_qty: 1,
        max_qty: Number(it.quantity || 1),
        price: Number(it.unit_price || 0),
        name: it.product_name || `Product #${it.product_id}`,
      };
    });
    setReturnItems(initial);
    setReturnReason('Customer Return');
    setRefundMethod(sale.payment_method || 'CASH');
    setShowReturnModal(true);
  };

  const handleConfirmReturn = async () => {
    if (!sale) return;
    const chosen = Object.entries(returnItems).filter(([_, v]) => v.selected && v.return_qty > 0);
    if (chosen.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one item to return.');
      return;
    }

    setSubmittingReturn(true);
    try {
      await salesService.processReturn({
        invoice_id: sale.id,
        items: chosen.map(([pid, v]) => ({
          product_id: pid,
          quantity: v.return_qty,
          unit_price: v.price,
        })),
        reason: returnReason,
        refund_method: refundMethod,
      });

      setShowReturnModal(false);
      const totalRefund = chosen.reduce((s, [_, v]) => s + (v.return_qty * v.price), 0);
      Alert.alert(
        'Return Processed',
        `Successfully processed sales return! ${formatCurrency(totalRefund)} refunded and active inventory restored.`
      );
      await loadSale();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to process sales return.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const totalRefundAmount = Object.values(returnItems)
    .filter((it) => it.selected)
    .reduce((s, it) => s + (it.return_qty * it.price), 0);

  const loadSale = useCallback(async () => {
    try {
      const data = await salesService.getSaleDetail(saleId);
      setSale(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Invoice Details" showBack onBack={() => navigation.goBack()} />
        <Loader message="Loading invoice line items..." />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Invoice Details" showBack onBack={() => navigation.goBack()} />
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Invoice not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={`Invoice #${sale.invoice_number}`}
        subtitle={formatDateTime(sale.created_at)}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Invoice Summary Card */}
        <Card>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.invoiceTitle, { color: colors.textPrimary }]}>
                Invoice #{sale.invoice_number}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Customer: {sale.customer_name || 'Walk-in Customer'}
              </Text>
              {sale.customer_phone ? (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  Phone: {sale.customer_phone}
                </Text>
              ) : null}
            </View>

            <Badge
              label={sale.payment_status || 'PAID'}
              variant={sale.payment_status === 'PAID' ? 'success' : 'warning'}
            />
          </View>
        </Card>

        {/* Line Items Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Purchased Items</Text>

          {sale.items && sale.items.length > 0 ? (
            sale.items.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[styles.itemRow, { borderBottomColor: colors.borderLight }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                    {item.product_name || `Product #${item.product_id}`}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                    {item.quantity} {item.unit || 'pcs'} × {formatCurrency(item.unit_price)}
                  </Text>
                </View>

                <Text style={[styles.itemSubtotal, { color: colors.textPrimary }]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, fontStyle: 'italic', paddingVertical: 8 }}>
              No item details recorded.
            </Text>
          )}

          {/* Totals Breakdown */}
          <View style={[styles.totalBreakdown, { borderTopColor: colors.borderLight }]}>
            <View style={styles.breakRow}>
              <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {formatCurrency(sale.subtotal)}
              </Text>
            </View>

            {sale.discount_amount > 0 && (
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary }}>Discount</Text>
                <Text style={{ color: brandColors.success, fontWeight: '600' }}>
                  -{formatCurrency(sale.discount_amount)}
                </Text>
              </View>
            )}

            {sale.tax_amount > 0 && (
              <View style={styles.breakRow}>
                <Text style={{ color: colors.textSecondary }}>Tax</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  +{formatCurrency(sale.tax_amount)}
                </Text>
              </View>
            )}

            <View style={[styles.breakRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
              <Text style={[styles.grandLabel, { color: colors.textPrimary }]}>Grand Total</Text>
              <Text style={[styles.grandValue, { color: brandColors.primary }]}>
                {formatCurrency(sale.total_amount)}
              </Text>
            </View>

            <View style={styles.breakRow}>
              <Text style={{ color: colors.textSecondary }}>Paid via {sale.payment_method}</Text>
              <Text style={{ color: brandColors.success, fontWeight: '700' }}>
                {formatCurrency(sale.paid_amount || sale.total_amount)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sales Return Action Card */}
        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
                Customer Returns & Exchanges
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Accept returned items, issue immediate cash/UPI refunds, and restock products.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.returnActionBtn, { backgroundColor: isDark ? '#3E1F1F' : '#FEE2E2', borderColor: '#EF4444' }]}
              onPress={openReturnModal}
              activeOpacity={0.7}
            >
              <Text style={[styles.returnActionBtnText, { color: '#DC2626' }]}>↩️ Return Items</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      {/* Return Processing Modal */}
      <Modal
        visible={showReturnModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>↩️ Process Return</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Invoice #{sale.invoice_number} • Automatic inventory restocking
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReturnModal(false)} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingVertical: 10 }}>
              <Text style={[styles.subLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                Select Items to Return:
              </Text>

              {Object.entries(returnItems).map(([pid, it]) => (
                <View
                  key={pid}
                  style={[
                    styles.returnItemRow,
                    { borderColor: it.selected ? brandColors.primary : colors.borderLight, backgroundColor: isDark ? '#22252F' : '#F8FAFC' },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.checkboxTouch}
                    onPress={() =>
                      setReturnItems((prev) => ({
                        ...prev,
                        [pid]: { ...prev[pid], selected: !prev[pid].selected },
                      }))
                    }
                  >
                    <View style={[styles.checkbox, it.selected && { backgroundColor: brandColors.primary }]}>
                      {it.selected ? <Text style={styles.checkText}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {it.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        Rate: {formatCurrency(it.price)} | Max: {it.max_qty}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {it.selected && (
                    <View style={styles.qtyControlRow}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                        onPress={() =>
                          setReturnItems((prev) => ({
                            ...prev,
                            [pid]: { ...prev[pid], return_qty: Math.max(1, prev[pid].return_qty - 1) },
                          }))
                        }
                      >
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{it.return_qty}</Text>
                      <TouchableOpacity
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                        onPress={() =>
                          setReturnItems((prev) => ({
                            ...prev,
                            [pid]: { ...prev[pid], return_qty: Math.min(prev[pid].max_qty, prev[pid].return_qty + 1) },
                          }))
                        }
                      >
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {/* Reason Picker */}
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Return Reason:</Text>
                <View style={styles.pillRow}>
                  {['Customer Return', 'Defective', 'Wrong Item', 'Exchange'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.pillOption,
                        { borderColor: colors.border },
                        returnReason === r && { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
                      ]}
                      onPress={() => setReturnReason(r)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: colors.textSecondary },
                          returnReason === r && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Refund Method */}
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Refund Method:</Text>
                <View style={styles.pillRow}>
                  {['CASH', 'UPI', 'CARD', 'CREDIT_NOTE'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.pillOption,
                        { borderColor: colors.border },
                        refundMethod === m && { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
                      ]}
                      onPress={() => setRefundMethod(m)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: colors.textSecondary },
                          refundMethod === m && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Refund Total Preview */}
              <View style={[styles.refundBox, { backgroundColor: isDark ? '#2D1B1B' : '#FEF2F2', borderColor: '#F87171' }]}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#DC2626' }}>Refund Amount Payable</Text>
                  <Text style={{ fontSize: 11, color: '#991B1B' }}>Active stock will automatically increase</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#DC2626' }}>
                  {formatCurrency(totalRefundAmount)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowReturnModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={submittingReturn ? 'Processing...' : 'Confirm Return'}
                onPress={handleConfirmReturn}
                loading={submittingReturn}
                style={{ flex: 1.5, backgroundColor: '#EF4444' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  returnActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  returnActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  returnItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pillOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
  },
  refundBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalBreakdown: {
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  grandLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  grandValue: {
    fontSize: 18,
    fontWeight: '900',
  },
});

export default SaleDetailScreen;

