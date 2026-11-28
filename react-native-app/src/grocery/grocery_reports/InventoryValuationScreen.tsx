import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '../grocery_components/hooks/useFocusEffect';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { reportService, productService } from '../grocery_components/services';
import { InventoryValuation, Product } from '../../api/types';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import Badge from '../grocery_components/components/common/Badge';
import TableSkeleton from '../grocery_components/components/skeletons/TableSkeleton';
import AppIcon from '../grocery_components/components/icons/AppIcon';
import { formatCurrency } from '../grocery_components/utils/formatters';

export const InventoryValuationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, brandColors, isDark } = useTheme();

  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadValuation = useCallback(async () => {
    try {
      const [valRes, prodList] = await Promise.all([
        reportService.getInventoryValuation().catch(() => null),
        productService.getProducts({ limit: 100 }).catch(() => []),
      ]);
      setValuation(valRes);
      setProducts(Array.isArray(prodList) ? prodList : []);
    } catch (err) {
      console.warn('Failed to load valuation:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadValuation();
    }, [loadValuation])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadValuation();
  };

  const productRows = useMemo(() => {
    return products
      .map((p: any) => {
        const stock = Number(p.available_stock ?? p.current_stock ?? 0);
        const costRate = Number(p.purchase_price_with_tax ?? p.purchase_price ?? 0);
        const sellRate = Number(p.selling_price_with_tax ?? p.selling_price ?? 0);
        const costTotal = stock * costRate;
        const retailTotal = stock * sellRate;
        return {
          id: String(p.id),
          name: p.name || p.product_name || 'Item',
          code: p.product_code || p.sku || '',
          unit: p.selling_unit || p.unit || 'pcs',
          stock,
          costTotal,
          retailTotal,
          profitTotal: retailTotal - costTotal,
          isLow: Boolean(p.is_low_stock),
        };
      })
      .sort((a, b) => b.retailTotal - a.retailTotal);
  }, [products]);

  const summary = useMemo(() => {
    if (valuation && Number(valuation.total_items || 0) > 0) return valuation;
    const cost = productRows.reduce((s, r) => s + r.costTotal, 0);
    const retail = productRows.reduce((s, r) => s + r.retailTotal, 0);
    const units = productRows.reduce((s, r) => s + r.stock, 0);
    const margin = retail - cost;
    return {
      total_items: productRows.length,
      total_units: units,
      total_cost_value: cost,
      total_retail_value: retail,
      potential_margin_value: margin,
      margin_percentage: retail > 0 ? (margin / retail) * 100 : 0,
    };
  }, [valuation, productRows]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Inventory Valuation"
        subtitle="Real-time Stock Cost vs Retail Assets"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={{ padding: 16 }}>
          <TableSkeleton rows={6} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primaryOrange]}
            />
          }
        >
          {/* Retail Asset Hero Card */}
          <AppCard style={styles.primaryCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.cardTag, { color: colors.textSecondary }]}>Total Retail Stock Value</Text>
              <Badge label={`${Number(summary.margin_percentage || 0).toFixed(1)}% Margin`} variant="success" />
            </View>
            <Text style={[styles.mainVal, { color: brandColors.primaryOrange }]}>
              {formatCurrency(summary.total_retail_value)}
            </Text>
            <Text style={[styles.subNote, { color: colors.textMuted }]}>
              Across {summary.total_items} products ({Number(summary.total_units || 0).toFixed(1)} total units)
            </Text>
          </AppCard>

          {/* Valuation Summary Audit */}
          <AppCard>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Valuation Audit</Text>
            <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Purchase Cost Value</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(summary.total_cost_value)}
              </Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Potential Gross Profit</Text>
              <Text style={[styles.metricVal, { color: '#16A34A' }]}>
                +{formatCurrency(summary.potential_margin_value)}
              </Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active SKUs</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{summary.total_items}</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Physical Stock Units</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {Number(summary.total_units || 0).toFixed(1)}
              </Text>
            </View>
          </AppCard>

          {/* Per-Product Breakdown */}
          <Text style={[styles.listHeading, { color: colors.textPrimary }]}>
            Product-Wise Valuation ({productRows.length})
          </Text>

          {productRows.length === 0 ? (
            <AppCard>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
                No grocery inventory products found.
              </Text>
            </AppCard>
          ) : (
            productRows.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
                <AppCard style={styles.prodRowCard}>
                  <View style={styles.prodRowTop}>
                    <View style={[styles.prodIconBox, { backgroundColor: isDark ? '#3D240E' : '#FFF3E0' }]}>
                      <AppIcon name="Package" size={18} color={brandColors.primaryOrange} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.prodName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.prodMeta, { color: colors.textSecondary }]}>
                        {item.code ? `${item.code} • ` : ''}Stock: {item.stock} {item.unit}
                      </Text>
                    </View>
                    <Badge
                      label={item.isLow ? 'Low Stock' : 'In Stock'}
                      variant={item.isLow ? 'warning' : 'success'}
                    />
                  </View>

                  <View style={[styles.prodRowValues, { borderTopColor: colors.borderLight }]}>
                    <View>
                      <Text style={[styles.valLabel, { color: colors.textMuted }]}>Cost Value</Text>
                      <Text style={[styles.valNum, { color: colors.textPrimary }]}>
                        {formatCurrency(item.costTotal)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.valLabel, { color: colors.textMuted }]}>Retail Value</Text>
                      <Text style={[styles.valNum, { color: brandColors.primaryOrange }]}>
                        {formatCurrency(item.retailTotal)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.valLabel, { color: colors.textMuted }]}>Est. Margin</Text>
                      <Text style={[styles.valNum, { color: '#16A34A' }]}>
                        +{formatCurrency(item.profitTotal)}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  primaryCard: { padding: 18, marginBottom: 14 },
  cardTag: { fontSize: 13, fontWeight: '700' },
  mainVal: { fontSize: 30, fontWeight: '900', marginVertical: 6 },
  subNote: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  metricLabel: { fontSize: 13.5, fontWeight: '500' },
  metricVal: { fontSize: 15, fontWeight: '800' },
  listHeading: { fontSize: 15, fontWeight: '800', marginTop: 8, marginBottom: 10 },
  prodRowCard: { marginBottom: 10, padding: 14 },
  prodRowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prodIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  prodName: { fontSize: 14.5, fontWeight: '700' },
  prodMeta: { fontSize: 12, marginTop: 2 },
  prodRowValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  valLabel: { fontSize: 11, fontWeight: '600' },
  valNum: { fontSize: 13.5, fontWeight: '800', marginTop: 2 },
});

export default InventoryValuationScreen;
