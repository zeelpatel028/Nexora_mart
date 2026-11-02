import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { reportService } from '../../services';
import { InventoryValuation } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

export const InventoryValuationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadValuation = useCallback(async () => {
    try {
      const data = await reportService.getInventoryValuation();
      setValuation(data);
    } catch (err) {
      console.warn('Failed to load valuation:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadValuation();
  }, [loadValuation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadValuation();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Inventory Valuation" showBack onBack={() => navigation.goBack()} />
        <Loader message="Calculating asset costs and retail margin..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Inventory Valuation"
        subtitle="Current asset worth & retail yield"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[brandColors.primary]}
          />
        }
      >
        {/* Retail Asset Value Card */}
        <Card style={styles.primaryCard}>
          <Text style={[styles.cardTag, { color: colors.textSecondary }]}>Total Retail Value</Text>
          <Text style={[styles.mainVal, { color: brandColors.primary }]}>
            {formatCurrency(valuation?.total_retail_value)}
          </Text>
          <Text style={[styles.subNote, { color: colors.textMuted }]}>
            Total anticipated sales revenue based on current catalog selling prices
          </Text>
        </Card>

        {/* Detailed Breakdown Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Valuation Audit</Text>

          <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Stock Cost Value</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatCurrency(valuation?.total_cost_value)}
            </Text>
          </View>

          <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Gross Profit Potential</Text>
            <Text style={[styles.metricVal, { color: brandColors.success }]}>
              +{formatCurrency(valuation?.potential_margin_value)}
            </Text>
          </View>

          <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Estimated Profit Margin</Text>
            <Badge
              label={`${valuation?.margin_percentage?.toFixed(1) || 0}%`}
              variant="success"
            />
          </View>

          <View style={[styles.metricRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Catalog SKU Count</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {valuation?.total_items ?? 0} active products
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Physical Units in Store</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {valuation?.total_units?.toFixed(1) ?? 0} units
            </Text>
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
  primaryCard: {
    padding: 20,
    marginBottom: 14,
  },
  cardTag: {
    fontSize: 13,
    fontWeight: '600',
  },
  mainVal: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 6,
  },
  subNote: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default InventoryValuationScreen;

