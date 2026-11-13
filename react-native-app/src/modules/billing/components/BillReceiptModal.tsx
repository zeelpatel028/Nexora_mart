import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Sale } from '../../../models/types';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

interface BillReceiptModalProps {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
  onNewBill?: () => void;
}

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({
  visible,
  sale,
  onClose,
  onNewBill,
}) => {
  const { colors, brandColors } = useTheme();

  if (!sale) return null;

  const handleShare = async () => {
    try {
      const itemsList = (sale.items || [])
        .map(
          (it, idx) =>
            `${idx + 1}. ${it.product_name} x ${it.quantity} = ₹${it.total_price || (it.quantity * it.unit_price)}`
        )
        .join('\n');

      const message = `🧾 *TULSI MART - INVOICE #${sale.invoice_number}*\n` +
        `Date: ${formatDateTime(sale.created_at || sale.sale_date)}\n` +
        `Customer: ${sale.customer_name || 'Walk-in Customer'}\n` +
        `Payment Mode: ${sale.payment_method}\n` +
        `--------------------------------\n` +
        `${itemsList}\n` +
        `--------------------------------\n` +
        `Subtotal: ₹${sale.subtotal}\n` +
        (sale.discount_amount ? `Discount: -₹${sale.discount_amount}\n` : '') +
        (sale.tax_amount ? `GST/Tax: +₹${sale.tax_amount}\n` : '') +
        `*Grand Total: ₹${sale.total_amount}*\n` +
        `Paid: ₹${sale.paid_amount}\n` +
        (sale.balance_amount ? `*Khata Balance: ₹${sale.balance_amount}*\n` : '') +
        `\nThank you for shopping with Tulsi Mart!`;

      await Share.share({ message });
    } catch (err: any) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const handlePrint = () => {
    Alert.alert(
      'Print Receipt',
      `Ready to print Invoice #${sale.invoice_number} on 80mm/58mm thermal receipt printer. (Connected via Bluetooth POS).`
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.receiptContainer, { backgroundColor: colors.surface }]}>
          {/* Action Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Invoice Receipt</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={{ fontSize: 16 }}>📤</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Thermal Style Receipt Paper Card */}
            <View style={[styles.paper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {/* Brand Header */}
              <View style={styles.storeHeader}>
                <Text style={[styles.storeName, { color: brandColors.primary }]}>TULSI MART</Text>
                <Text style={[styles.storeMeta, { color: colors.textMuted }]}>
                  Retail & Smart Store Management
                </Text>
                <Text style={[styles.storeMeta, { color: colors.textMuted }]}>
                  GSTIN: 24AAACN1234F1Z5 • Tel: +91 98765 43210
                </Text>
              </View>

              <View style={[styles.dashedLine, { borderColor: colors.border }]} />

              {/* Invoice Meta */}
              <View style={styles.metaGrid}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textSecondary }]}>Invoice #:</Text>
                  <Text style={[styles.metaVal, { color: colors.textPrimary }]}>#{sale.invoice_number}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textSecondary }]}>Date & Time:</Text>
                  <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                    {formatDateTime(sale.created_at || sale.sale_date)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textSecondary }]}>Customer:</Text>
                  <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                    {sale.customer_name || 'Walk-in Customer'}
                  </Text>
                </View>
                {sale.customer_phone ? (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaKey, { color: colors.textSecondary }]}>Phone:</Text>
                    <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{sale.customer_phone}</Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textSecondary }]}>Payment Mode:</Text>
                  <View style={[styles.payBadge, { backgroundColor: brandColors.primaryLight }]}>
                    <Text style={[styles.payBadgeText, { color: brandColors.primary }]}>
                      {sale.payment_method}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.dashedLine, { borderColor: colors.border }]} />

              {/* Items Table */}
              <View style={styles.itemsTable}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColName, { color: colors.textMuted }]}>ITEM</Text>
                  <Text style={[styles.tableColQty, { color: colors.textMuted }]}>QTY</Text>
                  <Text style={[styles.tableColPrice, { color: colors.textMuted }]}>RATE</Text>
                  <Text style={[styles.tableColTotal, { color: colors.textMuted }]}>AMT</Text>
                </View>

                {(sale.items || []).map((it, idx) => (
                  <View key={it.id || idx} style={styles.tableItemRow}>
                    <Text style={[styles.tableColName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {it.product_name || `Item #${idx + 1}`}
                    </Text>
                    <Text style={[styles.tableColQty, { color: colors.textPrimary }]}>{it.quantity}</Text>
                    <Text style={[styles.tableColPrice, { color: colors.textPrimary }]}>
                      {formatCurrency(it.unit_price)}
                    </Text>
                    <Text style={[styles.tableColTotal, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {formatCurrency(it.total_price || (it.quantity * it.unit_price))}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.dashedLine, { borderColor: colors.border }]} />

              {/* Calculations Summary */}
              <View style={styles.calcSummary}>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcKey, { color: colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.calcVal, { color: colors.textPrimary }]}>
                    {formatCurrency(sale.subtotal)}
                  </Text>
                </View>

                {sale.discount_amount > 0 ? (
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcKey, { color: brandColors.success }]}>Discount</Text>
                    <Text style={[styles.calcVal, { color: brandColors.success }]}>
                      -{formatCurrency(sale.discount_amount)}
                    </Text>
                  </View>
                ) : null}

                {sale.tax_amount > 0 ? (
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcKey, { color: colors.textSecondary }]}>GST / Tax</Text>
                    <Text style={[styles.calcVal, { color: colors.textPrimary }]}>
                      +{formatCurrency(sale.tax_amount)}
                    </Text>
                  </View>
                ) : null}

                <View style={[styles.calcRow, styles.grandTotalRow, { borderTopColor: colors.borderLight }]}>
                  <Text style={[styles.grandTotalKey, { color: colors.textPrimary }]}>GRAND TOTAL</Text>
                  <Text style={[styles.grandTotalVal, { color: brandColors.primary }]}>
                    {formatCurrency(sale.total_amount)}
                  </Text>
                </View>

                <View style={styles.calcRow}>
                  <Text style={[styles.calcKey, { color: colors.textSecondary }]}>Amount Paid</Text>
                  <Text style={[styles.calcVal, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {formatCurrency(sale.paid_amount)}
                  </Text>
                </View>

                {sale.balance_amount && sale.balance_amount > 0 ? (
                  <View style={[styles.calcRow, { backgroundColor: brandColors.warningLight, padding: 4, borderRadius: 6 }]}>
                    <Text style={[styles.calcKey, { color: brandColors.warning, fontWeight: '700' }]}>
                      Debit (Khata) Balance
                    </Text>
                    <Text style={[styles.calcVal, { color: brandColors.warning, fontWeight: '800' }]}>
                      {formatCurrency(sale.balance_amount)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={[styles.dashedLine, { borderColor: colors.border }]} />

              {/* Thank you footer */}
              <View style={styles.footerNote}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Thank you for your business! Visit Again.
                </Text>
                <Text style={[styles.footerSub, { color: colors.textPlaceholder }]}>
                  Software Powered by Tulsi Mart
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer Buttons */}
          <View style={styles.actionFooter}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: brandColors.primaryLight }]}
              onPress={handlePrint}
            >
              <Text style={[styles.actionBtnText, { color: brandColors.primary }]}>🖨️ Print Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
              onPress={handleShare}
            >
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>💬 WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: brandColors.primary }]}
              onPress={() => {
                onClose();
                if (onNewBill) onNewBill();
              }}
            >
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>➕ New Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptContainer: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: 24,
    padding: 18,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  shareBtn: {
    padding: 6,
  },
  scroll: {
    paddingBottom: 16,
  },
  paper: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  storeHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  storeMeta: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 0.8,
    marginVertical: 10,
  },
  metaGrid: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  payBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemsTable: {
    marginVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableItemRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  tableColName: {
    flex: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  tableColQty: {
    flex: 0.7,
    fontSize: 12,
    textAlign: 'center',
  },
  tableColPrice: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  tableColTotal: {
    flex: 1.1,
    fontSize: 12,
    textAlign: 'right',
  },
  calcSummary: {
    gap: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcKey: {
    fontSize: 13,
  },
  calcVal: {
    fontSize: 13,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalKey: {
    fontSize: 15,
    fontWeight: '900',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  footerNote: {
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 10,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

