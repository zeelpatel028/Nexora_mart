import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { salesService } from '../../services';
import { Sale } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type SaleDetailRouteProp = RouteProp<RootStackParamList, 'SaleDetail'>;

export const SaleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SaleDetailRouteProp>();
  const { saleId } = route.params;
  const { colors, brandColors } = useTheme();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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

