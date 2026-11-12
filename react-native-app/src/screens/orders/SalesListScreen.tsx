import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
import { ReceiptIcon, ShoppingCartIcon } from '../../components/branding/Icons';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

// Billing Module
import {
  BillDateFilterBar,
  BillReceiptModal,
  BillDateFilter,
} from '../../modules/billing';

type SalesNavProp = NativeStackNavigationProp<RootStackParamList>;

const formatDateYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const SalesListScreen: React.FC = () => {
  const navigation = useNavigation<SalesNavProp>();
  const { colors, brandColors } = useTheme();

  const todayStr = useMemo(() => formatDateYMD(new Date()), []);

  // Default to showing today's bills
  const [dateFilter, setDateFilter] = useState<BillDateFilter>({
    type: 'today',
    dateStr: todayStr,
    label: 'Today',
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Selected Sale for thermal receipt modal
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const fetchSales = useCallback(async (filter: BillDateFilter) => {
    try {
      const params: any = { limit: 100 };

      if (filter.type === 'today' || filter.type === 'yesterday' || filter.type === 'custom') {
        if (filter.dateStr) {
          params.date = filter.dateStr;
        }
      } else if (filter.type === 'week') {
        if (filter.startDateStr && filter.endDateStr) {
          params.start_date = filter.startDateStr;
          params.end_date = filter.endDateStr;
        }
      }
      // 'all' does not pass date params

      const data = await salesService.getSales(params);
      setSales(data || []);
    } catch (err) {
      console.warn('Failed to fetch sales list:', err);
      setSales([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSales(dateFilter);
  }, [dateFilter, fetchSales]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales(dateFilter);
  };

  const handleFilterChange = (newFilter: BillDateFilter) => {
    setDateFilter(newFilter);
  };

  // Filter by search query (Invoice #, Customer Name, Customer Phone)
  const filteredSales = useMemo(() => {
    if (!search.trim()) return sales;
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      const inv = String(s.invoice_number || '').toLowerCase();
      const cname = String(s.customer_name || '').toLowerCase();
      const cphone = String(s.customer_phone || '').toLowerCase();
      return inv.includes(q) || cname.includes(q) || cphone.includes(q);
    });
  }, [sales, search]);

  // Aggregate stats for current list
  const summaryStats = useMemo(() => {
    const count = filteredSales.length;
    const totalAmount = filteredSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
    return { count, totalAmount };
  }, [filteredSales]);

  const renderPaymentBadge = (sale: Sale) => {
    const method = sale.payment_method?.toUpperCase();
    let label = sale.payment_method || 'CASH';
    let variant: 'primary' | 'success' | 'warning' | 'info' = 'info';

    if (method === 'DEBIT_CUSTOMER') {
      label = '📒 Khata / Debit';
      variant = 'warning';
    } else if (method === 'UPI') {
      label = '📱 UPI';
      variant = 'primary';
    } else if (method === 'CASH') {
      label = '💵 Cash';
      variant = 'success';
    } else if (method === 'BANK_TRANSFER' || method === 'CARD') {
      label = '🏦 Bank';
      variant = 'info';
    }

    return <Badge label={label} variant={variant} style={{ paddingHorizontal: 6 }} />;
  };

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const isPaid = item.payment_status === 'PAID';
    const isDebit = item.payment_method === 'DEBIT_CUSTOMER' || item.balance_amount && item.balance_amount > 0;

    return (
      <Card
        style={styles.saleCard}
        onPress={() => setSelectedSaleForReceipt(item)}
      >
        {/* Top: Invoice # and Date */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.invoiceNo, { color: colors.textPrimary }]}>
                #{item.invoice_number}
              </Text>
              {isPaid ? (
                <Badge label="PAID" variant="success" style={{ paddingHorizontal: 5 }} />
              ) : isDebit ? (
                <Badge label="DEBIT" variant="warning" style={{ paddingHorizontal: 5 }} />
              ) : (
                <Badge label={item.payment_status || 'PENDING'} variant="warning" style={{ paddingHorizontal: 5 }} />
              )}
            </View>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              🕒 {formatDateTime(item.created_at || item.sale_date)}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.totalAmount, { color: brandColors.primary }]}>
              {formatCurrency(item.total_amount)}
            </Text>
            {item.discount_amount && item.discount_amount > 0 ? (
              <Text style={{ color: brandColors.success, fontSize: 10, fontWeight: '700' }}>
                Saved {formatCurrency(item.discount_amount)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

        {/* Bottom: Customer & Payment Method */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.customerText, { color: colors.textPrimary }]} numberOfLines={1}>
              👤 {item.customer_name || 'Walk-in Customer'}
            </Text>
            {item.customer_phone ? (
              <Text style={[styles.phoneText, { color: colors.textMuted }]}>
                📞 {item.customer_phone}
              </Text>
            ) : null}
          </View>

          <View style={styles.footerRight}>
            {renderPaymentBadge(item)}
            <TouchableOpacity
              style={[styles.receiptBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={() => setSelectedSaleForReceipt(item)}
            >
              <Text style={{ fontSize: 11, color: brandColors.primary, fontWeight: '700' }}>
                View Bill 🧾
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <Header
        title="View Bills"
        subtitle={
          dateFilter.type === 'today'
            ? "Today's Invoices"
            : dateFilter.type === 'yesterday'
            ? "Yesterday's Invoices"
            : `Bills (${dateFilter.label})`
        }
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: <ShoppingCartIcon size={20} color={brandColors.primary} />,
          onPress: () => navigation.navigate('PosBilling'),
        }}
      />

      {/* Date Filter Bar: Today (default), Yesterday, Week, Custom Date, All */}
      <BillDateFilterBar
        currentFilter={dateFilter}
        onSelectFilter={handleFilterChange}
        summary={summaryStats}
      />

      {/* Search Bar for Live Filtering */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
        >
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search invoice number, customer name, phone..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={brandColors.primary} size="large" />
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>
            Loading bills for {dateFilter.label}...
          </Text>
        </View>
      ) : filteredSales.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon size={36} color={brandColors.primary} />}
          title={`No Bills Found for ${dateFilter.label}`}
          description={
            dateFilter.type === 'today'
              ? 'No bills have been created yet today. Create your first invoice using the Make Bill terminal.'
              : `There are no recorded bills for ${dateFilter.label}. Try selecting another date or viewing all bills.`
          }
          actionTitle={dateFilter.type === 'today' ? '⚡ Make First Bill Today' : 'Show All Bills'}
          onAction={() => {
            if (dateFilter.type === 'today') {
              navigation.navigate('PosBilling');
            } else {
              setDateFilter({ type: 'all', label: 'All Bills' });
            }
          }}
        />
      ) : (
        <FlatList
          data={filteredSales}
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

      {/* Full Thermal Invoice Receipt Modal */}
      <BillReceiptModal
        visible={Boolean(selectedSaleForReceipt)}
        sale={selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: {
    padding: 14,
    paddingBottom: 36,
  },
  saleCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNo: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    marginTop: 3,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  phoneText: {
    fontSize: 11,
    marginTop: 2,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default SalesListScreen;
