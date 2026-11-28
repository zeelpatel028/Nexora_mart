import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useSettings } from '../../navigation/context/SettingsContext';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import AppInput from '../grocery_components/components/common/AppInput';
import AppButton from '../grocery_components/components/common/AppButton';
import AppDropdown from '../grocery_components/components/common/AppDropdown';
import SearchDropdown, { SearchDropdownItem } from '../grocery_components/components/common/SearchDropdown';
import AppIcon from '../grocery_components/components/icons/AppIcon';
import groceryProductService from '../grocery_components/services/storeProductService';
import supplierApi from '../grocery_components/services/supplierApi';

const DEFAULT_GST_OPTIONS = [
  { label: '0% (Exempt)', value: '0' },
  { label: '5% GST', value: '5' },
  { label: '12% GST', value: '12' },
  { label: '18% GST', value: '18' },
  { label: '28% GST', value: '28' },
];

const DEFAULT_UNIT_OPTIONS = [
  'Piece', 'Packet', 'Kilogram', 'Gram', 'Litre', 'Millilitre',
  'Dozen', 'Box', 'Bag', 'Bottle', 'Tin', 'Pouch', 'Carton', 'Tray',
].map((u) => ({ label: u, value: u }));

export const GroceryEditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.productId || route.params?.id;
  const { colors, brandColors, isDark } = useTheme();
  const { currencySymbol } = useSettings();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [suppliers, setSuppliers] = useState<SearchDropdownItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SearchDropdownItem | null>(null);
  const [gstOptions, setGstOptions] = useState(DEFAULT_GST_OPTIONS);
  const [unitOptions, setUnitOptions] = useState(DEFAULT_UNIT_OPTIONS);

  const [purchasePrice, setPurchasePrice] = useState('0');
  const [purchaseGst, setPurchaseGst] = useState('0');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');
  const [sellingPrice, setSellingPrice] = useState('0');
  const [sellingGst, setSellingGst] = useState('0');
  const [sellingUnit, setSellingUnit] = useState('Piece');
  const [availableStock, setAvailableStock] = useState('0');
  const [lowStockEnabled, setLowStockEnabled] = useState(true);
  const [lowStockQty, setLowStockQty] = useState('5');
  const [expiryAlertEnabled, setExpiryAlertEnabled] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prod, supps, rates, units] = await Promise.all([
        productId ? groceryProductService.getProductById(productId) : null,
        supplierApi.listSuppliers({ limit: 100 }).catch(() => []),
        groceryProductService.getLookupRates().catch(() => null),
        groceryProductService.getLookupUnits().catch(() => null),
      ]);

      const mappedSuppliers = (supps || []).map((s: any) => ({
        id: s.id,
        title: s.store_name || s.company_name || s.seller_name || s.name,
        subtitle: `${s.supplier_code || 'SUP'} • ${s.seller_name || s.phone || ''}`,
      }));
      setSuppliers(mappedSuppliers);

      if (Array.isArray(rates) && rates.length > 0) {
        setGstOptions(rates.map((r: any) => ({ label: r.label, value: String(r.value) })));
      }
      if (Array.isArray(units) && units.length > 0) {
        setUnitOptions(units.map((u: string) => ({ label: u, value: u })));
      }

      if (prod) {
        setProductCode(prod.product_code || prod.sku || '');
        setName(prod.name || prod.product_name || '');
        setPurchasePrice(String(prod.purchase_price_with_tax ?? prod.purchase_price ?? 0));
        setPurchaseGst(String(prod.purchase_gst_rate ?? 0));
        setPurchaseUnit(prod.purchase_unit || prod.unit || 'Piece');
        setSellingPrice(String(prod.selling_price_with_tax ?? prod.selling_price ?? 0));
        setSellingGst(String(prod.selling_gst_rate ?? prod.tax_rate ?? 0));
        setSellingUnit(prod.selling_unit || prod.unit || 'Piece');
        setAvailableStock(String(prod.available_stock ?? prod.current_stock ?? 0));
        setLowStockEnabled(Boolean(prod.low_stock_enabled));
        setLowStockQty(String(prod.low_stock_qty ?? prod.min_stock_level ?? 5));
        setExpiryAlertEnabled(Boolean(prod.expiry_alert_enabled));

        if (prod.supplier_id) {
          const match = mappedSuppliers.find((s: SearchDropdownItem) => Number(s.id) === Number(prod.supplier_id));
          if (match) setSelectedSupplier(match);
        }
      }
    } catch (err) {
      Alert.alert('Notice', 'Could not load product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Product name is required.');
      return;
    }
    const sPrice = parseFloat(sellingPrice || '0');
    if (isNaN(sPrice) || sPrice <= 0) {
      Alert.alert('Invalid Price', 'Selling price must be greater than 0.');
      return;
    }
    setSubmitting(true);
    try {
      await groceryProductService.updateProduct(productId, {
        name: name.trim(),
        supplier_id: selectedSupplier ? Number(selectedSupplier.id) : null,
        purchase_price_with_tax: parseFloat(purchasePrice || '0') || 0,
        purchase_gst_rate: parseFloat(purchaseGst || '0') || 0,
        purchase_unit: purchaseUnit,
        selling_price_with_tax: sPrice,
        selling_unit: sellingUnit,
        selling_gst_rate: parseFloat(sellingGst || '0') || 0,
        available_stock: parseFloat(availableStock || '0') || 0,
        low_stock_enabled: lowStockEnabled,
        low_stock_qty: parseFloat(lowStockQty || '5') || 5,
        expiry_alert_enabled: expiryAlertEnabled,
      });
      Alert.alert('Updated', 'Grocery product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Remove Product', `Delete "${name}" from your grocery store?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await groceryProductService.deleteProduct(productId);
            Alert.alert('Removed', 'Product removed successfully.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete product.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Edit Product" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={brandColors.primaryOrange} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Edit Grocery Product"
        subtitle={productCode || undefined}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Package" size={18} color={brandColors.primaryOrange} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Product & Seller Details</Text>
              {productCode ? (
                <View style={[styles.codeBadge, { backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange }]}>
                  <Text style={[styles.codeBadgeText, { color: brandColors.primaryOrange }]}>{productCode}</Text>
                </View>
              ) : null}
            </View>

            <AppInput label="Product Name" value={name} onChangeText={setName} required />

            <SearchDropdown
              label="Seller / Supplier"
              placeholder="Select supplier..."
              items={suppliers}
              selectedItem={selectedSupplier}
              onSelect={setSelectedSupplier}
            />
          </AppCard>

          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="ShoppingBag" size={18} color="#2196F3" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Purchase Pricing & Tax</Text>
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label={`Purchase Price (${currencySymbol})`}
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppDropdown
                  label="Purchase GST"
                  options={gstOptions}
                  selectedValue={purchaseGst}
                  onSelect={setPurchaseGst}
                />
              </View>
            </View>
            <AppDropdown label="Purchase Unit" options={unitOptions} selectedValue={purchaseUnit} onSelect={setPurchaseUnit} />
          </AppCard>

          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Tag" size={18} color="#2EAD64" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Selling Rate & Stock</Text>
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label={`Selling Price (${currencySymbol})`}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppDropdown label="Selling Unit" options={unitOptions} selectedValue={sellingUnit} onSelect={setSellingUnit} />
              </View>
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppDropdown label="Selling GST" options={gstOptions} selectedValue={sellingGst} onSelect={setSellingGst} />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Available Stock"
                  value={availableStock}
                  onChangeText={setAvailableStock}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Bell" size={18} color={brandColors.primaryOrange} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Alerts</Text>
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Low Stock Alert</Text>
              <Switch
                value={lowStockEnabled}
                onValueChange={setLowStockEnabled}
                trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
                thumbColor={lowStockEnabled ? brandColors.primaryOrange : '#F8FAFC'}
              />
            </View>
            {lowStockEnabled ? (
              <AppInput
                label="Low Stock Quantity"
                value={lowStockQty}
                onChangeText={setLowStockQty}
                keyboardType="decimal-pad"
              />
            ) : null}
            <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Expiry Date Tracking</Text>
              <Switch
                value={expiryAlertEnabled}
                onValueChange={setExpiryAlertEnabled}
                trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
                thumbColor={expiryAlertEnabled ? brandColors.primaryOrange : '#F8FAFC'}
              />
            </View>
          </AppCard>

          <AppButton title={submitting ? 'Updating...' : 'Save Changes'} onPress={handleUpdate} loading={submitting} />
          <AppButton
            title="Delete Product"
            variant="danger"
            onPress={handleDelete}
            style={{ marginTop: 10, marginBottom: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 14, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginLeft: 8, flex: 1 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  codeBadgeText: { fontSize: 11, fontWeight: '800' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  switchTitle: { fontSize: 14, fontWeight: '600' },
});

export default GroceryEditProductScreen;
