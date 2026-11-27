import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

export const GroceryAddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, brandColors, isDark } = useTheme();
  const { currencySymbol } = useSettings();

  const [previewId, setPreviewId] = useState('TM_PRD_0001');
  const [name, setName] = useState('');
  const [suppliers, setSuppliers] = useState<SearchDropdownItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SearchDropdownItem | null>(null);

  const [gstOptions, setGstOptions] = useState(DEFAULT_GST_OPTIONS);
  const [unitOptions, setUnitOptions] = useState(DEFAULT_UNIT_OPTIONS);

  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseGst, setPurchaseGst] = useState('0');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');

  const [sellingPrice, setSellingPrice] = useState('');
  const [sellingGst, setSellingGst] = useState('0');
  const [sellingUnit, setSellingUnit] = useState('Piece');

  const [availableStock, setAvailableStock] = useState('0');
  const [lowStockEnabled, setLowStockEnabled] = useState(true);
  const [lowStockQty, setLowStockQty] = useState('5');
  const [expiryAlertEnabled, setExpiryAlertEnabled] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const loadLookups = useCallback(async () => {
    const [nextId, supps, rates, units] = await Promise.all([
      groceryProductService.previewNextId().catch(() => 'TM_PRD_0001'),
      supplierApi.listSuppliers({ limit: 100 }).catch(() => []),
      groceryProductService.getLookupRates().catch(() => null),
      groceryProductService.getLookupUnits().catch(() => null),
    ]);

    setPreviewId(nextId);
    setSuppliers(
      (supps || []).map((s: any) => ({
        id: s.id,
        title: s.store_name || s.company_name || s.seller_name || s.name,
        subtitle: `${s.supplier_code || 'SUP'} • ${s.seller_name || s.phone || ''}`,
      }))
    );
    if (Array.isArray(rates) && rates.length > 0) {
      setGstOptions(rates.map((r: any) => ({ label: r.label, value: String(r.value) })));
    }
    if (Array.isArray(units) && units.length > 0) {
      setUnitOptions(units.map((u: string) => ({ label: u, value: u })));
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the product name.');
      return;
    }
    const pPrice = parseFloat(purchasePrice || '0');
    const sPrice = parseFloat(sellingPrice || '0');
    const stockNum = parseFloat(availableStock || '0');
    if (isNaN(sPrice) || sPrice <= 0) {
      Alert.alert('Invalid Price', 'Selling price (with tax) must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await groceryProductService.createProduct({
        name: name.trim(),
        supplier_id: selectedSupplier ? Number(selectedSupplier.id) : null,
        purchase_price_with_tax: isNaN(pPrice) ? 0 : pPrice,
        purchase_gst_rate: parseFloat(purchaseGst || '0') || 0,
        purchase_unit: purchaseUnit,
        selling_price_with_tax: sPrice,
        selling_unit: sellingUnit,
        selling_gst_rate: parseFloat(sellingGst || '0') || 0,
        available_stock: isNaN(stockNum) ? 0 : stockNum,
        low_stock_enabled: lowStockEnabled,
        low_stock_qty: parseFloat(lowStockQty || '5') || 5,
        expiry_alert_enabled: expiryAlertEnabled,
      });

      Alert.alert(
        'Product Saved',
        `"${created.name}" (${created.product_code}) added successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save grocery product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Add Grocery Product"
        subtitle={`Auto ID: ${previewId}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Identity & Supplier */}
          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Package" size={18} color={brandColors.primaryOrange} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Product & Seller Details</Text>
              <View style={[styles.codeBadge, { backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange }]}>
                <Text style={[styles.codeBadgeText, { color: brandColors.primaryOrange }]}>{previewId}</Text>
              </View>
            </View>

            <AppInput
              label="1. Product Name"
              placeholder="e.g. Amul Taaza Milk 500ml, Tata Salt 1kg"
              value={name}
              onChangeText={setName}
              required
            />

            <SearchDropdown
              label="2. Seller / Supplier"
              placeholder="Search and link supplier (optional)..."
              items={suppliers}
              selectedItem={selectedSupplier}
              onSelect={setSelectedSupplier}
            />
          </AppCard>

          {/* Purchase Pricing & Tax */}
          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="ShoppingBag" size={18} color="#2196F3" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Purchase Pricing & Tax</Text>
            </View>

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label={`3. Purchase Price (${currencySymbol})`}
                  placeholder="0.00"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppDropdown
                  label="4. Purchase GST"
                  options={gstOptions}
                  selectedValue={purchaseGst}
                  onSelect={setPurchaseGst}
                />
              </View>
            </View>

            <AppDropdown
              label="5. Purchase Unit"
              options={unitOptions}
              selectedValue={purchaseUnit}
              onSelect={setPurchaseUnit}
            />
          </AppCard>

          {/* Selling Pricing & Stock */}
          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Tag" size={18} color="#2EAD64" />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Selling Rate & Opening Stock</Text>
            </View>

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label={`6. Selling Price (${currencySymbol})`}
                  placeholder="0.00"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppDropdown
                  label="7. Selling Unit"
                  options={unitOptions}
                  selectedValue={sellingUnit}
                  onSelect={setSellingUnit}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <AppDropdown
                  label="8. Selling GST"
                  options={gstOptions}
                  selectedValue={sellingGst}
                  onSelect={setSellingGst}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="9. Available Stock"
                  placeholder="0"
                  value={availableStock}
                  onChangeText={setAvailableStock}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </AppCard>

          {/* Smart Stock & Expiry Alerts */}
          <AppCard>
            <View style={styles.sectionHeader}>
              <AppIcon name="Bell" size={18} color={brandColors.primaryOrange} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>10. Smart Inventory Alerts</Text>
            </View>

            <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Low Stock Alert</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  Show warning when stock reaches threshold
                </Text>
              </View>
              <Switch
                value={lowStockEnabled}
                onValueChange={setLowStockEnabled}
                trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
                thumbColor={lowStockEnabled ? brandColors.primaryOrange : '#F8FAFC'}
              />
            </View>

            {lowStockEnabled ? (
              <AppInput
                label="Low Stock Threshold Quantity"
                placeholder="5"
                value={lowStockQty}
                onChangeText={setLowStockQty}
                keyboardType="decimal-pad"
              />
            ) : null}

            <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Expiry Date Tracking</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  Require expiry date on PO receive & enable FEFO deduction
                </Text>
              </View>
              <Switch
                value={expiryAlertEnabled}
                onValueChange={setExpiryAlertEnabled}
                trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
                thumbColor={expiryAlertEnabled ? brandColors.primaryOrange : '#F8FAFC'}
              />
            </View>
          </AppCard>

          <AppButton
            title={submitting ? 'Saving Product...' : 'Save Grocery Product'}
            onPress={handleSave}
            loading={submitting}
            style={{ marginTop: 6, marginBottom: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  switchSub: { fontSize: 12, marginTop: 2 },
});

export default GroceryAddProductScreen;
