import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { productService, salesService, partnerService } from '../../services';
import { Product, Customer, Sale } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { ReceiptIcon, ShoppingCartIcon } from '../../components/branding/Icons';
import { formatCurrency } from '../../utils/formatters';

// Billing Module Components & Hooks
import {
  useBillingCart,
  BillingCartItem,
  BillCartItem,
  CustomerSelectorModal,
  PaymentMethodPicker,
  EditCartItemModal,
  BillReceiptModal,
  PaymentMode,
  SelectedCustomer,
} from '../../modules/billing';

type PosNavProp = NativeStackNavigationProp<RootStackParamList>;

export const PosBillingScreen: React.FC = () => {
  const navigation = useNavigation<PosNavProp>();
  const { colors, brandColors } = useTheme();

  // Cart Hook
  const {
    cart,
    addToCart,
    updateQuantity,
    updateUnitPrice,
    updateItemDiscount,
    removeFromCart,
    clearCart,
    subtotal,
    billDiscount,
    setBillDiscount,
    taxPercent,
    setTaxPercent,
    taxAmount,
    grandTotal,
    totalItemsCount,
  } = useBillingCart();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer>({
    type: 'walk_in',
    name: 'Walk-in Customer',
  });
  const [customerModalVisible, setCustomerModalVisible] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMode>('CASH');

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<BillingCartItem | null>(null);

  // Bill Receipt Modal State
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick inputs
  const [discountInput, setDiscountInput] = useState('');
  const [taxPercentInput, setTaxPercentInput] = useState('');

  // Load Products & Customers
  const loadInitialData = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const [prods, custs] = await Promise.all([
        productService.getProducts({ isActive: true, limit: 200 }).catch(() => []),
        partnerService.getCustomers().catch(() => []),
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) {
      console.warn('POS Catalog load error:', err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Extract Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const cat = p.category?.name || (typeof p.category === 'string' ? p.category : null) || p.store_type;
      if (cat) set.add(cat);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered Catalog
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.product_name && p.product_name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'ALL') return true;
      const cat = p.category?.name || (typeof p.category === 'string' ? p.category : null) || p.store_type;
      return cat === selectedCategory;
    });
  }, [products, search, selectedCategory]);

  // Quick-Add Customer Handler
  const handleQuickAddCustomer = async (name: string, phone: string): Promise<Customer | null> => {
    try {
      const created = await partnerService.createCustomer({
        name,
        phone,
        credit_limit: 10000,
        balance: 0,
      });
      setCustomers((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      Alert.alert('Customer Error', err.message || 'Could not register customer.');
      return null;
    }
  };

  // Edit Item Handler
  const handleSaveItemEdit = (
    productId: string | number,
    newPrice: number,
    newQty: number,
    discount: number
  ) => {
    updateUnitPrice(productId, newPrice);
    updateQuantity(productId, newQty);
    updateItemDiscount(productId, discount);
  };

  // Discount & Tax Sync
  const handleDiscountChange = (text: string) => {
    setDiscountInput(text);
    const num = parseFloat(text) || 0;
    setBillDiscount(num);
  };

  const handleTaxPercentChange = (text: string) => {
    setTaxPercentInput(text);
    const num = parseFloat(text) || 0;
    setTaxPercent(num);
  };

  // Handle Make Bill (Checkout)
  const handleMakeBill = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one product to make a bill.');
      return;
    }

    if (paymentMethod === 'DEBIT_CUSTOMER' && selectedCustomer.type === 'walk_in') {
      Alert.alert(
        'Debit Customer Required',
        'You selected Debit (Khata) payment. Please select a registered Debit Customer to attach this outstanding balance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select Customer', onPress: () => setCustomerModalVisible(true) },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const isDebit = paymentMethod === 'DEBIT_CUSTOMER';
      const paidAmount = isDebit ? 0 : grandTotal;
      const paymentStatus = isDebit ? 'PENDING' : 'PAID';

      const salePayload = {
        customer_id: selectedCustomer.type === 'debit_customer' ? selectedCustomer.id : null,
        customer_name: selectedCustomer.name || 'Walk-in Customer',
        customer_phone: selectedCustomer.phone,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        discount_amount: billDiscount,
        tax_amount: taxAmount,
        paid_amount: paidAmount,
        notes: isDebit ? `Debited to Khata of ${selectedCustomer.name}` : undefined,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount,
          total_price: item.total,
        })),
      };

      const created = await salesService.createSale(salePayload);

      // Present Receipt Modal
      setCompletedSale(created);
      setReceiptModalVisible(true);

      // Reset Form for next bill
      clearCart();
      setDiscountInput('');
      setTaxPercentInput('');
      setSelectedCustomer({ type: 'walk_in', name: 'Walk-in Customer' });
      setPaymentMethod('CASH');

      // Refresh customers so balance is up to date
      partnerService.getCustomers().then(setCustomers).catch(() => {});
    } catch (err: any) {
      Alert.alert('Billing Failed', err.message || 'Could not generate invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <Header
        title="Make Bill (POS)"
        subtitle="Fast retail billing & invoice generation"
        rightAction={{
          icon: <ReceiptIcon size={20} color={brandColors.primary} />,
          onPress: () => navigation.navigate('SalesList'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* 1. Customer Selection Card */}
        <Card style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Customer</Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                Counter walk-in or debit account
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.changeCustomerBtn,
                {
                  backgroundColor:
                    selectedCustomer.type === 'debit_customer'
                      ? brandColors.warningLight
                      : brandColors.primaryLight,
                },
              ]}
              onPress={() => setCustomerModalVisible(true)}
            >
              <Text
                style={[
                  styles.changeCustomerText,
                  {
                    color:
                      selectedCustomer.type === 'debit_customer'
                        ? brandColors.warning
                        : brandColors.primary,
                  },
                ]}
              >
                {selectedCustomer.type === 'debit_customer' ? '📒 Khata Account' : '👤 Walk-in'} ▾
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Customer Information Display */}
          <View
            style={[
              styles.customerInfoBar,
              {
                backgroundColor:
                  selectedCustomer.type === 'debit_customer'
                    ? brandColors.warningLight + '40'
                    : colors.surfaceSubtle,
                borderColor:
                  selectedCustomer.type === 'debit_customer' ? brandColors.warning : colors.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeCustName, { color: colors.textPrimary }]}>
                {selectedCustomer.name}
              </Text>
              {selectedCustomer.phone ? (
                <Text style={[styles.activeCustMeta, { color: colors.textMuted }]}>
                  📞 {selectedCustomer.phone}
                </Text>
              ) : null}
            </View>

            {selectedCustomer.type === 'debit_customer' ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Current Balance</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: brandColors.error }}>
                  {formatCurrency(selectedCustomer.balance || 0)}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        {/* 2. Payment Method Picker */}
        <Card style={styles.cardSection}>
          <PaymentMethodPicker
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            selectedCustomer={selectedCustomer}
            onOpenCustomerSelector={() => setCustomerModalVisible(true)}
          />
        </Card>

        {/* 3. Items In Cart (if any) */}
        {cart.length > 0 ? (
          <Card style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Billing Cart ({totalItemsCount} items)
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Tap price to override rate or discount
                </Text>
              </View>
              <TouchableOpacity onPress={clearCart}>
                <Text style={{ color: brandColors.error, fontSize: 12, fontWeight: '700' }}>
                  Clear Cart
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cart Line Items */}
            {cart.map((item) => (
              <BillCartItem
                key={String(item.product_id)}
                item={item}
                onUpdateQty={updateQuantity}
                onEditItem={setEditingItem}
                onRemove={removeFromCart}
              />
            ))}

            {/* Calculations & Discounts */}
            <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              {/* Subtotal */}
              <View style={styles.calcLine}>
                <Text style={[styles.calcLineLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.calcLineVal, { color: colors.textPrimary }]}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              {/* Discount and GST Inputs */}
              <View style={styles.extraInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputTinyLabel, { color: colors.textMuted }]}>Discount (₹)</Text>
                  <TextInput
                    style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="₹0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={discountInput}
                    onChangeText={handleDiscountChange}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputTinyLabel, { color: colors.textMuted }]}>GST / Tax (%)</Text>
                  <TextInput
                    style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="0%"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={taxPercentInput}
                    onChangeText={handleTaxPercentChange}
                  />
                </View>
              </View>

              {/* Tax Line if applicable */}
              {taxAmount > 0 ? (
                <View style={styles.calcLine}>
                  <Text style={[styles.calcLineLabel, { color: colors.textSecondary }]}>
                    Tax ({taxPercent}%)
                  </Text>
                  <Text style={[styles.calcLineVal, { color: colors.textPrimary }]}>
                    +{formatCurrency(taxAmount)}
                  </Text>
                </View>
              ) : null}

              {/* Bill Discount Line if applicable */}
              {billDiscount > 0 ? (
                <View style={styles.calcLine}>
                  <Text style={[styles.calcLineLabel, { color: brandColors.success }]}>
                    Bill Discount
                  </Text>
                  <Text style={[styles.calcLineVal, { color: brandColors.success }]}>
                    -{formatCurrency(billDiscount)}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              {/* Grand Total */}
              <View style={styles.calcLine}>
                <Text style={[styles.grandTotalLabel, { color: colors.textPrimary }]}>Grand Total</Text>
                <Text style={[styles.grandTotalVal, { color: brandColors.primary }]}>
                  {formatCurrency(grandTotal)}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* 4. Product Catalog Selection */}
        <Card style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add Products</Text>
            <Text style={[styles.catalogCount, { color: colors.textMuted }]}>
              {filteredProducts.length} available
            </Text>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search product name, SKU, or barcode..."
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

          {/* Category Filter Pills */}
          {categories.length > 2 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: active ? brandColors.primary : colors.surfaceSubtle,
                        borderColor: active ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          {/* Catalog Grid / List */}
          {loadingCatalog ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator color={brandColors.primary} size="small" />
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                Loading product catalog...
              </Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>📦</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14 }}>
                No Products Found
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Try another search keyword or add a new product from the Products tab.
              </Text>
            </View>
          ) : (
            <View style={styles.catalogGrid}>
              {filteredProducts.slice(0, 30).map((prod) => {
                const inCart = cart.find((item) => String(item.product_id) === String(prod.id));
                const price = Number(prod.selling_price || prod.pricing?.selling_price || 0);

                return (
                  <TouchableOpacity
                    key={String(prod.id)}
                    style={[
                      styles.productTile,
                      {
                        backgroundColor: inCart ? brandColors.primaryLight + '40' : colors.surfaceSubtle,
                        borderColor: inCart ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => addToCart(prod, 1)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tileHeader}>
                      <Text style={[styles.tileName, { color: colors.textPrimary }]} numberOfLines={2}>
                        {prod.product_name || prod.name}
                      </Text>
                      {inCart ? (
                        <View style={[styles.inCartBadge, { backgroundColor: brandColors.primary }]}>
                          <Text style={styles.inCartBadgeText}>{inCart.quantity}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={[styles.tileSku, { color: colors.textMuted }]}>
                      SKU: {prod.sku || 'N/A'} • {prod.unit || 'pcs'}
                    </Text>

                    <View style={styles.tileFooter}>
                      <Text style={[styles.tilePrice, { color: brandColors.primary }]}>
                        {formatCurrency(price)}
                      </Text>
                      <View style={[styles.addBtn, { backgroundColor: brandColors.primaryLight }]}>
                        <Text style={[styles.addBtnText, { color: brandColors.primary }]}>+ Add</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Floating Bottom Checkout Bar */}
      {cart.length > 0 ? (
        <View style={[styles.checkoutBar, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
          <View style={styles.checkoutBarInfo}>
            <Text style={[styles.checkoutBarLabel, { color: colors.textMuted }]}>
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • {paymentMethod}
            </Text>
            <Text style={[styles.checkoutBarTotal, { color: brandColors.primary }]}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.makeBillBtn, { backgroundColor: brandColors.primary }]}
            onPress={handleMakeBill}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.makeBillBtnText}>⚡ MAKE BILL</Text>
                <Text style={styles.makeBillBtnSub}>{formatCurrency(grandTotal)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Customer Selector Modal */}
      <CustomerSelectorModal
        visible={customerModalVisible}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelect={setSelectedCustomer}
        onQuickAddCustomer={handleQuickAddCustomer}
        onClose={() => setCustomerModalVisible(false)}
      />

      {/* Edit Cart Item Modal (Price & Quantity override) */}
      <EditCartItemModal
        visible={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItemEdit}
      />

      {/* Bill Receipt Modal (After bill is generated) */}
      <BillReceiptModal
        visible={receiptModalVisible}
        sale={completedSale}
        onClose={() => setReceiptModalVisible(false)}
        onNewBill={() => setReceiptModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 14,
    paddingBottom: 110,
    gap: 12,
  },
  cardSection: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  changeCustomerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  changeCustomerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeCustName: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeCustMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  calcLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  calcLineLabel: {
    fontSize: 13,
  },
  calcLineVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  extraInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  inputTinyLabel: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  catalogCount: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productTile: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tileName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  inCartBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  inCartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tileSku: {
    fontSize: 11,
    marginVertical: 4,
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tilePrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  addBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    elevation: 8,
  },
  checkoutBarInfo: {
    flex: 1,
  },
  checkoutBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutBarTotal: {
    fontSize: 20,
    fontWeight: '900',
  },
  makeBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  makeBillBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  makeBillBtnSub: {
    color: '#FFE4D6',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PosBillingScreen;
