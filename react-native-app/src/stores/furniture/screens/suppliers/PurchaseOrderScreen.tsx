import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/themeColors';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppDropdown from '../../components/common/AppDropdown';
import SearchDropdown, { SearchDropdownItem } from '../../components/common/SearchDropdown';
import AppModal from '../../components/common/AppModal';
import AppIcon from '../../components/icons/AppIcon';
import OrderCardSkeleton from '../../components/skeletons/OrderCardSkeleton';
import EmptyState from '../../components/common/EmptyState';
import purchaseOrderApi from '../../services/purchaseOrderApi';
import storePrefixApi from '../../services/storePrefixApi';
import supplierApi from '../../services/supplierApi';
import apiClient from '../../../../api/apiClient';

const PAYMENT_METHODS = [
  { label: 'Bank Transfer (IMPS/NEFT)', value: 'BANK_TRANSFER' },
  { label: 'UPI / QR', value: 'UPI' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Cheque', value: 'CHEQUE' },
];

export const PurchaseOrderScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dropdown options
  const [suppliers, setSuppliers] = useState<SearchDropdownItem[]>([]);
  const [products, setProducts] = useState<SearchDropdownItem[]>([]);

  // Add Order Modal State
  const [addOrderModal, setAddOrderModal] = useState(false);
  const [orderId, setOrderId] = useState('TM_ORD_0001');
  const [selectedSupplier, setSelectedSupplier] = useState<SearchDropdownItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SearchDropdownItem | null>(null);
  const [quantity, setQuantity] = useState('10');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');
  const [purchasePrice, setPurchasePrice] = useState('0');
  const [expectedDate, setExpectedDate] = useState('3 Days');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Receive Order Modal State
  const [receiveModal, setReceiveModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [receivedQty, setReceivedQty] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [receivingOrder, setReceivingOrder] = useState(false);

  // Pay Modal State
  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payingOrder, setPayingOrder] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [orderRes, suppRes, prodRes, prefixRes] = await Promise.all([
        purchaseOrderApi.listOrders().catch(() => ({ items: [] })),
        supplierApi.listSuppliers().catch(() => []),
        apiClient.get('/products', { params: { limit: 100 } }).catch(() => ({ data: { items: [] } })),
        storePrefixApi.previewNextId('order').catch(() => ({ next_id: 'TM_ORD_0001' })),
      ]);

      setOrders(orderRes?.items || []);

      const mappedSuppliers = (suppRes || []).map((s: any) => ({
        id: s.id,
        title: s.name,
        subtitle: s.company_name || s.phone || 'Supplier',
      }));
      setSuppliers(mappedSuppliers);

      const prodItems = prodRes?.data?.items || [];
      const mappedProducts = prodItems.map((p: any) => ({
        id: p.id,
        title: p.name,
        subtitle: `Stock: ${p.current_stock || 0} ${p.unit || 'pcs'} | Cost: ₹${p.purchase_price || 0}`,
        extra: p,
      }));
      setProducts(mappedProducts);

      if (prefixRes?.next_id) {
        setOrderId(prefixRes.next_id);
      }
    } catch (e) {
      console.warn('Failed to load purchase orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // When a product is picked in Add Order, auto-populate current purchase price and unit
  const handleSelectProduct = (item: SearchDropdownItem) => {
    setSelectedProduct(item);
    if (item.extra) {
      setPurchasePrice(String(item.extra.purchase_price || 0));
      setPurchaseUnit(item.extra.unit || 'Piece');
    }
  };

  // Calculation for Add Order
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(purchasePrice) || 0;
  const calculatedTotal = parsedQty * parsedPrice;

  // Place Order
  const handlePlaceOrder = async () => {
    if (!selectedSupplier) {
      Alert.alert('Validation', 'Please select a supplier.');
      return;
    }
    if (!selectedProduct) {
      Alert.alert('Validation', 'Please select a product.');
      return;
    }
    if (parsedQty <= 0) {
      Alert.alert('Validation', 'Quantity must be greater than zero.');
      return;
    }

    try {
      setPlacingOrder(true);
      await purchaseOrderApi.placeOrder({
        supplier_id: Number(selectedSupplier.id),
        items: [
          {
            product_id: String(selectedProduct.id),
            product_name: selectedProduct.title,
            quantity: parsedQty,
            unit: purchaseUnit,
            purchase_price: parsedPrice, // isolated to this order
          },
        ],
        notes: `Expected: ${expectedDate}`,
      });

      Alert.alert('Order Placed', `Purchase Order ${orderId} placed successfully. Stock will increase upon receipt.`);
      setAddOrderModal(false);
      setSelectedProduct(null);
      setSelectedSupplier(null);
      setQuantity('10');
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || e?.message || 'Failed to place purchase order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Open Receive Modal
  const openReceiveModal = (order: any) => {
    setActiveOrder(order);
    setReceivedQty(String(order.quantity || 1));
    setBatchNumber(`LOT-${order.order_number}`);
    setReceiveModal(true);
  };

  // Confirm Order Receipt
  const handleConfirmReceive = async () => {
    if (!activeOrder) return;
    const rQty = parseFloat(receivedQty);
    if (isNaN(rQty) || rQty <= 0) {
      Alert.alert('Validation', 'Please enter a valid received quantity.');
      return;
    }

    try {
      setReceivingOrder(true);
      await purchaseOrderApi.receiveOrder(activeOrder.id, {
        received_quantity: rQty,
        batch_number: batchNumber.trim() || undefined,
        expiry_date: expiryDate.trim() ? `${expiryDate.trim()}T00:00:00Z` : undefined,
      });

      Alert.alert('Success', `Order ${activeOrder.order_number} received! Product inventory and supplier ledger updated.`);
      setReceiveModal(false);
      setActiveOrder(null);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || e?.message || 'Failed to receive order.');
    } finally {
      setReceivingOrder(false);
    }
  };

  // Open Pay Modal
  const openPayModal = (order: any) => {
    setActiveOrder(order);
    const balance = Math.max(0, (order.total_amount || 0) - (order.paid_amount || 0));
    setPayAmount(String(balance));
    setPayModal(true);
  };

  // Confirm Payment
  const handleConfirmPay = async () => {
    if (!activeOrder) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Validation', 'Please enter a valid payment amount.');
      return;
    }

    try {
      setPayingOrder(true);
      await purchaseOrderApi.payOrder(activeOrder.id, {
        amount: amt,
        payment_method: payMethod,
      });

      Alert.alert('Payment Recorded', `Payment of ${formatCurrency(amt)} recorded. Supplier ledger updated.`);
      setPayModal(false);
      setActiveOrder(null);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || e?.message || 'Failed to process payment.');
    } finally {
      setPayingOrder(false);
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const isReceived = item.order_status === 'Received';
    const isPaid = item.payment_status === 'Paid';
    const pendingBalance = Math.max(0, (item.total_amount || 0) - (item.paid_amount || 0));

    return (
      <AppCard style={styles.orderCard}>
        {/* Header: Order ID & Status Badge */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, isReceived ? styles.badgeSuccess : styles.badgeWarning]}>
              <Text style={[styles.badgeText, isReceived ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                {item.order_status}
              </Text>
            </View>
            <View style={[styles.statusBadge, isPaid ? styles.badgeSuccess : styles.badgeInfo]}>
              <Text style={[styles.badgeText, isPaid ? styles.badgeTextSuccess : styles.badgeTextInfo]}>
                {item.payment_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Supplier & Product Info */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supplier:</Text>
            <Text style={styles.infoValue}>{item.supplier_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Product:</Text>
            <Text style={styles.infoValue}>{item.product_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>{item.quantity} Units</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(item.total_amount)}</Text>
          </View>
          {pendingBalance > 0 ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Balance:</Text>
              <Text style={styles.pendingValue}>{formatCurrency(pendingBalance)}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions Footer */}
        <View style={styles.cardFooter}>
          {!isReceived ? (
            <TouchableOpacity
              style={styles.receiveBtn}
              onPress={() => openReceiveModal(item)}
            >
              <AppIcon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.receiveBtnText}>Receive Order</Text>
            </TouchableOpacity>
          ) : null}

          {pendingBalance > 0 ? (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => openPayModal(item)}
            >
              <AppIcon name="rupee" size={16} color={Colors.primaryOrange} />
              <Text style={styles.payBtnText}>Pay Supplier</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.settledBadge}>
              <Text style={styles.settledText}>Fully Paid</Text>
            </View>
          )}
        </View>
      </AppCard>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Purchase Orders"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => setAddOrderModal(true)}
          >
            <AppIcon name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addHeaderBtnText}>Add Order</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderOrderCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primaryOrange]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="orders"
                title="No Purchase Orders Yet"
                message="Place an order to restock your store inventory from suppliers."
                actionLabel="+ Create Purchase Order"
                onAction={() => setAddOrderModal(true)}
              />
            }
          />
        )}
      </View>

      {/* Add Purchase Order Modal */}
      <AppModal
        visible={addOrderModal}
        onClose={() => setAddOrderModal(false)}
        title="Place Purchase Order"
        footer={
          <AppButton
            title="Place Order"
            onPress={handlePlaceOrder}
            loading={placingOrder}
            icon={<AppIcon name="orders" size={18} color="#FFFFFF" />}
          />
        }
      >
        {/* Order ID */}
        <View style={styles.readOnlyRow}>
          <Text style={styles.readOnlyLabel}>Order ID (Auto):</Text>
          <Text style={styles.readOnlyVal}>{orderId}</Text>
        </View>

        {/* Select Seller / Supplier */}
        <SearchDropdown
          label="Select Seller / Supplier"
          items={suppliers}
          selectedItem={selectedSupplier}
          onSelect={setSelectedSupplier}
          placeholder="Choose supplier..."
          required
        />

        {/* Select Product */}
        <SearchDropdown
          label="Select Product"
          items={products}
          selectedItem={selectedProduct}
          onSelect={handleSelectProduct}
          placeholder="Choose product from your store..."
          required
        />

        {/* Quantity & Unit Row */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <AppInput
              label="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              required
            />
          </View>
          <View style={styles.col}>
            <AppInput
              label="Purchase Unit"
              value={purchaseUnit}
              onChangeText={setPurchaseUnit}
            />
          </View>
        </View>

        {/* Purchase Price (Editable per order without altering master catalog price) */}
        <AppInput
          label="Purchase Price per Unit (with Tax)"
          keyboardType="numeric"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          leftIcon={<Text style={styles.rupeePrefix}>₹</Text>}
          required
        />
        <Text style={styles.noteText}>
          * Editing the purchase price here will NOT alter the master product price.
        </Text>

        {/* Expected Delivery Date */}
        <AppInput
          label="Expected Delivery Date"
          placeholder="e.g. 2026-11-25 or 3 Days"
          value={expectedDate}
          onChangeText={setExpectedDate}
        />

        {/* Live Order Calculation Summary */}
        <View style={styles.calculationBox}>
          <Text style={styles.calcTitle}>Order Calculation</Text>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Quantity × Price:</Text>
            <Text style={styles.calcVal}>{parsedQty} × ₹{parsedPrice.toFixed(2)}</Text>
          </View>
          <View style={[styles.calcRow, styles.calcTotalRow]}>
            <Text style={styles.calcTotalLabel}>Total Order Amount:</Text>
            <Text style={styles.calcTotalVal}>{formatCurrency(calculatedTotal)}</Text>
          </View>
        </View>
      </AppModal>

      {/* Receive Order Modal */}
      <AppModal
        visible={receiveModal}
        onClose={() => setReceiveModal(false)}
        title="Receive Purchase Order"
        footer={
          <AppButton
            title="Confirm Receipt & Update Stock"
            onPress={handleConfirmReceive}
            loading={receivingOrder}
            icon={<AppIcon name="check" size={18} color="#FFFFFF" />}
          />
        }
      >
        {activeOrder ? (
          <>
            <View style={styles.receiveSummaryCard}>
              <Text style={styles.recOrderNo}>{activeOrder.order_number}</Text>
              <Text style={styles.recItemText}>Product: {activeOrder.product_name}</Text>
              <Text style={styles.recItemText}>Supplier: {activeOrder.supplier_name}</Text>
              <Text style={styles.recItemText}>Ordered Qty: {activeOrder.quantity} Units</Text>
              <Text style={styles.recItemText}>Total Amount: {formatCurrency(activeOrder.total_amount)}</Text>
            </View>

            <AppInput
              label="Received Quantity"
              placeholder="e.g. 20"
              keyboardType="numeric"
              value={receivedQty}
              onChangeText={setReceivedQty}
              required
            />

            <AppInput
              label="Batch / Lot Number"
              placeholder="e.g. LOT-2026-NOV"
              value={batchNumber}
              onChangeText={setBatchNumber}
            />

            <AppInput
              label="Expiry Date (if applicable)"
              placeholder="YYYY-MM-DD (e.g. 2027-05-15)"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />

            <Text style={styles.receiveNotice}>
              Upon confirmation, inventory stock will increase, a batch record will be logged, and supplier balance will be updated in the ledger.
            </Text>
          </>
        ) : null}
      </AppModal>

      {/* Pay Order Modal */}
      <AppModal
        visible={payModal}
        onClose={() => setPayModal(false)}
        title="Pay Supplier Order"
        footer={
          <AppButton
            title="Record Payment"
            onPress={handleConfirmPay}
            loading={payingOrder}
            icon={<AppIcon name="rupee" size={18} color="#FFFFFF" />}
          />
        }
      >
        {activeOrder ? (
          <>
            <View style={styles.receiveSummaryCard}>
              <Text style={styles.recOrderNo}>{activeOrder.order_number}</Text>
              <Text style={styles.recItemText}>Supplier: {activeOrder.supplier_name}</Text>
              <Text style={styles.recItemText}>Order Total: {formatCurrency(activeOrder.total_amount)}</Text>
              <Text style={styles.recItemText}>Already Paid: {formatCurrency(activeOrder.paid_amount || 0)}</Text>
              <Text style={[styles.recItemText, { fontWeight: '700', color: Colors.error }]}>
                Remaining Balance: {formatCurrency(Math.max(0, (activeOrder.total_amount || 0) - (activeOrder.paid_amount || 0)))}
              </Text>
            </View>

            <AppInput
              label="Payment Amount"
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
              leftIcon={<Text style={styles.rupeePrefix}>₹</Text>}
              required
            />

            <AppDropdown
              label="Payment Method"
              items={PAYMENT_METHODS}
              selectedValue={payMethod}
              onSelect={(val) => setPayMethod(String(val))}
            />
          </>
        ) : null}
      </AppModal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  skeletonContainer: {
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  orderCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkText,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeInfo: {
    backgroundColor: '#E0F2FE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#15803D',
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeTextInfo: {
    color: '#0369A1',
  },
  cardBody: {
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkText,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkText,
  },
  pendingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  receiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.iconColors.orders,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  receiveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.primaryOrange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payBtnText: {
    color: Colors.primaryOrange,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  settledBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  settledText: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  readOnlyLabel: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  readOnlyVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  rupeePrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  noteText: {
    fontSize: 11,
    color: Colors.secondaryText,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 12,
  },
  calculationBox: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  calcTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkOrange,
    marginBottom: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calcLabel: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkText,
  },
  calcTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    paddingTop: 6,
    marginTop: 4,
  },
  calcTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkText,
  },
  calcTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  receiveSummaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  recOrderNo: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: 4,
  },
  recItemText: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  receiveNotice: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
    marginTop: 8,
  },
});

export default PurchaseOrderScreen;
