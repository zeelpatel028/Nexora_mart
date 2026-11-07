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
import { purchaseService } from '../../services';
import { Purchase } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { TruckIcon } from '../../components/branding/Icons';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type PurchaseNavProp = NativeStackNavigationProp<RootStackParamList>;

export const PurchaseListScreen: React.FC = () => {
  const navigation = useNavigation<PurchaseNavProp>();
  const { colors, brandColors } = useTheme();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchases = useCallback(async () => {
    try {
      const data = await purchaseService.getPurchases({ limit: 50 });
      setPurchases(data);
    } catch (err) {
      console.warn('Failed to load purchases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPurchases();
  };

  const renderPurchaseItem = ({ item }: { item: Purchase }) => {
    return (
      <Card style={styles.purchaseCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.invoiceNo, { color: colors.textPrimary }]}>
              PO #{item.invoice_number}
            </Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>

          <Badge
            label={item.payment_status || 'PAID'}
            variant={item.payment_status === 'PAID' ? 'success' : 'warning'}
          />
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.supplierText, { color: colors.textSecondary }]}>
              🏢 {item.supplier_name || 'Direct Supplier'}
            </Text>
            <Text style={[styles.methodText, { color: colors.textMuted }]}>
              Payment: {item.payment_method}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.totalAmount, { color: brandColors.primary }]}>
              {formatCurrency(item.total_amount)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Supplier Purchases"
        subtitle={`${purchases.length} inward stock orders`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '➕',
          onPress: () => navigation.navigate('CreatePurchase'),
        }}
      />

      {loading ? (
        <Loader message="Loading purchase records..." />
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={<TruckIcon size={32} color={brandColors.primary} />}
          title="No Purchase Orders"
          description="Record deliveries from suppliers to automatically restock your inventory."
          actionTitle="Create Purchase Order"
          onAction={() => navigation.navigate('CreatePurchase')}
        />
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPurchaseItem}
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
  purchaseCard: {
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
  supplierText: {
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

export default PurchaseListScreen;

