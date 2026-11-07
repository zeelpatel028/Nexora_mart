import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { salesService } from '../../services';
import { Sale } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { ReceiptIcon, ShoppingCartIcon } from '../../components/branding/Icons';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type SalesNavProp = NativeStackNavigationProp<RootStackParamList>;

export const SalesListScreen: React.FC = () => {
  const navigation = useNavigation<SalesNavProp>();
  const { colors, brandColors } = useTheme();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSales = useCallback(async () => {
    try {
      const data = await salesService.getSales({ limit: 50 });
      setSales(data);
    } catch (err) {
      console.warn('Failed to load sales list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSales();
  };

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const isPaid = item.payment_status === 'PAID';

    return (
      <Card
        style={styles.saleCard}
        onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.invoiceNo, { color: colors.textPrimary }]}>
              #{item.invoice_number}
            </Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>

          <Badge
            label={item.payment_status || 'PAID'}
            variant={isPaid ? 'success' : 'warning'}
          />
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.customerText, { color: colors.textSecondary }]}>
              👤 {item.customer_name || 'Walk-in Customer'}
            </Text>
            <Text style={[styles.methodText, { color: colors.textMuted }]}>
              Payment: {item.payment_method}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.totalAmount, { color: brandColors.primary }]}>
              {formatCurrency(item.total_amount)}
            </Text>
            {item.discount_amount > 0 && (
              <Text style={{ color: brandColors.success, fontSize: 11 }}>
                Discount: -{formatCurrency(item.discount_amount)}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Sales Invoices"
        subtitle={`${sales.length} completed transactions`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: <ShoppingCartIcon size={20} color={brandColors.primary} />,
          onPress: () => navigation.navigate('PosBilling'),
        }}
      />

      {loading ? (
        <Loader message="Loading sales invoices..." />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon size={32} color={brandColors.primary} />}
          title="No Sales Invoices Yet"
          description="Invoices created via the POS billing terminal will appear here."
          actionTitle="Open POS Terminal"
          onAction={() => navigation.navigate('PosBilling')}
        />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  saleCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceNo: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  methodText: {
    fontSize: 11,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
  },
});

export default SalesListScreen;

