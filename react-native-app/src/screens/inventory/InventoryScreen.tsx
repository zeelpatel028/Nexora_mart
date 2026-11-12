import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { inventoryService } from '../../services';
import { InventoryItem, StockMovement } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { formatDate, formatDateTime, formatQuantity } from '../../utils/formatters';

type InventoryNavProp = NativeStackNavigationProp<RootStackParamList>;

export const InventoryScreen: React.FC = () => {
  const navigation = useNavigation<InventoryNavProp>();
  const { colors, brandColors } = useTheme();

  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'expiring'>('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const search = '';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'levels') {
        let items: InventoryItem[] = [];
        if (filterMode === 'low') {
          items = await inventoryService.getLowStockAlerts();
        } else if (filterMode === 'expiring') {
          items = await inventoryService.getExpiryAlerts();
        } else {
          items = await inventoryService.getInventory(search.trim() || undefined);
        }
        setInventory(items);
      } else {
        const movs = await inventoryService.getMovements(undefined, 50);
        setMovements(movs);
      }
    } catch (err) {
      console.warn('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, filterMode, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderStockItem = ({ item }: { item: InventoryItem }) => {
    const isOut = item.quantity <= 0;
    const isLow = item.quantity <= (item.min_stock_level || 5);

    return (
      <Card style={styles.stockCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={[styles.skuText, { color: colors.textMuted }]}>
              SKU: {item.sku} {item.batch_number ? `• Batch: ${item.batch_number}` : ''}
            </Text>
          </View>

          <Badge
            label={formatQuantity(item.quantity, item.unit)}
            variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
          />
        </View>

        {item.expiry_date && (
          <View style={styles.expiryRow}>
            <Text style={[styles.expiryText, { color: item.is_expired ? brandColors.error : brandColors.warning }]}>
              ⏳ Expiry: {formatDate(item.expiry_date)}
            </Text>
          </View>
        )}

        <View style={[styles.actionsRow, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.minStock, { color: colors.textSecondary }]}>
            Min Alert: {item.min_stock_level || 5} {item.unit}
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: brandColors.primaryLight }]}
              onPress={() => navigation.navigate('StockInward', { productId: item.product_id })}
            >
              <Text style={[styles.smallBtnText, { color: brandColors.primary }]}>+ Stock In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#F1F5F9' }]}
              onPress={() => navigation.navigate('StockAdjustment', { productId: item.product_id })}
            >
              <Text style={[styles.smallBtnText, { color: colors.textPrimary }]}>Adjust</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const renderMovementItem = ({ item }: { item: StockMovement }) => {
    const isPositive = ['IN', 'PURCHASE'].includes(item.movement_type);

    return (
      <Card style={styles.movementCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.productName, { color: colors.textPrimary }]}>
              {item.product_name || `Product #${item.product_id}`}
            </Text>
            <Text style={[styles.skuText, { color: colors.textMuted }]}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>

          <Badge
            label={`${isPositive ? '+' : '-'}${item.quantity} (${item.movement_type})`}
            variant={isPositive ? 'success' : 'danger'}
          />
        </View>

        {item.reason || item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            Note: {item.reason || item.notes}
          </Text>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Inventory & Stock"
        subtitle="Live tracking & physical audit"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '📥',
          onPress: () => navigation.navigate('StockInward', {}),
        }}
      />

      {/* Tabs: Levels vs Movement Audit */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('levels')}
          style={[
            styles.tab,
            activeTab === 'levels' && { borderBottomColor: brandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'levels' ? brandColors.primary : colors.textSecondary },
              activeTab === 'levels' && { fontWeight: '700' },
            ]}
          >
            📋 Stock Levels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('movements')}
          style={[
            styles.tab,
            activeTab === 'movements' && { borderBottomColor: brandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'movements' ? brandColors.primary : colors.textSecondary },
              activeTab === 'movements' && { fontWeight: '700' },
            ]}
          >
            📜 Movement Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips for Stock Levels */}
      {activeTab === 'levels' && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterMode('all')}
            style={[
              styles.chip,
              {
                backgroundColor: filterMode === 'all' ? brandColors.primary : colors.surface,
                borderColor: filterMode === 'all' ? brandColors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: filterMode === 'all' ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
              All Inventory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterMode('low')}
            style={[
              styles.chip,
              {
                backgroundColor: filterMode === 'low' ? brandColors.error : colors.surface,
                borderColor: filterMode === 'low' ? brandColors.error : colors.border,
              },
            ]}
          >
            <Text style={{ color: filterMode === 'low' ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
              ⚠️ Low Stock
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterMode('expiring')}
            style={[
              styles.chip,
              {
                backgroundColor: filterMode === 'expiring' ? brandColors.warning : colors.surface,
                borderColor: filterMode === 'expiring' ? brandColors.warning : colors.border,
              },
            ]}
          >
            <Text style={{ color: filterMode === 'expiring' ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
              ⏳ Expiry Alerts
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <Loader message="Loading inventory status..." />
      ) : activeTab === 'levels' ? (
        inventory.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Inventory Records"
            description={filterMode === 'low' ? 'No low stock warnings! Your inventory is healthy.' : 'No stock items match your filter.'}
            actionTitle="Record Stock In"
            onAction={() => navigation.navigate('StockInward', {})}
          />
        ) : (
          <FlatList
            data={inventory}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderStockItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[brandColors.primary]}
              />
            }
          />
        )
      ) : movements.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No Movement Logs"
          description="Inventory movements, sales deductions, and adjustments will appear here."
        />
      ) : (
        <FlatList
          data={movements}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMovementItem}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stockCard: {
    padding: 14,
    marginBottom: 10,
  },
  movementCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  skuText: {
    fontSize: 11,
  },
  expiryRow: {
    marginTop: 6,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  minStock: {
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default InventoryScreen;

