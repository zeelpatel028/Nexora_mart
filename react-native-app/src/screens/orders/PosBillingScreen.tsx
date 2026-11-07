import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { productService, salesService, partnerService } from '../../services';
import { Product, Customer, Sale } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ReceiptIcon } from '../../components/branding/Icons';
import { formatCurrency } from '../../utils/formatters';

type PosNavProp = NativeStackNavigationProp<RootStackParamList>;

interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total: number;
}

const PAYMENT_METHODS = [
  { id: 'CASH', label: '💵 Cash' },
  { id: 'CARD', label: '💳 Card' },
  { id: 'UPI', label: '📱 UPI' },
  { id: 'BANK_TRANSFER', label: '🏦 Bank' },
];

export const PosBillingScreen: React.FC = () => {
  const navigation = useNavigation<PosNavProp>();
  const { colors, brandColors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountAmount, setDiscountAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [prods, custs] = await Promise.all([
        productService.getProducts({ isActive: true, limit: 100 }),
        partnerService.getCustomers().catch(() => []),
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) {
      console.warn('Failed to load POS catalog:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product_id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        const newQty = copy[idx].quantity + 1;
        copy[idx] = {
          ...copy[idx],
          quantity: newQty,
          total: newQty * copy[idx].unit_price,
        };
        return copy;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          unit_price: Number(product.selling_price),
          quantity: 1,
          total: Number(product.selling_price),
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unit_price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = Number(discountAmount || 0);
  const tax = Number(taxAmount || 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before checkout.');
      return;
    }

    setSubmitting(true);
    try {
      const sale = await salesService.createSale({
        customer_id: selectedCustomerId,
        payment_method: paymentMethod,
        discount_amount: discount,
        tax_amount: tax,
        paid_amount: grandTotal,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      setLastCompletedSale(sale);
      setCart([]);
      setDiscountAmount('');
      setTaxAmount('');
      setCheckoutModalVisible(true);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Error creating sales order.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="POS Billing Terminal"
        subtitle="Fast multi-category checkout"
        rightAction={{
          icon: <ReceiptIcon size={20} color={brandColors.primary} />,
          onPress: () => navigation.navigate('SalesList'),
        }}
      />

      {/* Cart Summary Bar at Top if items exist */}
      {cart.length > 0 && (
        <View style={[styles.cartBanner, { backgroundColor: brandColors.primary }]}>
          <Text style={styles.cartBannerText}>
            Cart: {cart.length} item(s) • Total: {formatCurrency(grandTotal)}
          </Text>
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={handleCheckout}
            disabled={submitting}
          >
            <Text style={styles.payNowText}>
              {submitting ? 'Processing...' : '⚡ CHECKOUT'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer & Payment Bar */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Customer & Payment</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setSelectedCustomerId(null)}
              style={[
                styles.custChip,
                {
                  backgroundColor: selectedCustomerId === null ? brandColors.primary : colors.surfaceSubtle,
                  borderColor: selectedCustomerId === null ? brandColors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.custText,
                  { color: selectedCustomerId === null ? '#FFFFFF' : colors.textPrimary, fontWeight: selectedCustomerId === null ? '700' : '500' },
                ]}
              >
                Walk-in Customer
              </Text>
            </TouchableOpacity>

            {customers.map((c) => {
              const active = selectedCustomerId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCustomerId(c.id)}
                  style={[
                    styles.custChip,
                    {
                      backgroundColor: active ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: active ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.custText,
                      { color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    👤 {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Payment Method Selector */}
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethod(pm.id)}
                  style={[
                    styles.payChip,
                    {
                      backgroundColor: isSelected ? brandColors.primaryLight : colors.surfaceSubtle,
                      borderColor: isSelected ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.payChipText,
                      { color: isSelected ? brandColors.primary : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Current Cart Items */}
        {cart.length > 0 && (
          <Card>
            <View style={styles.cartHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                Items in Cart ({cart.length})
              </Text>
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={{ color: brandColors.error, fontSize: 12, fontWeight: '700' }}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            {cart.map((item) => (
              <View key={item.product_id} style={[styles.cartItemRow, { borderBottomColor: colors.borderLight }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cartItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cartItemSub, { color: colors.textMuted }]}>
                    {formatCurrency(item.unit_price)} / {item.unit}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.surfaceSubtle }]}
                    onPress={() => updateQuantity(item.product_id, -1)}
                  >
                    <Text style={{ fontSize: 16, color: colors.textPrimary }}>-</Text>
                  </TouchableOpacity>

                  <Text style={[styles.qtyVal, { color: colors.textPrimary }]}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: brandColors.primaryLight }]}
                    onPress={() => updateQuantity(item.product_id, 1)}
                  >
                    <Text style={{ fontSize: 16, color: brandColors.primary, fontWeight: 'bold' }}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.itemTotal, { color: brandColors.primary }]}>
                  {formatCurrency(item.total)}
                </Text>

                <TouchableOpacity
                  onPress={() => removeFromCart(item.product_id)}
                  style={{ marginLeft: 8 }}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Calculations */}
            <View style={[styles.calcBox, { borderTopColor: colors.borderLight }]}>
              <View style={styles.calcRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Subtotal</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{formatCurrency(subtotal)}</Text>
              </View>

              <View style={styles.discountRow}>
                <TextInput
                  style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Discount ($)"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="numeric"
                  value={discountAmount}
                  onChangeText={setDiscountAmount}
                />
                <TextInput
                  style={[styles.smallInput, { borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Tax ($)"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="numeric"
                  value={taxAmount}
                  onChangeText={setTaxAmount}
                />
              </View>

              <View style={[styles.calcRow, { marginTop: 8 }]}>
                <Text style={[styles.grandLabel, { color: colors.textPrimary }]}>Grand Total</Text>
                <Text style={[styles.grandValue, { color: brandColors.primary }]}>
                  {formatCurrency(grandTotal)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Catalog Browser to Add Items */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add From Catalog</Text>
          
          <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}>
            <Text style={{ marginRight: 6 }}>🔍</Text>
            <TextInput
              style={[styles.searchTextInput, { color: colors.textPrimary }]}
              placeholder="Search product to add..."
              placeholderTextColor={colors.textPlaceholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.prodGrid}>
            {filteredProducts.slice(0, 24).map((p) => {
              const inCart = cart.find((item) => item.product_id === p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.prodTile,
                    {
                      backgroundColor: inCart ? brandColors.primaryLight + '50' : colors.surfaceSubtle,
                      borderColor: inCart ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => addToCart(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tileName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <View style={styles.tileFooter}>
                    <Text style={[styles.tilePrice, { color: brandColors.primary }]}>
                      {formatCurrency(p.selling_price)}
                    </Text>
                    {inCart && (
                      <Badge label={`x${inCart.quantity}`} variant="primary" style={{ paddingHorizontal: 5 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      {/* Checkout Success Modal / Receipt */}
      <Modal
        visible={checkoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.receiptIcon}>🎉</Text>
            <Text style={[styles.receiptTitle, { color: colors.textPrimary }]}>Sale Completed!</Text>
            <Text style={[styles.receiptInvoice, { color: brandColors.primary }]}>
              Invoice #{lastCompletedSale?.invoice_number}
            </Text>

            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.textSecondary }}>Total Amount Paid:</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 16 }}>
                {formatCurrency(lastCompletedSale?.total_amount)}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.textSecondary }}>Payment Method:</Text>
              <Badge label={lastCompletedSale?.payment_method || 'CASH'} variant="info" />
            </View>

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.textSecondary }}>Customer:</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {lastCompletedSale?.customer_name || 'Walk-in Customer'}
              </Text>
            </View>

            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <Button
              title="Next Sale"
              onPress={() => setCheckoutModalVisible(false)}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cartBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cartBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  payNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  payNowText: {
    color: '#FF6A1A',
    fontWeight: '800',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  custChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  custText: {
    fontSize: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  payChipText: {
    fontSize: 11,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  cartItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    marginHorizontal: 8,
    fontWeight: '700',
    fontSize: 14,
  },
  itemTotal: {
    fontWeight: '800',
    fontSize: 14,
    minWidth: 60,
    textAlign: 'right',
  },
  calcBox: {
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  smallInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  grandLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  grandValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 12,
  },
  searchTextInput: {
    flex: 1,
    padding: 0,
    fontSize: 13,
  },
  prodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  prodTile: {
    width: '31.3%',
    marginHorizontal: '1%',
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 76,
  },
  tileName: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  tilePrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  receiptCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  receiptIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  receiptInvoice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  receiptDivider: {
    width: '100%',
    height: 1,
    marginVertical: 12,
  },
  receiptRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default PosBillingScreen;

