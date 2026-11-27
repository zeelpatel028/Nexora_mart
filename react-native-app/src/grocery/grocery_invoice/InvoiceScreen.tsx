import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useSettings } from '../../navigation/context/SettingsContext';
import { useStore } from '../../navigation/context/StoreContext';
import billingApi from '../grocery_components/services/billingApi';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import AppButton from '../grocery_components/components/common/AppButton';
import AppIcon from '../grocery_components/components/icons/AppIcon';
import { formatCurrency, formatDate } from '../grocery_components/utils/formatters';

type InvoiceScreenRouteProp = RouteProp<RootStackParamList, 'Invoice'>;

export const InvoiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const invoiceId = route.params?.invoiceId || route.params?.saleId;
  const initialData = route.params?.invoiceData;

  const { colors, isDark } = useTheme();
  const { currency, currencySymbol } = useSettings();
  const { currentStore } = useStore();

  const [invoice, setInvoice] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const data = await billingApi.getInvoiceDetail(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      console.warn('Failed to load invoice:', err);
      Alert.alert('Notice', 'Unable to fetch invoice details from server.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (!initialData && invoiceId) {
      loadInvoice();
    }
  }, [initialData, invoiceId, loadInvoice]);

  const handleShareWhatsApp = async () => {
    if (!invoice) return;
    const invNum = invoice.invoice_number || `INV-${invoice.id}`;
    const storeName = currentStore?.name || 'Tulsi Mart';
    let text = `*${storeName.toUpperCase()} - TAX INVOICE*\n`;
    text += `Invoice No: ${invNum}\n`;
    text += `Date: ${formatDate(invoice.created_at || new Date().toISOString())}\n`;
    text += `Customer: ${invoice.customer_name || 'Walk-in Customer'}\n`;
    text += `--------------------------------\n`;
    text += `ITEMS:\n`;
    (invoice.items || []).forEach((it: any, i: number) => {
      text += `${i + 1}. ${it.product_name} - ${it.quantity} ${it.unit || 'PCS'} x ${currencySymbol}${it.unit_price} = ${currencySymbol}${it.total_amount}\n`;
    });
    text += `--------------------------------\n`;
    text += `Subtotal: ${formatCurrency(invoice.subtotal || 0, currency)}\n`;
    if (Number(invoice.discount_amount || 0) > 0) {
      text += `Discount: -${formatCurrency(invoice.discount_amount, currency)}\n`;
    }
    text += `GST Amount: ${formatCurrency(invoice.tax_amount || 0, currency)}\n`;
    text += `*GRAND TOTAL: ${formatCurrency(invoice.total_amount || 0, currency)}*\n`;
    text += `Paid Amount: ${formatCurrency(invoice.paid_amount || 0, currency)}\n`;
    if (Number(invoice.remaining_amount || 0) > 0) {
      text += `*BALANCE DUE: ${formatCurrency(invoice.remaining_amount, currency)}*\n`;
    }
    text += `--------------------------------\n`;
    text += `Thank you for shopping at ${storeName}!`;

    try {
      await Share.share({
        message: text,
        title: `Invoice ${invNum}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handlePrint = () => {
    Alert.alert(
      'Print Invoice',
      'Invoice document sent to connected POS thermal / Wi-Fi printer.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader title="Tax Invoice" showBack />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F57C00" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading invoice details...</Text>
        </View>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader title="Tax Invoice" showBack />
        <View style={styles.centerBox}>
          <AppIcon name="AlertCircle" size={48} color={colors.textMuted} />
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Invoice not found.</Text>
        </View>
      </View>
    );
  }

  const items = invoice.items || [];
  const taxable = Number(invoice.subtotal || 0);
  const taxTotal = Number(invoice.total_tax ?? invoice.tax_amount ?? 0);
  const cgst = taxTotal / 2;
  const sgst = taxTotal / 2;
  const payStatusUpper = String(invoice.payment_status || 'PAID').toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Tax Invoice"
        subtitle={invoice.invoice_number || `INV-${invoice.id}`}
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShareWhatsApp} style={styles.shareHeaderBtn}>
            <AppIcon name="Share2" size={18} color="#F57C00" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Printable Invoice Card */}
        <AppCard style={styles.invoicePaper}>
          {/* 1. Store Header */}
          <View style={styles.storeHeader}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>TULSI MART</Text>
            </View>
            <Text style={styles.storeName}>{currentStore?.name || 'Tulsi Mart Store'}</Text>
            <Text style={styles.storeAddress}>{currentStore?.address || 'Main Market Road, City Center'}</Text>
            <Text style={styles.storeContact}>
              GSTIN: {currentStore?.gstin || '24ABCDE1234F1Z5'} | Ph: {currentStore?.phone || '+91 98765 43210'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 2. Invoice & Customer Meta */}
          <View style={styles.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>INVOICE NO</Text>
              <Text style={styles.metaValueHighlight}>{invoice.invoice_number || `TM_INV_${invoice.id}`}</Text>
              <Text style={styles.metaLabelDate}>
                {formatDate(invoice.created_at || new Date().toISOString())}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>BILLED TO</Text>
              <Text style={styles.metaValue}>{invoice.customer_name || 'Walk-in Customer'}</Text>
              {invoice.customer_phone ? (
                <Text style={styles.metaSub}>Ph: {invoice.customer_phone}</Text>
              ) : null}
              <View
                style={[
                  styles.statusBadge,
                  payStatusUpper === 'PAID'
                    ? styles.badgePaid
                    : payStatusUpper === 'PARTIAL'
                    ? styles.badgePartial
                    : styles.badgeUnpaid,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {payStatusUpper}
                </Text>
              </View>
            </View>
          </View>

          {/* 3. Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 24 }]}>#</Text>
              <Text style={[styles.th, { flex: 1 }]}>Item / Base / GST</Text>
              <Text style={[styles.th, { width: 48, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.th, { width: 58, textAlign: 'right' }]}>Sell</Text>
              <Text style={[styles.th, { width: 68, textAlign: 'right' }]}>Total</Text>
            </View>

            {items.map((it: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.td, { width: 24, color: '#64748B' }]}>{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tdItemName}>{it.product_name || `Product #${it.product_id}`}</Text>
                  <Text style={styles.tdItemSub}>
                    Base: {formatCurrency(it.base_price ?? it.price_with_tax ?? it.unit_price ?? 0, currency)} | GST {it.gst_rate || 0}% ({formatCurrency(it.tax_amount || 0, currency)})
                  </Text>
                </View>
                <Text style={[styles.td, { width: 48, textAlign: 'center' }]}>
                  {it.qty ?? it.quantity} {it.unit || 'PCS'}
                </Text>
                <Text style={[styles.td, { width: 58, textAlign: 'right' }]}>
                  {formatCurrency(it.price_with_tax ?? it.unit_price, currency)}
                </Text>
                <Text style={[styles.tdBold, { width: 68, textAlign: 'right' }]}>
                  {formatCurrency(it.line_total ?? it.total_amount, currency)}
                </Text>
              </View>
            ))}
          </View>

          {/* 4. Tax Breakdown Box */}
          <View style={styles.taxBox}>
            <Text style={styles.taxBoxTitle}>GST Tax Breakdown</Text>
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>Taxable Value:</Text>
              <Text style={styles.taxVal}>{formatCurrency(taxable, currency)}</Text>
            </View>
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>CGST (Central):</Text>
              <Text style={styles.taxVal}>{formatCurrency(cgst, currency)}</Text>
            </View>
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>SGST (State):</Text>
              <Text style={styles.taxVal}>{formatCurrency(sgst, currency)}</Text>
            </View>
            <View style={[styles.taxRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 4 }]}>
              <Text style={styles.taxLabelBold}>Total GST:</Text>
              <Text style={styles.taxValBold}>{formatCurrency(invoice.tax_amount || 0, currency)}</Text>
            </View>
          </View>

          {/* 5. Totals Box */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0, currency)}</Text>
            </View>
            {Number(invoice.discount_amount || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: '#16A34A' }]}>
                  -{formatCurrency(invoice.discount_amount, currency)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total_amount || 0, currency)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Paid Amount ({invoice.payment_method || 'CASH'})</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.paid_amount || 0, currency)}</Text>
            </View>
            {Number(invoice.remaining_amount || 0) > 0 && (
              <View style={[styles.totalRow, styles.balanceDueRow]}>
                <Text style={styles.balanceDueLabel}>Balance Due (Khata)</Text>
                <Text style={styles.balanceDueValue}>
                  {formatCurrency(invoice.remaining_amount, currency)}
                </Text>
              </View>
            )}
          </View>

          {/* 6. Terms & Footer */}
          <View style={styles.footerNote}>
            <Text style={styles.footerTermsTitle}>Terms & Conditions:</Text>
            <Text style={styles.footerTermsText}>
              • Goods once sold will be exchanged within 7 days with original invoice.
            </Text>
            <Text style={styles.footerTermsText}>
              • Thank you for shopping with Tulsi Mart! Visit again.
            </Text>
          </View>
        </AppCard>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <AppButton
            title="Print Invoice"
            variant="outline"
            onPress={handlePrint}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title="Share on WhatsApp"
            onPress={handleShareWhatsApp}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  shareHeaderBtn: {
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
  notFoundText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  invoicePaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  storeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandBadge: {
    backgroundColor: '#F57C00',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },
  storeAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  storeContact: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  metaValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F57C00',
    marginTop: 2,
  },
  metaLabelDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginTop: 2,
  },
  metaSub: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
  },
  badgePartial: {
    backgroundColor: '#FEF3C7',
  },
  badgeUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#166534',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  td: {
    fontSize: 12,
    color: '#334155',
  },
  tdBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tdItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tdItemSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  taxBox: {
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  taxBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  taxLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  taxVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  taxLabelBold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222222',
  },
  taxValBold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57C00',
  },
  totalsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  grandTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#CBD5E1',
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 8,
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F57C00',
  },
  balanceDueRow: {
    marginTop: 4,
  },
  balanceDueLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  balanceDueValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  footerNote: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 6,
  },
  footerTermsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  footerTermsText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
  },
});

export default InvoiceScreen;
