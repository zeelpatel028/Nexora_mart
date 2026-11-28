import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '../grocery_components/hooks/useFocusEffect';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useSettings } from '../../navigation/context/SettingsContext';
import { useStore } from '../../navigation/context/StoreContext';
import { billingApi, MakeBillPayload, BillItemPayload } from '../grocery_components/services/billingApi';
import { customerApi } from '../grocery_components/services/customerApi';
import { productService } from '../grocery_components/services';
import { Product } from '../../api/types';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import AppButton from '../grocery_components/components/common/AppButton';
import AppInput from '../grocery_components/components/common/AppInput';
import AppDropdown from '../grocery_components/components/common/AppDropdown';
import SearchDropdown from '../grocery_components/components/common/SearchDropdown';
import AppIcon from '../grocery_components/components/icons/AppIcon';
import TableSkeleton from '../grocery_components/components/skeletons/TableSkeleton';
import { formatCurrency } from '../grocery_components/utils/formatters';

type PosNavProp = NativeStackNavigationProp<RootStackParamList>;

interface CartLineItem {
  id: string; // unique cart row id
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  sellingPrice: number; // editable per bill row
  gstRate: number; // 0, 5, 12, 18, 28
  availableStock: number;
}

const GST_RATES = [
  { label: '0% (Exempt)', value: '0' },
  { label: '5% GST', value: '5' },
  { label: '12% GST', value: '12' },
  { label: '18% GST', value: '18' },
  { label: '28% GST', value: '28' },
];

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI / QR', value: 'UPI' },
  { label: 'Debit / Credit Card', value: 'CARD' },
  { label: 'Net Banking', value: 'NET_BANKING' },
  { label: 'Store Khata (Credit)', value: 'KHATA' },
];

export const PosBillingScreen: React.FC = () => {
  const navigation = useNavigation<PosNavProp>();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { currency, currencySymbol, playBillSound } = useSettings();
  const { currentStore } = useStore();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Customer Mode: WALK_IN vs KHATA
  const [customerType, setCustomerType] = useState<'WALK_IN' | 'KHATA'>('WALK_IN');
  const [walkInName, setWalkInName] = useState('Walk-in Customer');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAddress, setWalkInAddress] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Cart Line Items
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [billNotes, setBillNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Customer Create Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [creatingCust, setCreatingCust] = useState(false);

  // Load Catalog & Customers
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, custsRes] = await Promise.all([
        productService.getProducts({ isActive: true, limit: 200 }).catch(() => []),
        customerApi.listCustomers({ limit: 100 }).catch(() => ({ customers: [] })),
      ]);
      setProducts(prods || []);
      setCustomers(custsRes?.customers || custsRes || []);
    } catch (err) {
      console.warn('POS Data Load Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  // When selectedCustomerId changes, update selectedCustomer
  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      setSelectedCustomer(cust || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  // Add Item to Cart
  const handleSelectProduct = (selection: any) => {
    const productIdStr = typeof selection === 'string' ? selection : String(selection?.id || selection?.value || '');
    const p = products.find(
      (prod) =>
        String(prod.id) === productIdStr ||
        String(prod.sku) === productIdStr ||
        String(prod.barcode) === productIdStr
    );
    if (!p) return;

    // Check if already in cart
    const existingIndex = cartItems.findIndex((item) => item.productId === String(p.id));
    if (existingIndex > -1) {
      // Increment quantity
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartLineItem = {
        id: `${p.id}_${Date.now()}`,
        productId: String(p.id),
        name: p.product_name || p.name || 'Product',
        unit: p.unit || 'PCS',
        quantity: 1,
        sellingPrice: Number(p.selling_price || p.mrp || 0),
        gstRate: Number((p as any).tax_rate || (p as any).gst_rate || 0),
        availableStock: Number(p.current_stock || 0),
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Modify Cart Item Row
  const updateItemQty = (rowId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === rowId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartLineItem[]
    );
  };

  const updateItemCustomPrice = (rowId: string, newPriceStr: string) => {
    const val = parseFloat(newPriceStr) || 0;
    setCartItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, sellingPrice: val } : item))
    );
  };

  const updateItemGstRate = (rowId: string, rateVal: string) => {
    const val = parseFloat(rateVal) || 0;
    setCartItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, gstRate: val } : item))
    );
  };

  const updateItemExactQty = (rowId: string, qtyStr: string) => {
    const parsed = parseFloat(qtyStr);
    if (isNaN(parsed) || parsed <= 0) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, quantity: parsed } : item))
    );
  };

  const cycleItemGst = (rowId: string) => {
    const rates = [0, 5, 12, 18, 28];
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== rowId) return item;
        const idx = rates.indexOf(Number(item.gstRate || 0));
        const nextRate = rates[(idx + 1) % rates.length];
        return { ...item, gstRate: nextRate };
      })
    );
  };

  const removeItem = (rowId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== rowId));
  };

  const clearEntireCart = () => {
    setCartItems([]);
    setOverallDiscount('0');
    setPaidAmountInput('');
    setBillNotes('');
  };

  // Live Bill Calculations:
  // Taxable Amount = Selling Price / (1 + GST Rate / 100)
  // GST Amount = Selling Price - Taxable Amount
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTaxable = 0;
    let totalGst = 0;

    cartItems.forEach((item) => {
      const lineTotal = item.quantity * item.sellingPrice;
      const rate = item.gstRate || 0;
      const taxable = rate > 0 ? lineTotal / (1 + rate / 100) : lineTotal;
      const gst = lineTotal - taxable;

      subtotal += lineTotal;
      totalTaxable += taxable;
      totalGst += gst;
    });

    const discount = parseFloat(overallDiscount) || 0;
    const finalAfterDiscount = Math.max(0, subtotal - discount);
    const roundOff = Math.round(finalAfterDiscount) - finalAfterDiscount;
    const grandTotal = Math.round(finalAfterDiscount);

    // Paid & Pending
    const userPaid = paidAmountInput.trim() !== '' ? parseFloat(paidAmountInput) || 0 : grandTotal;
    const pending = Math.max(0, grandTotal - userPaid);

    return {
      subtotal,
      discount,
      totalTaxable,
      totalGst,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      roundOff,
      grandTotal,
      paidAmount: userPaid,
      pendingAmount: pending,
    };
  }, [cartItems, overallDiscount, paidAmountInput]);

  // Handle Quick Customer Create
  const handleCreateCustomer = async () => {
    if (!newCustName.trim()) {
      Alert.alert('Required', 'Please enter customer name.');
      return;
    }
    setCreatingCust(true);
    try {
      const created = await customerApi.createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim() || undefined,
      });
      setCustomers((prev) => [created, ...prev]);
      setSelectedCustomerId(created.id);
      setSelectedCustomer(created);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      Alert.alert('Success', 'Khata Customer added and selected.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create customer');
    } finally {
      setCreatingCust(false);
    }
  };

  // Submit Make Bill
  const handleMakeBill = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Bill', 'Please add at least one product to the bill.');
      return;
    }

    if (customerType === 'KHATA' && !selectedCustomerId) {
      Alert.alert('Customer Required', 'Please select a Khata customer to record debit.');
      return;
    }

    setSubmitting(true);
    try {
      const itemsPayload: BillItemPayload[] = cartItems.map((item) => ({
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        selling_price: item.sellingPrice,
        gst_rate: item.gstRate,
      }));

      const payload: MakeBillPayload = {
        customer_type: customerType,
        customer_id: customerType === 'KHATA' ? selectedCustomerId! : undefined,
        walk_in_name: customerType === 'WALK_IN' ? walkInName : selectedCustomer?.name,
        walk_in_phone: customerType === 'WALK_IN' ? walkInPhone : selectedCustomer?.phone,
        walk_in_address: customerType === 'WALK_IN' && walkInAddress.trim() ? walkInAddress.trim() : undefined,
        customer_name: customerType === 'WALK_IN' ? walkInName : selectedCustomer?.name,
        customer_phone: customerType === 'WALK_IN' ? walkInPhone : selectedCustomer?.phone,
        items: itemsPayload,
        discount_amount: totals.discount,
        paid_amount: totals.paidAmount,
        payment_method: paymentMethod,
        idempotency_key: idempotencyKey,
        notes: billNotes.trim() || undefined,
      };

      const result = await billingApi.makeBill(payload);

      // Play Sound
      playBillSound();

      // Clear Cart & rotate idempotency key for next bill
      clearEntireCart();
      setWalkInAddress('');
      setIdempotencyKey(`bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

      // Navigate to Invoice Screen directly
      navigation.navigate('Invoice', {
        invoiceId: result.invoice_id || result.id || 1,
        invoiceData: result,
      });
    } catch (err: any) {
      Alert.alert('Billing Error', err.response?.data?.detail || err.message || 'Failed to generate bill.');
    } finally {
      setSubmitting(false);
    }
  };

  const productDropdownOptions = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.product_name || p.name} (Stock: ${p.current_stock ?? 0} ${p.unit || 'PCS'}) - ${currencySymbol}${p.selling_price || p.mrp || 0}`,
        value: String(p.id),
      })),
    [products, currencySymbol]
  );

  const customerDropdownOptions = useMemo(
    () =>
      customers.map((c) => ({
        label: `${c.name} ${c.phone ? `(${c.phone})` : ''} - Bal: ${currencySymbol}${c.pending_bill_amount ?? c.total_due ?? c.balance ?? c.outstanding_balance ?? 0}`,
        value: String(c.id),
      })),
    [customers, currencySymbol]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Make Bill / POS"
        subtitle={currentStore?.name || 'Tulsi Mart POS'}
        showBack={route.name === 'PosBilling'}
        rightAction={
          cartItems.length > 0 ? (
            <TouchableOpacity onPress={clearEntireCart} style={styles.clearCartBtn}>
              <AppIcon name="Trash2" size={16} color="#EF4444" />
              <Text style={styles.clearCartText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Customer Type Selector */}
        <AppCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Customer Type</Text>
          <View style={styles.customerTypeRow}>
            <TouchableOpacity
              style={[
                styles.typeToggleBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                customerType === 'WALK_IN' && styles.typeToggleBtnActive,
              ]}
              onPress={() => setCustomerType('WALK_IN')}
            >
              <AppIcon
                name="Users"
                size={16}
                color={customerType === 'WALK_IN' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.typeToggleText,
                  { color: colors.textSecondary },
                  customerType === 'WALK_IN' && styles.typeToggleTextActive,
                ]}
              >
                Walk-in Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeToggleBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                customerType === 'KHATA' && styles.typeToggleBtnActive,
              ]}
              onPress={() => setCustomerType('KHATA')}
            >
              <AppIcon
                name="CreditCard"
                size={16}
                color={customerType === 'KHATA' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.typeToggleText,
                  { color: colors.textSecondary },
                  customerType === 'KHATA' && styles.typeToggleTextActive,
                ]}
              >
                Khata (Debit) Customer
              </Text>
            </TouchableOpacity>
          </View>

          {customerType === 'WALK_IN' ? (
            <View>
              <View style={styles.walkInRow}>
                <View style={{ flex: 1.15, marginRight: 8 }}>
                  <AppInput
                    label="Customer Name (Optional)"
                    placeholder="e.g. Rahul Sharma"
                    value={walkInName}
                    onChangeText={setWalkInName}
                    inputStyle={{ fontSize: 13 }}
                  />
                </View>
                <View style={{ flex: 0.85 }}>
                  <AppInput
                    label="Phone (Optional)"
                    placeholder="9876543210"
                    value={walkInPhone}
                    onChangeText={setWalkInPhone}
                    keyboardType="phone-pad"
                    inputStyle={{ fontSize: 13 }}
                  />
                </View>
              </View>
              <AppInput
                label="Address (Optional)"
                placeholder="e.g. Near Bus Stand, Ahmedabad"
                value={walkInAddress}
                onChangeText={setWalkInAddress}
                inputStyle={{ fontSize: 13 }}
              />
            </View>
          ) : (
            <View style={styles.khataCustomerBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.fieldLabel}>Select Khata Customer</Text>
                <TouchableOpacity
                  onPress={() => setShowAddCustomerModal(true)}
                  style={styles.quickAddCustBtn}
                >
                  <AppIcon name="Plus" size={14} color="#F57C00" />
                  <Text style={styles.quickAddCustText}>+ New Customer</Text>
                </TouchableOpacity>
              </View>

              <SearchDropdown
                label=""
                placeholder="Search Khata customer by name or phone..."
                options={customerDropdownOptions}
                selectedValue={selectedCustomerId ? String(selectedCustomerId) : ''}
                onSelect={(val: any) => setSelectedCustomerId(Number(val?.id || val?.value || val))}
              />

              {selectedCustomer && (
                <View style={styles.customerBalanceBadge}>
                  <AppIcon name="AlertCircle" size={14} color="#DC2626" />
                  <Text style={styles.balanceBadgeText}>
                    Outstanding Balance: {formatCurrency(selectedCustomer.pending_bill_amount ?? selectedCustomer.total_due ?? selectedCustomer.balance ?? selectedCustomer.outstanding_balance ?? 0, currency)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </AppCard>

        {/* 2. Add Products */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.stepTitleRow}>
            <View style={styles.stepPill}><Text style={styles.stepPillText}>2</Text></View>
            <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.textPrimary }]}>Add Products to Bill</Text>
            <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.textMuted }}>{products.length} items</Text>
          </View>

          <SearchDropdown
            label="Search Catalog"
            placeholder="Search product by name, SKU, or barcode..."
            options={productDropdownOptions}
            selectedValue=""
            onSelect={handleSelectProduct}
          />

          {products.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.miniLabel, { marginBottom: 6 }]}>QUICK ADD ITEMS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {products.slice(0, 10).map((p) => (
                  <TouchableOpacity
                    key={String(p.id)}
                    activeOpacity={0.8}
                    onPress={() => handleSelectProduct(String(p.id))}
                    style={[
                      styles.quickProdChip,
                      {
                        backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                        borderColor: '#FFE0B2',
                      },
                    ]}
                  >
                    <Text style={[styles.quickProdName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {p.product_name || p.name}
                    </Text>
                    <Text style={styles.quickProdPrice}>
                      {formatCurrency(p.selling_price || 0, '₹')} • +{p.unit || 'pc'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </AppCard>

        {/* 3. Line Items Table */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.cartHeaderRow}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepPill}><Text style={styles.stepPillText}>3</Text></View>
              <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.textPrimary }]}>
                Bill Items ({cartItems.length})
              </Text>
            </View>
            {cartItems.length > 0 ? (
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#F57C00' }}>
                {formatCurrency(totals.subtotal, '₹')}
              </Text>
            ) : null}
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <AppIcon name="ShoppingBag" size={36} color="#CBD5E1" />
              <Text style={styles.emptyCartText}>No items added to this bill yet.</Text>
              <Text style={styles.emptyCartSub}>Tap a quick item above or search catalog.</Text>
            </View>
          ) : (
            cartItems.map((item, idx) => {
              const lineTotal = item.quantity * item.sellingPrice;
              const rate = item.gstRate || 0;
              const taxable = rate > 0 ? lineTotal / (1 + rate / 100) : lineTotal;
              const gstAmt = lineTotal - taxable;

              return (
                <View key={item.id} style={styles.cartItemRow}>
                  <View style={styles.cartItemTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{idx + 1}. {item.name}</Text>
                      <Text style={styles.cartItemStock}>
                        Stock: {item.availableStock} {item.unit}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeRowBtn}>
                      <AppIcon name="X" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemControls}>
                    <View style={styles.qtyControlBox}>
                      <Text style={styles.miniLabel}>QTY ({item.unit})</Text>
                      <View style={styles.qtyStepper}>
                        <TouchableOpacity
                          onPress={() => updateItemQty(item.id, -1)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.stepperValue}
                          keyboardType="decimal-pad"
                          value={String(item.quantity)}
                          onChangeText={(t) => updateItemExactQty(item.id, t)}
                        />
                        <TouchableOpacity
                          onPress={() => updateItemQty(item.id, 1)}
                          style={[styles.stepperBtn, { backgroundColor: '#FFF3E0' }]}
                        >
                          <Text style={[styles.stepperBtnText, { color: '#F57C00' }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.priceInputBox}>
                      <Text style={styles.miniLabel}>RATE (₹)</Text>
                      <TextInput
                        style={styles.priceInput}
                        keyboardType="decimal-pad"
                        value={String(item.sellingPrice)}
                        onChangeText={(txt) => updateItemCustomPrice(item.id, txt)}
                      />
                    </View>

                    <View style={styles.gstBox}>
                      <Text style={styles.miniLabel}>GST %</Text>
                      <TouchableOpacity onPress={() => cycleItemGst(item.id)} style={styles.gstPill} activeOpacity={0.7}>
                        <Text style={styles.gstPillText}>{item.gstRate}%</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.cartItemFooter}>
                    <Text style={styles.cartItemMeta}>
                      Base: {formatCurrency(taxable, '₹')} | GST: {formatCurrency(gstAmt, '₹')}
                    </Text>
                    <Text style={styles.cartItemTotal}>
                      {formatCurrency(lineTotal, '₹')}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </AppCard>

        {/* 4. Live Calculations & Payment */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.stepTitleRow}>
            <View style={styles.stepPill}><Text style={styles.stepPillText}>4</Text></View>
            <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.textPrimary }]}>Bill Summary & Payment</Text>
          </View>

          <View style={styles.summaryHighlightBox}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Subtotal (Items Total)</Text>
              <Text style={styles.calcValue}>{formatCurrency(totals.subtotal, '₹')}</Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Bill Discount (₹)</Text>
              <TextInput
                style={styles.discountInput}
                keyboardType="decimal-pad"
                value={overallDiscount}
                onChangeText={setOverallDiscount}
                placeholder="0"
              />
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Taxable Base Value</Text>
              <Text style={styles.calcValue}>{formatCurrency(totals.totalTaxable, '₹')}</Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Total GST (CGST + SGST)</Text>
              <Text style={styles.calcValue}>{formatCurrency(totals.totalGst, '₹')}</Text>
            </View>

            <View style={[styles.calcRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(totals.grandTotal, '₹')}</Text>
            </View>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 10, marginBottom: 8 }]}>Payment Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
            {PAYMENT_METHODS.map((pm) => {
              const active = paymentMethod === pm.value;
              return (
                <TouchableOpacity
                  key={pm.value}
                  onPress={() => setPaymentMethod(pm.value)}
                  style={[
                    styles.payModePill,
                    {
                      backgroundColor: active ? '#F57C00' : colors.surfaceSubtle,
                      borderColor: active ? '#F57C00' : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.textPrimary }}>
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Paid Amount */}
          <View style={styles.paidRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <Text style={styles.fieldLabel}>Paid Amount (₹)</Text>
                <TouchableOpacity onPress={() => setPaidAmountInput(String(totals.grandTotal))}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#F57C00' }}>Full ₹{totals.grandTotal}</Text>
                </TouchableOpacity>
              </View>
              <AppInput
                placeholder={String(totals.grandTotal)}
                value={paidAmountInput}
                onChangeText={setPaidAmountInput}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Pending Balance</Text>
              <View style={styles.pendingDisplayBox}>
                <Text
                  style={[
                    styles.pendingDisplayText,
                    totals.pendingAmount > 0 && { color: '#DC2626' },
                  ]}
                >
                  {formatCurrency(totals.pendingAmount, '₹')}
                </Text>
              </View>
            </View>
          </View>

          <AppInput
            label="Bill Notes / Remarks (Optional)"
            placeholder="e.g. Delivery in evening, partial advance received"
            value={billNotes}
            onChangeText={setBillNotes}
          />

          {/* Make Bill Button */}
          <AppButton
            title={`Make Bill • ${formatCurrency(totals.grandTotal, '₹')}`}
            onPress={handleMakeBill}
            loading={submitting}
            disabled={cartItems.length === 0}
            style={styles.makeBillBtn}
          />
        </AppCard>
      </ScrollView>

      {/* Quick Add Khata Customer Modal */}
      <Modal visible={showAddCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Khata Customer</Text>
            <AppInput
              label="Customer Full Name *"
              placeholder="e.g. Mahendra Bhai Patel"
              value={newCustName}
              onChangeText={setNewCustName}
            />
            <AppInput
              label="Phone Number"
              placeholder="e.g. 9825012345"
              value={newCustPhone}
              onChangeText={setNewCustPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddCustomerModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Create & Select"
                onPress={handleCreateCustomer}
                loading={creatingCust}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 16,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F57C00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  quickProdChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    maxWidth: 160,
  },
  quickProdName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  quickProdPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57C00',
    marginTop: 2,
  },
  summaryHighlightBox: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  payModePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },
  customerTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 5,
  },
  typeToggleBtnActive: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  typeToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    flexShrink: 1,
  },
  typeToggleTextActive: {
    color: '#FFFFFF',
  },
  walkInRow: {
    flexDirection: 'row',
  },
  khataCustomerBox: {
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  quickAddCustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickAddCustText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F57C00',
  },
  customerBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  balanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyCartBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  emptyCartSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cartItemRow: {
    backgroundColor: '#F8F9FC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    padding: 12,
    marginBottom: 10,
  },
  cartItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  cartItemStock: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  removeRowBtn: {
    padding: 4,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  qtyControlBox: {
    flex: 1,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    height: 36,
  },
  stepperBtn: {
    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  priceInputBox: {
    flex: 1,
  },
  priceInput: {
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  gstBox: {
    width: 60,
  },
  gstPill: {
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gstPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F57C00',
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    paddingTop: 6,
  },
  cartItemMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57C00',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  calcLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  discountInput: {
    width: 100,
    height: 32,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  grandTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F57C00',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  pendingDisplayBox: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pendingDisplayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  makeBillBtn: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default PosBillingScreen;
