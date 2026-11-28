import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { useAuth } from '../grocery_components/hooks/useAuth';
import { useStore } from '../../navigation/context/StoreContext';
import { storeService } from '../grocery_components/services';
import storePrefixApi from '../grocery_components/services/storePrefixApi';
import storage from '../../api/storage';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import AppInput from '../grocery_components/components/common/AppInput';
import AppButton from '../grocery_components/components/common/AppButton';
import AppIcon from '../grocery_components/components/icons/AppIcon';

type TabKey = 'basic' | 'owner' | 'address' | 'business' | 'prefixes';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Store' },
  { key: 'owner', label: 'Owner' },
  { key: 'address', label: 'Address' },
  { key: 'business', label: 'GST & Tax' },
  { key: 'prefixes', label: 'Prefixes' },
];

export const AccountDetailScreen: React.FC = () => {
  const { user, store, refreshProfile } = useAuth();
  const { storeType } = useStore();
  const { isDark, colors, brandColors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store Basic Info
  const [storeName, setStoreName] = useState(store?.name || '');
  const [storeCategory, setStoreCategory] = useState(
    store?.store_type?.name || store?.category?.name || storeType.replace('_', ' ').toUpperCase()
  );
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCode, setStoreCode] = useState(store?.id ? `TM${store.id}` : 'TM01');

  // Owner Info
  const [ownerName, setOwnerName] = useState(
    [user?.first_name || (user as any)?.firstName, user?.surname].filter(Boolean).join(' ') ||
      user?.name ||
      'Owner'
  );
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState('');

  // Store Address
  const [addressLine1, setAddressLine1] = useState(store?.address || '');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState(store?.city || '');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  // Business Info
  const [gstin, setGstin] = useState(store?.tax_number || '');
  const [panNumber, setPanNumber] = useState('');
  const [businessEmail, setBusinessEmail] = useState(store?.email || user?.email || '');
  const [businessPhone, setBusinessPhone] = useState(store?.phone || user?.phone || '');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');

  // Document Prefixes
  const [pfxInvoice, setPfxInvoice] = useState('INV');
  const [pfxDebit, setPfxDebit] = useState('KHT');
  const [pfxWalkin, setPfxWalkin] = useState('WLK');
  const [pfxSupplier, setPfxSupplier] = useState('SUP');
  const [pfxOrder, setPfxOrder] = useState('ORD');
  const [pfxProduct, setPfxProduct] = useState('PRD');
  const [pfxEmployee, setPfxEmployee] = useState('EMP');
  const [pfxReturn, setPfxReturn] = useState('RTN');
  const [pfxRefund, setPfxRefund] = useState('RFD');
  const [pfxExpense, setPfxExpense] = useState('EXP');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const cached = await storage.getItem('nmart_account_details');
        if (cached) {
          try {
            populateFields(JSON.parse(cached));
          } catch {}
        }
        const [data, pfxData] = await Promise.all([
          storeService.getStoreAccountDetails().catch(() => null),
          storePrefixApi.getPrefixes().catch(() => null),
        ]);
        if (data) {
          populateFields(data);
          await storage.setItem('nmart_account_details', JSON.stringify(data));
        }
        if (pfxData) {
          if (pfxData.invoice_prefix) setPfxInvoice(pfxData.invoice_prefix);
          if (pfxData.debit_customer_prefix) setPfxDebit(pfxData.debit_customer_prefix);
          if (pfxData.walk_in_customer_prefix) setPfxWalkin(pfxData.walk_in_customer_prefix);
          if (pfxData.supplier_prefix) setPfxSupplier(pfxData.supplier_prefix);
          if (pfxData.order_prefix) setPfxOrder(pfxData.order_prefix);
          if (pfxData.product_prefix) setPfxProduct(pfxData.product_prefix);
          if (pfxData.employee_prefix) setPfxEmployee(pfxData.employee_prefix);
          if (pfxData.return_prefix) setPfxReturn(pfxData.return_prefix);
          if (pfxData.refund_prefix) setPfxRefund(pfxData.refund_prefix);
          if (pfxData.expense_prefix) setPfxExpense(pfxData.expense_prefix);
        }
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, []);

  const populateFields = (d: any) => {
    if (!d || typeof d !== 'object') return;
    if (d.basic_store_info) {
      if (d.basic_store_info.store_name) setStoreName(d.basic_store_info.store_name);
      if (d.basic_store_info.store_category) setStoreCategory(d.basic_store_info.store_category);
      if (d.basic_store_info.store_description) setStoreDesc(d.basic_store_info.store_description);
      if (d.basic_store_info.store_code) setStoreCode(d.basic_store_info.store_code);
    }
    if (d.store_owner_details) {
      if (d.store_owner_details.owner_name) setOwnerName(d.store_owner_details.owner_name);
      if (d.store_owner_details.owner_email) setOwnerEmail(d.store_owner_details.owner_email);
      if (d.store_owner_details.owner_phone) setOwnerPhone(d.store_owner_details.owner_phone);
      if (d.store_owner_details.alternate_phone) setAltPhone(d.store_owner_details.alternate_phone);
    }
    if (d.store_address_details) {
      if (d.store_address_details.address_line1) setAddressLine1(d.store_address_details.address_line1);
      if (d.store_address_details.landmark) setLandmark(d.store_address_details.landmark);
      if (d.store_address_details.city) setCity(d.store_address_details.city);
      if (d.store_address_details.district) setDistrict(d.store_address_details.district);
      if (d.store_address_details.state) setStateName(d.store_address_details.state);
      if (d.store_address_details.pincode) setPincode(d.store_address_details.pincode);
    }
    if (d.business_details) {
      if (d.business_details.gst_number) setGstin(d.business_details.gst_number);
      if (d.business_details.pan_number) setPanNumber(d.business_details.pan_number);
      if (d.business_details.business_email) setBusinessEmail(d.business_details.business_email);
      if (d.business_details.business_phone) setBusinessPhone(d.business_details.business_phone);
    }
    if (d.store_configuration) {
      if (d.store_configuration.store_opening_time) setOpeningTime(d.store_configuration.store_opening_time);
      if (d.store_configuration.store_closing_time) setClosingTime(d.store_configuration.store_closing_time);
    }
    if (d.store_prefixes) {
      if (d.store_prefixes.invoice) setPfxInvoice(d.store_prefixes.invoice);
      if (d.store_prefixes.debit_customer) setPfxDebit(d.store_prefixes.debit_customer);
      if (d.store_prefixes.walkin_customer) setPfxWalkin(d.store_prefixes.walkin_customer);
      if (d.store_prefixes.supplier) setPfxSupplier(d.store_prefixes.supplier);
      if (d.store_prefixes.order) setPfxOrder(d.store_prefixes.order);
    }
  };

  const handleSave = async () => {
    if (!storeName.trim()) {
      Alert.alert('Validation', 'Store name cannot be empty.');
      return;
    }
    setSaving(true);
    const payload = {
      basic_store_info: {
        store_name: storeName.trim(),
        store_code: storeCode.trim(),
        store_category: storeCategory.trim(),
        store_description: storeDesc.trim(),
      },
      store_owner_details: {
        owner_name: ownerName.trim(),
        owner_email: ownerEmail.trim(),
        owner_phone: ownerPhone.trim(),
        alternate_phone: altPhone.trim(),
      },
      store_address_details: {
        address_line1: addressLine1.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        district: district.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
      },
      business_details: {
        gst_number: gstin.trim(),
        pan_number: panNumber.trim(),
        business_email: businessEmail.trim(),
        business_phone: businessPhone.trim(),
      },
      store_configuration: {
        store_opening_time: openingTime.trim(),
        store_closing_time: closingTime.trim(),
      },
      store_prefixes: {
        invoice: pfxInvoice.trim(),
        debit_customer: pfxDebit.trim(),
        walkin_customer: pfxWalkin.trim(),
        supplier: pfxSupplier.trim(),
        order: pfxOrder.trim(),
      },
    };

    try {
      await storage.setItem('nmart_account_details', JSON.stringify(payload));
      await Promise.all([
        storeService.updateStoreAccountDetails(payload).catch(() => null),
        storeService
          .updateMyStore({
            name: storeName.trim(),
            address: addressLine1.trim() || undefined,
            city: city.trim() || undefined,
            phone: businessPhone.trim() || ownerPhone.trim() || undefined,
            email: businessEmail.trim() || ownerEmail.trim() || undefined,
            tax_number: gstin.trim() || undefined,
          })
          .catch(() => null),
        storePrefixApi
          .updatePrefixes({
            invoice_prefix: pfxInvoice.trim(),
            debit_customer_prefix: pfxDebit.trim(),
            walk_in_customer_prefix: pfxWalkin.trim(),
            supplier_prefix: pfxSupplier.trim(),
            order_prefix: pfxOrder.trim(),
            product_prefix: pfxProduct.trim(),
            employee_prefix: pfxEmployee.trim(),
            return_prefix: pfxReturn.trim(),
            refund_prefix: pfxRefund.trim(),
            expense_prefix: pfxExpense.trim(),
          })
          .catch(() => null),
      ]);
      await refreshProfile().catch(() => null);
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your store account details have been saved.');
    } catch {
      Alert.alert('Notice', 'Store details saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const fullAddress =
    [addressLine1, landmark, city, stateName, pincode].filter(Boolean).join(', ') ||
    'Add your store address';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Store Account Details"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => setIsEditing((p) => !p)}
            style={[
              styles.editPill,
              {
                backgroundColor: isEditing
                  ? brandColors.primaryOrange
                  : isDark
                  ? colors.surfaceSubtle
                  : '#FFF3E0',
              },
            ]}
            activeOpacity={0.8}
          >
            <AppIcon
              name={isEditing ? 'close' : 'edit'}
              size={15}
              color={isEditing ? '#FFFFFF' : brandColors.primaryOrange}
            />
            <Text
              style={[
                styles.editPillText,
                { color: isEditing ? '#FFFFFF' : brandColors.primaryOrange },
              ]}
            >
              {isEditing ? 'Done' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={brandColors.primaryOrange} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Store Identity Summary Card */}
          <AppCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={[styles.logoBox, { backgroundColor: isDark ? '#3D240E' : '#FFF3E0' }]}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={{ width: 42, height: 42 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.storeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {storeName || 'Tulsi Mart Store'}
                </Text>
                <Text style={[styles.ownerSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  Owner: {ownerName}
                </Text>
                <View style={[styles.catBadge, { backgroundColor: colors.badgeOrangeBg }]}>
                  <Text style={[styles.catBadgeText, { color: colors.badgeOrangeText }]}>
                    {storeCategory}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoGrid, { borderTopColor: colors.borderLight }]}>
              <View style={styles.infoLine}>
                <AppIcon name="mail" size={15} color={brandColors.primaryOrange} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {ownerEmail || 'No email linked'}
                </Text>
              </View>
              <View style={styles.infoLine}>
                <AppIcon name="phone" size={15} color="#2EAD64" />
                <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {ownerPhone || businessPhone || 'No phone added'}
                </Text>
              </View>
              <View style={styles.infoLine}>
                <AppIcon name="mapPin" size={15} color="#2196F3" />
                <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {fullAddress}
                </Text>
              </View>
            </View>
          </AppCard>

          {/* Section Switcher Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map((t) => {
              const active = activeTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setActiveTab(t.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.tabChip,
                    {
                      backgroundColor: active ? brandColors.primaryOrange : colors.cardBg,
                      borderColor: active ? brandColors.primaryOrange : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Form Fields */}
          <AppCard>
            {activeTab === 'basic' && (
              <>
                <AppInput
                  label="Store Name"
                  value={storeName}
                  onChangeText={setStoreName}
                  editable={isEditing}
                  required
                />
                <AppInput
                  label="Store Category"
                  value={storeCategory}
                  editable={false}
                />
                <AppInput
                  label="Store Code"
                  value={storeCode}
                  editable={false}
                />
                <AppInput
                  label="Store Tagline / Description"
                  value={storeDesc}
                  onChangeText={setStoreDesc}
                  placeholder="Quality products & daily essentials"
                  editable={isEditing}
                />
              </>
            )}

            {activeTab === 'owner' && (
              <>
                <AppInput
                  label="Owner Full Name"
                  value={ownerName}
                  onChangeText={setOwnerName}
                  editable={isEditing}
                />
                <AppInput
                  label="Owner Email"
                  value={ownerEmail}
                  onChangeText={setOwnerEmail}
                  keyboardType="email-address"
                  editable={isEditing}
                />
                <AppInput
                  label="Primary Phone"
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
                <AppInput
                  label="Alternate Phone"
                  value={altPhone}
                  onChangeText={setAltPhone}
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </>
            )}

            {activeTab === 'address' && (
              <>
                <AppInput
                  label="Store Address Line"
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                  editable={isEditing}
                />
                <AppInput
                  label="Landmark"
                  value={landmark}
                  onChangeText={setLandmark}
                  editable={isEditing}
                />
                <AppInput
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  editable={isEditing}
                />
                <AppInput
                  label="District & State"
                  value={stateName}
                  onChangeText={setStateName}
                  editable={isEditing}
                />
                <AppInput
                  label="Pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  editable={isEditing}
                />
              </>
            )}

            {activeTab === 'business' && (
              <>
                <AppInput
                  label="GSTIN Number"
                  value={gstin}
                  onChangeText={setGstin}
                  autoCapitalize="characters"
                  placeholder="24AAAAA0000A1Z5"
                  editable={isEditing}
                />
                <AppInput
                  label="PAN Number"
                  value={panNumber}
                  onChangeText={setPanNumber}
                  autoCapitalize="characters"
                  editable={isEditing}
                />
                <AppInput
                  label="Business Contact Email"
                  value={businessEmail}
                  onChangeText={setBusinessEmail}
                  keyboardType="email-address"
                  editable={isEditing}
                />
                <AppInput
                  label="Opening & Closing Hours"
                  value={`${openingTime} - ${closingTime}`}
                  onChangeText={(val) => {
                    const [open, close] = val.split('-').map((s) => s.trim());
                    if (open) setOpeningTime(open);
                    if (close) setClosingTime(close);
                  }}
                  editable={isEditing}
                />
              </>
            )}

            {activeTab === 'prefixes' && (
              <>
                <AppInput
                  label="Invoice Prefix"
                  value={pfxInvoice}
                  onChangeText={setPfxInvoice}
                  editable={isEditing}
                />
                <AppInput
                  label="Debit Customer Prefix"
                  value={pfxDebit}
                  onChangeText={setPfxDebit}
                  editable={isEditing}
                />
                <AppInput
                  label="Walk-in Customer Prefix"
                  value={pfxWalkin}
                  onChangeText={setPfxWalkin}
                  editable={isEditing}
                />
                <AppInput
                  label="Supplier Prefix"
                  value={pfxSupplier}
                  onChangeText={setPfxSupplier}
                  editable={isEditing}
                />
                <AppInput
                  label="Purchase Order Prefix"
                  value={pfxOrder}
                  onChangeText={setPfxOrder}
                  editable={isEditing}
                />
                <AppInput
                  label="Product Prefix"
                  value={pfxProduct}
                  onChangeText={setPfxProduct}
                  editable={isEditing}
                />
                <AppInput
                  label="Employee Prefix"
                  value={pfxEmployee}
                  onChangeText={setPfxEmployee}
                  editable={isEditing}
                />
                <AppInput
                  label="Return Prefix"
                  value={pfxReturn}
                  onChangeText={setPfxReturn}
                  editable={isEditing}
                />
                <AppInput
                  label="Refund Prefix"
                  value={pfxRefund}
                  onChangeText={setPfxRefund}
                  editable={isEditing}
                />
                <AppInput
                  label="Expense Prefix"
                  value={pfxExpense}
                  onChangeText={setPfxExpense}
                  editable={isEditing}
                />
              </>
            )}

            {isEditing ? (
              <AppButton
                title="Save Account Changes"
                onPress={handleSave}
                loading={saving}
                icon={<AppIcon name="check" size={18} color="#FFFFFF" />}
                style={{ marginTop: 6 }}
              />
            ) : (
              <AppButton
                title="Edit Store Profile"
                variant="secondary"
                onPress={() => setIsEditing(true)}
                icon={<AppIcon name="edit" size={16} color={brandColors.darkOrange} />}
              />
            )}
          </AppCard>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 36 },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editPillText: { fontSize: 12.5, fontWeight: '700' },
  heroCard: { marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTitle: { fontSize: 18, fontWeight: '800' },
  ownerSub: { fontSize: 13, marginTop: 2 },
  catBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: { fontSize: 11, fontWeight: '800' },
  infoGrid: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, gap: 8 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontSize: 13 },
  tabsRow: { gap: 8, paddingVertical: 8, marginBottom: 6 },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabChipText: { fontSize: 13, fontWeight: '700' },
});

export default AccountDetailScreen;
